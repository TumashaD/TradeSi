'use server';

import { verifySession } from "@/lib/dal";
import { User } from "@/types/user";
import { Product } from "@/types/product";
import axios from "axios";
import pool from "@/lib/db";  // Import your database connection
import { Connection, RowDataPacket } from "mysql2";
const API_URL = process.env.API_URL;
import bcrypt from 'bcrypt';
import { Order, Sequelize } from 'sequelize';
import { CustomerData } from "@/types/user"; // Adjust path as needed
import * as UserTypes from "@/types/user";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { ResultSetHeader } from 'mysql2';



//**********************************************************************************************/


export async function createCustomer(customerData: CustomerData): Promise<any> {
    let connection; // Declare the connection variable here
    try {
      connection = await pool.getConnection(); // Get a connection from the pool
      const sql = `
        INSERT INTO Customer (
          Is_Guest, Password, First_Name, Last_Name, Email, Telephone, 
          House_No, Address_Line1, Address_Line2, City, Zipcode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const values = [
        customerData.isGuest,
        customerData.password,
        customerData.firstName,
        customerData.lastName,
        customerData.email,
        customerData.telephone,
        customerData.houseNo,
        customerData.addressLine1,
        customerData.addressLine2 || null,  // Optional field
        customerData.city,
        customerData.zipcode,
      ];
  
      // Execute the query
      const [result] = await connection.execute(sql, values);
      
      return result;  // Return the result (could be the insert ID or other info)
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    } finally {
      if (connection) {
        connection.release(); // Always release the connection back to the pool
      }
    }
  }
  
  //**********************************************************************************************/


  export async function updateCustomer(customerId: string, customerData: CustomerData): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query for updating customer information
        const sql = `
            UPDATE Customer SET
                Is_Guest = ?,
                Password = ?,
                First_Name = ?,
                Last_Name = ?,
                Email = ?,
                Telephone = ?,
                House_No = ?,
                Address_Line1 = ?,
                Address_Line2 = ?,
                City = ?,
                Zipcode = ?
            WHERE Customer_ID = ?
        `;
        
        const values = [
            customerData.isGuest,
            customerData.password,
            customerData.firstName,
            customerData.lastName,
            customerData.email,
            customerData.telephone,
            customerData.houseNo,
            customerData.addressLine1,
            customerData.addressLine2 || null,  // Optional field
            customerData.city,
            customerData.zipcode,
            customerId  // ID of the customer to update
        ];

        // Execute the update query
        const [result] = await connection.execute(sql, values);
        
        return result; // Return the result (could be the number of affected rows or other info)
    } catch (err) {
        console.error('Error updating customer:', err);
        throw err; // Rethrow the error to handle it later if needed
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/


/**
 * Fetch all orders placed by a specific customer.
 * @param {string} customerId - The ID of the customer whose orders to fetch.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 */
export async function getCustomerOrders(customerId: string): Promise<Order[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch orders for the specified customer
        const sql = `
            SELECT * FROM Orders
            WHERE Customer_ID = ?
        `;
        
        // Execute the query and retrieve the orders
        const [rows] = await connection.execute(sql, [customerId]);
        
        return rows as Order[]; // Return the array of orders
    } catch (error) {
        console.error('Failed to fetch orders for customer:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/


/**
 * Creates a new session in the database.
 * @param {object} sessionData - The data needed to create the session.
 * @param {number} sessionData.customerId - The ID of the customer for this session.
 * @returns {Promise<{sessionId: string, createdAt: Date, expiresAt: Date} | null>} The created session details or null if the creation fails.
 */
export async function createSession(sessionData: { customerId: number }): Promise<{ sessionId: string, createdAt: Date, expiresAt: Date } | null> {
    const sessionId = uuidv4();  // Generate a unique session ID
    const createdAt = new Date(); // Current timestamp
    const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000); // Set expiration to 1 hour later

    try {
        const connection = await pool(); // Await the connection to the database
        await connection.query(
            'INSERT INTO Session (Session_ID, CreatedAt, ExpiresAt) VALUES (?, ?, ?)',
            [sessionId, createdAt, expiresAt]
        );

        // Create a new cart for the customer if needed
        await connection.query(
            'INSERT INTO Cart (Session_ID, Customer_ID) VALUES (?, ?)',
            [sessionId, sessionData.customerId]
        );

        return { sessionId, createdAt, expiresAt }; // Return the session details
    } catch (error) {
        console.error('Failed to create session:', error);
        return null; // Return null in case of failure
    }
}

//**********************************************************************************************/



/**
 * Retrieve session details by session ID.
 * @param {string} sessionId - The ID of the session to fetch.
 * @returns {Promise<{ sessionId: bigint, createdAt: Date, expiresAt: Date } | null>} A promise that resolves to the session details or null if not found.
 */
export async function getSession(sessionId: string): Promise<{ sessionId: bigint, createdAt: Date, expiresAt: Date } | null> {
    try {
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT Session_ID as sessionId, CreatedAt as createdAt, ExpiresAt as expiresAt FROM Session WHERE Session_ID = ?',
            [sessionId]
        );

        return rows[0] ? {
            sessionId: rows[0].sessionId,
            createdAt: new Date(rows[0].createdAt),
            expiresAt: new Date(rows[0].expiresAt)
        } : null;  // Return session details or null if not found
    } catch (error) {
        console.error('Failed to fetch session:', error);
        return null;
    }
}


/**
 * Deletes a session by its Session_ID.
 * @param {string} sessionId - The ID of the session to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the session was successfully deleted, otherwise false.
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
    try {
        const connection = await pool();
        const [result] = await connection.query(
            'DELETE FROM Session WHERE Session_ID = ?',
            [sessionId]
        );

        // Check if a session was deleted (affected rows > 0)
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Failed to delete session:', error);
        return false;
    }
}


/*******************************************************************************************/

// Interface for Cart
export interface Cart extends RowDataPacket {
    Cart_ID: bigint;
    Customer_ID: bigint;
    Session_ID: bigint;
}

// Function to create a cart for a customer
export async function createCart(customerId: string): Promise<number | null> {
    try {
        const connection = await pool();

        // Check if the customer exists
        const [customerRows] = await connection.query<RowDataPacket[]>(
            'SELECT Customer_ID FROM Customer WHERE Customer_ID = ?',
            [customerId]
        );
        if (customerRows.length === 0) {
            console.error(`Customer with ID ${customerId} does not exist.`);
            return null;
        }

        // Create a new session
        const createdAt = moment().toISOString();
        const expiresAt = moment().add(1, 'day').toISOString();
        const [sessionResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO Session (CreatedAt, ExpiresAt) VALUES (?, ?)',
            [createdAt, expiresAt]
        );

        const sessionId = sessionResult.insertId;

        // Create a new cart with the session and customer ID
        const [cartResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO Cart (Session_ID, Customer_ID) VALUES (?, ?)',
            [sessionId, customerId]
        );

        console.log(`Cart created successfully with Cart ID ${cartResult.insertId}`);
        return cartResult.insertId;
    } catch (error) {
        console.error('Failed to create cart:', error);
        return null;
    }
}



/**********************************************************************************************/

// Define interfaces for Cart and CartItem
export interface CartItem extends RowDataPacket {
  itemId: bigint;
  quantity: number;
  sku: string;
  priceIncrement: number;
  itemQuantity: number;
  product: {
    title: string;
    description: string;
    imageUrl: string;
    basePrice: number;
  };
}

export interface Cart extends RowDataPacket {
  cartId: bigint;
  sessionId: bigint;
  customerId: bigint;
  items: CartItem[];
}


/**********************************************************************************************/


// Function to retrieve cart details by Cart ID
export async function getCartById(cartId: bigint): Promise<Cart | null> {
  try {
    const cartQuery = `
      SELECT c.Cart_ID as cart_id, c.Session_ID as session_id, c.Customer_ID as customer_id,
             ci.Item_ID as item_id, ci.Quantity as quantity,
             i.SKU as sku, i.price_increment, i.quantity as item_quantity,
             p.Title as title, p.Description as description, p.ImageURL as imageurl, p.Base_price as base_price
      FROM Cart c
      LEFT JOIN Cart_Item ci ON c.Cart_ID = ci.Cart_ID
      LEFT JOIN Item i ON ci.Item_ID = i.variant_id
      LEFT JOIN Product p ON i.product_id = p.Product_ID
      WHERE c.Cart_ID = ?;
    `;
    
    const [cartRows] = await pool.query<RowDataPacket[]>(cartQuery, [cartId]);

    if (cartRows.length === 0) {
      return null; // No cart found with the given ID
    }

    const cart: Cart = {
      cartId: cartRows[0].cart_id,
      sessionId: cartRows[0].session_id,
      customerId: cartRows[0].customer_id,
      items: cartRows.map(row => ({
        itemId: row.item_id,
        quantity: row.quantity,
        sku: row.sku,
        priceIncrement: row.price_increment,
        itemQuantity: row.item_quantity,
        product: {
          title: row.title,
          description: row.description,
          imageUrl: row.imageurl,
          basePrice: row.base_price,
        },
      })),
    };

    return cart;
  } catch (error) {
    console.error('Error retrieving cart by ID:', error);
    throw error;
  }
}

/*********************************************************************************************/


// Function to add an item to the cart
export async function addItemToCart(cartId: bigint, itemId: bigint, quantity: number): Promise<any> {
  let connection;
  try {
     const connection = await pool();

    // Check if the item already exists in the cart
    const [rows] = await connection.query(
      'SELECT Quantity FROM Cart_Item WHERE Cart_ID = ? AND Item_ID = ?',
      [cartId, itemId]
    );

    if (rows.length > 0) {
      // Item exists in cart; update the quantity
      const newQuantity = rows[0].Quantity + quantity;
      const [result] = await connection.query<ResultSetHeader>(
        'UPDATE Cart_Item SET Quantity = ? WHERE Cart_ID = ? AND Item_ID = ?',
        [newQuantity, cartId, itemId]
      );
      return result; // Return result of update
    } else {
      // Item does not exist in cart; insert a new record
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO Cart_Item (Cart_ID, Item_ID, Quantity) VALUES (?, ?, ?)',
        [cartId, itemId, quantity]
      );
      return result; // Return result of insertion
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release(); // Release connection back to pool
    }
  }
}

/*********************************************************************************************/



/**
 * Removes an item from the cart.
 * @param {bigint} cartId - The ID of the cart.
 * @param {bigint} itemId - The ID of the item to remove from the cart.
 * @returns {Promise<boolean>} - A promise that resolves to true if the item was removed successfully, otherwise false.
 */
export async function removeItemFromCart(cartId: bigint, itemId: bigint): Promise<boolean> {
  let connection: Connection | null = null;
  try {
    const  connection = await pool(); // Establish a connection to the database

    // Delete the item from the Cart_Item table
    const [result] = await connection.query<ResultSetHeader>(
      'DELETE FROM Cart_Item WHERE Cart_ID = ? AND Item_ID = ?',
      [cartId, itemId]
    );

    // Check if the item was deleted (affected rows > 0)
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error; // Rethrow the error to be handled by the caller
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
}


/*********************************************************************************************/



/**
 * Update the quantity of an item in the cart. If the quantity is zero or less, remove the item from the cart.
 * @param {bigint} cartId - The ID of the cart.
 * @param {bigint} itemId - The ID of the item to update.
 * @param {number} quantity - The new quantity for the item.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful.
 */
export async function updateCartItemQuantity(cartId: bigint, itemId: bigint, quantity: number): Promise<boolean> {
    let connection;
    try {
        connection = await pool.getConnection();

        if (quantity <= 0) {
            // Remove the item from the cart if quantity is zero or less
            const [deleteResult] = await connection.query<ResultSetHeader>(
                'DELETE FROM Cart_Item WHERE Cart_ID = ? AND Item_ID = ?',
                [cartId, itemId]
            );
            return deleteResult.affectedRows > 0; // Return true if an item was deleted
        } else {
            // Update the item quantity in the cart
            const [updateResult] = await connection.query<ResultSetHeader>(
                'UPDATE Cart_Item SET Quantity = ? WHERE Cart_ID = ? AND Item_ID = ?',
                [quantity, cartId, itemId]
            );
            return updateResult.affectedRows > 0; // Return true if the quantity was updated
        }
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
    }
}

/*********************************************************************************************/


/**
 * Remove all items from the cart.
 * @param {bigint} cartId - The ID of the cart to clear.
 * @returns {Promise<boolean>} - A promise that resolves to true if the cart was cleared successfully, otherwise false.
 */
export async function clearCart(cartId: bigint): Promise<boolean> {
    let connection;
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Delete all items associated with the specified cart ID
        const [result] = await connection.query<ResultSetHeader>(
            'DELETE FROM Cart_Item WHERE Cart_ID = ?',
            [cartId]
        );

        // Check if items were deleted (affected rows > 0)
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error; // Rethrow the error to handle it later if needed
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
    }
}

/*********************************************************************************************/



export interface OrderData {
  cartId: bigint;
  paymentId: bigint;
  deliveryId: bigint;
  houseNo: string;
  addressLine1: string;
  addressLine2?: string | null; // Optional
  city: string;
  province: string;
  zipcode: number;
}

/**
 * Creates a new order in the database based on the provided cart details and order data.
 * @param {OrderData} orderData - The order information, including cart, payment, and delivery IDs.
 * @returns {Promise<number | null>} The new Order ID, or null if creation failed.
 */
export async function createOrder(orderData: OrderData): Promise<number | null> {
  let connection;
  try {
    connection = await pool.getConnection();

    // Ensure the cart exists and has items before proceeding
    const [cartRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM Cart WHERE Cart_ID = ?',
      [orderData.cartId]
    );

    if (cartRows.length === 0) {
      console.error('Cart does not exist or is empty');
      return null;
    }

    // Check the payment exists
    const [paymentRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM Payment WHERE Payment_ID = ?',
      [orderData.paymentId]
    );

    if (paymentRows.length === 0) {
      console.error('Payment method is not valid');
      return null;
    }

    // Check the delivery option exists
    const [deliveryRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM Delivery WHERE Delivery_ID = ?',
      [orderData.deliveryId]
    );

    if (deliveryRows.length === 0) {
      console.error('Delivery option is not valid');
      return null;
    }

    // Set the order date
    const orderDate = moment().format('YYYY-MM-DD HH:mm:ss');

    // Insert the order details
    const [orderResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO \`Order\` (
        Cart_ID, Payment_ID, Delivery_ID, Date, House_No, Address_Line1, Address_Line2, City, Province, Zipcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderData.cartId,
        orderData.paymentId,
        orderData.deliveryId,
        orderDate,
        orderData.houseNo,
        orderData.addressLine1,
        orderData.addressLine2 || null,
        orderData.city,
        orderData.province,
        orderData.zipcode
      ]
    );

    // Return the new Order ID if creation succeeded
    return orderResult.insertId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/*********************************************************************************************/

//**********************************************************************************************/


/**
 * Retrieve order details by order ID.
 * @param {string} orderId - The ID of the order to fetch.
 * @returns {Promise<any>} A promise that resolves to the order details or null if not found.
 */
export async function getOrderById(orderId: string): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch the order details by order ID
        const sql = `
            SELECT o.Order_ID, o.Date, o.House_No, o.Address_Line1, o.Address_Line2, 
                   o.City, o.Province, o.Zipcode, 
                   p.Payment_Type, p.Price, 
                   d.Delivery_Type, d.Status
            FROM \`Order\` o
            LEFT JOIN Payment p ON o.Payment_ID = p.Payment_ID
            LEFT JOIN Delivery d ON o.Delivery_ID = d.Delivery_ID
            WHERE o.Order_ID = ?
        `;
        
        // Execute the query and retrieve the order details
        const [rows] = await connection.execute(sql, [orderId]);
        
        // Check if an order was found
        if (rows.length > 0) {
            return rows[0]; // Return the order details
        } else {
            return null; // Return null if the order was not found
        }
    } catch (error) {
        console.error('Failed to fetch order by ID:', error);
        return null; // Return null in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Fetch all orders for a specific customer.
 * @param {string} customerId - The ID of the customer whose orders to fetch.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 */
export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch orders for the specified customer
        const sql = `
            SELECT o.Order_ID, o.Cart_ID, o.Payment_ID, o.Delivery_ID, o.Date,
                   o.House_No, o.Address_Line1, o.Address_Line2, o.City, o.Province, o.Zipcode
            FROM \`Order\` o
            JOIN Cart c ON o.Cart_ID = c.Cart_ID
            WHERE c.Customer_ID = ?
        `;
        
        // Execute the query and retrieve the orders
        const [rows] = await connection.execute(sql, [customerId]);
        
        return rows as Order[]; // Return the array of orders
    } catch (error) {
        console.error('Failed to fetch orders for customer:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}


//**********************************************************************************************/

//**********************************************************************************************/


/**
 * Update the status of an order.
 * @param {string} orderId - The ID of the order to update.
 * @param {string} status - The new status to set for the order.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, otherwise false.
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to update the order status
        const sql = `
            UPDATE \`Order\`
            SET Status = ?
            WHERE Order_ID = ?
        `;
        
        // Execute the update query
        const [result] = await connection.execute(sql, [status, orderId]);
        
        // Check if any rows were affected
        return result.affectedRows > 0; // Return true if the order was updated, false otherwise
    } catch (error) {
        console.error('Failed to update order status:', error);
        return false; // Return false in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/

export async function deleteOrder(orderId: string): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to delete the order
        const sql = `
            DELETE FROM \`Order\`
            WHERE Order_ID = ?
        `;
        
        // Execute the delete query
        const [result] = await connection.execute(sql, [orderId]);
        
        // Check if any rows were affected
        return result.affectedRows > 0; // Return true if the deletion was successful
    } catch (error) {
        console.error('Failed to delete order:', error);
        return false; // Return false in case of failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/


/**
 * Retrieve all products from the database.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getAllProducts(): Promise<Product[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to fetch all products
        const sql = `SELECT * FROM Product`;

        // Execute the query and retrieve the products
        const [rows] = await connection.execute(sql);

        return rows as Product[]; // Return the array of products
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Retrieve product details by ID.
 * @param {string} productId - The ID of the product to retrieve.
 * @returns {Promise<Product | null>} A promise that resolves to the product details or null if not found.
 */
export async function getProductById(productId: string): Promise<Product | null> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch product details for the specified product ID
        const sql = `
            SELECT * FROM Product
            WHERE Product_ID = ?
        `;
        
        // Execute the query and retrieve the product details
        const [rows] = await connection.execute(sql, [productId]);
        
        // Return the product details if found, else return null
        return rows[0] ? rows[0] as Product : null;
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        return null; // Return null in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Retrieves products by category ID.
 * @param {number} categoryId - The ID of the category to fetch products from.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch products for the specified category
        const sql = `
            SELECT p.Product_ID, p.Title, p.Description, p.ImageURL, p.Base_Price
            FROM Product p
            JOIN Product_Category pc ON p.Product_ID = pc.Product_ID
            WHERE pc.Category_ID = ?
        `;
        
        // Execute the query and retrieve the products
        const [rows] = await connection.execute(sql, [categoryId]);
        
        return rows as Product[]; // Return the array of products
    } catch (error) {
        console.error('Failed to fetch products for category:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}


//**********************************************************************************************/

//**********************************************************************************************/


/**
 * Creates a new product in the database.
 * @param {object} productData - The data needed to create the product.
 * @param {string} productData.title - The title of the product.
 * @param {string} productData.description - The description of the product.
 * @param {string} productData.imageURL - The URL of the product image.
 * @param {number} productData.basePrice - The base price of the product.
 * @returns {Promise<any>} A promise that resolves to the result of the insert operation.
 */
export async function createProduct(productData: {
    title: string;
    description: string;
    imageURL: string;
    basePrice: number;
}): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        const sql = `
            INSERT INTO Product (Title, Description, ImageURL, Base_Price)
            VALUES (?, ?, ?, ?)
        `;

        const values = [
            productData.title,
            productData.description,
            productData.imageURL,
            productData.basePrice
        ];

        // Execute the query and return the result
        const [result] = await connection.execute(sql, values);
        return result;  // Return the result of the insert operation (could include insert ID)
    } catch (err) {
        console.error('Error creating product:', err);
        throw err;  // Rethrow the error for handling later
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/

export async function updateProduct(productId: number, updatedData: Partial<Product>): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query for updating product information
        const sql = `
            UPDATE Product SET
                Title = ?,
                Description = ?,
                ImageURL = ?,
                Base_Price = ?
            WHERE Product_ID = ?
        `;

        // Set the values from the updatedData object. Use null for optional fields if not provided.
        const values = [
            updatedData.title || null,
            updatedData.description || null,
            updatedData.imageURL || null,
            updatedData.basePrice || null,
            productId  // ID of the product to update
        ];

        // Execute the update query
        const [result] = await connection.execute(sql, values);
        
        return result; // Return the result (could be the number of affected rows or other info)
    } catch (err) {
        console.error('Error updating product:', err);
        throw err; // Rethrow the error to handle it later if needed
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/


//**********************************************************************************************/


/**
 * Deletes a product from the database by its ID.
 * @param {number} productId - The ID of the product to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the product was successfully deleted, otherwise false.
 */
export async function deleteProduct(productId: number): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to delete the product
        const sql = `
            DELETE FROM Product
            WHERE Product_ID = ?
        `;

        // Execute the query and check for affected rows
        const [result] = await connection.execute(sql, [productId]);
        
        // Check if a product was deleted (affected rows > 0)
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Failed to delete product:', error);
        return false; // Return false in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Search products by a keyword in title or description.
 * @param {string} searchQuery - The keyword to search for.
 * @returns {Promise<Product[]>} A promise that resolves to an array of matching products.
 */
export async function searchProducts(searchQuery: string): Promise<Product[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to search for products by title or description
        const sql = `
            SELECT * FROM Product
            WHERE Title LIKE ? OR Description LIKE ?
        `;
        
        const values = [`%${searchQuery}%`, `%${searchQuery}%`]; // Use wildcards for partial matching

        // Execute the query and retrieve the matching products
        const [rows] = await connection.execute(sql, values);
        
        return rows as Product[]; // Return the array of matching products
    } catch (error) {
        console.error('Failed to search products:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Retrieve all categories from the database.
 * @returns {Promise<Category[]>} A promise that resolves to an array of categories.
 */
export async function getAllCategories(): Promise<Category[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to fetch all categories
        const sql = `SELECT * FROM Category`;

        // Execute the query and retrieve the categories
        const [rows] = await connection.execute(sql);

        return rows as Category[]; // Return the array of categories
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}


//**********************************************************************************************/


//**********************************************************************************************/

/**
 * Fetch category details by category ID.
 * @param {string} categoryId - The ID of the category to fetch.
 * @returns {Promise<Category | null>} A promise that resolves to the category details or null if not found.
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch the category by ID
        const sql = `
            SELECT Category_ID, Name, Parent_Category_ID 
            FROM Category 
            WHERE Category_ID = ?
        `;
        
        // Execute the query and retrieve the category
        const [rows] = await connection.execute(sql, [categoryId]);
        
        // Check if a category was found and return it
        if (rows.length > 0) {
            return rows[0] as Category; // Return the category details
        } else {
            return null; // Return null if no category found
        }
    } catch (error) {
        console.error('Failed to fetch category by ID:', error);
        return null; // Return null in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Creates a new product category.
 * @param {string} categoryName - The name of the category to be created.
 * @param {number} parentCategoryId - The ID of the parent category (optional).
 * @returns {Promise<any>} A promise that resolves to the result of the insertion.
 */
export async function createCategory(categoryData: { name: string; parentCategoryId?: number }): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to insert a new category
        const sql = `
            INSERT INTO Category (Name, Parent_Category_ID)
            VALUES (?, ?)
        `;

        const values = [
            categoryData.name,
            categoryData.parentCategoryId || null // Optional field, can be null
        ];

        // Execute the insertion query
        const [result] = await connection.execute(sql, values);
        
        return result; // Return the result (could be the insert ID or other info)
    } catch (err) {
        console.error('Error creating category:', err);
        throw err; // Rethrow the error to handle it later if needed
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/

export async function updateCategory(categoryId: string, updatedData: { name: string; parentCategoryId?: string | null }): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query for updating category information
        const sql = `
            UPDATE Category SET
                Name = ?,
                Parent_Category_ID = ?
            WHERE Category_ID = ?
        `;

        const values = [
            updatedData.name,
            updatedData.parentCategoryId || null, // Optional field, can be null
            categoryId  // ID of the category to update
        ];

        // Execute the update query
        const [result] = await connection.execute(sql, values);
        
        return result; // Return the result (could be the number of affected rows or other info)
    } catch (err) {
        console.error('Error updating category:', err);
        throw err; // Rethrow the error to handle it later if needed
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/


/**
 * Deletes a category from the Category table by its ID.
 * @param {number} categoryId - The ID of the category to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the category was successfully deleted, otherwise false.
 */
export async function deleteCategory(categoryId: number): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to delete the category
        const sql = `
            DELETE FROM Category WHERE Category_ID = ?
        `;

        // Execute the delete query
        const [result] = await connection.execute(sql, [categoryId]);

        // Check if a category was deleted (affected rows > 0)
        return result.affectedRows > 0; 
    } catch (error) {
        console.error('Failed to delete category:', error);
        return false; // Return false in case of failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/


/**
 * Retrieve all variants for a specific product.
 * @param {string} productId - The ID of the product whose variants to fetch.
 * @returns {Promise<any[]>} A promise that resolves to an array of product variants.
 */
export async function getVariantsByProduct(productId: string): Promise<any[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch variants for the specified product
        const sql = `
            SELECT i.Variant_ID, i.SKU, i.Price_Increment, i.Quantity
            FROM Item i
            WHERE i.Product_ID = ?
        `;
        
        // Execute the query and retrieve the variants
        const [rows] = await connection.execute(sql, [productId]);
        
        return rows; // Return the array of product variants
    } catch (error) {
        console.error('Failed to fetch variants for product:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/

export async function createVariant(variantData: {
    productId: number;
    sku: string;
    priceIncrement: number;
    quantity: number;
}): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query for inserting a new variant
        const sql = `
            INSERT INTO Item (Product_ID, SKU, Price_Increment, Quantity)
            VALUES (?, ?, ?, ?)
        `;
        
        const values = [
            variantData.productId,
            variantData.sku,
            variantData.priceIncrement,
            variantData.quantity
        ];

        // Execute the insert query
        const [result] = await connection.execute(sql, values);
        
        return result; // Return the result (could be the insert ID or other info)
    } catch (err) {
        console.error('Error creating variant:', err);
        throw err; // Rethrow the error to handle it later if needed
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Fetch all available product attributes from the database.
 * @returns {Promise<Attribute[]>} A promise that resolves to an array of attributes.
 */
export async function getAllAttributes(): Promise<UserTypes.Attribute[]> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch all attributes
        const sql = `
            SELECT 
                Attribute_ID as attributeId,
                Type_ID as typeId,
                Value as value
            FROM Attribute
        `;
        
        // Execute the query and retrieve the attributes
        const [rows] = await connection.execute(sql);
        
        return rows as UserTypes.Attribute[]; // Return the array of attributes
    } catch (error) {
        console.error('Failed to fetch attributes:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Adds an attribute to an item.
 * @param {number} itemId - The ID of the item to which the attribute will be added.
 * @param {number} attributeId - The ID of the attribute to add.
 * @returns {Promise<boolean>} A promise that resolves to true if the attribute was successfully added, otherwise false.
 */
export async function addAttributeToItem(itemId: number, attributeId: number): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to insert the attribute for the item
        const sql = `
            INSERT INTO Item_Variant (Item_ID, Variant_ID)
            VALUES (?, ?)
        `;
        
        // Execute the insert query
        const [result] = await connection.execute(sql, [itemId, attributeId]);
        
        // Check if a new entry was created (affected rows > 0)
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Failed to add attribute to item:', error);
        return false; // Return false in case of failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}


//**********************************************************************************************/

/**
 * Removes an attribute from an item in the Product_Attribute table.
 * @param {number} productId - The ID of the product from which the attribute should be removed.
 * @param {number} attributeId - The ID of the attribute to be removed.
 * @returns {Promise<boolean>} A promise that resolves to true if the attribute was successfully removed, otherwise false.
 */
export async function removeAttributeFromItem(productId: number, attributeId: number): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to delete the attribute from the Product_Attribute table
        const sql = `
            DELETE FROM Product_Attribute 
            WHERE Product_ID = ? AND Attribute_ID = ?
        `;
        
        // Execute the delete query
        const [result] = await connection.execute(sql, [productId, attributeId]);

        // Check if an attribute was deleted (affected rows > 0)
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Failed to remove attribute from item:', error);
        return false; // Return false in case of failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}


//**********************************************************************************************/

//**********************************************************************************************/


/**
 * Creates a new payment for an order.
 * @param {Object} paymentData - The data needed to create the payment.
 * @param {string} paymentData.paymentType - The type of payment (e.g., "Credit Card").
 * @param {number} paymentData.cardId - The ID of the card being used for payment.
 * @param {string} paymentData.price - The total price for the order.
 * @returns {Promise<number | null>} The ID of the created payment or null if the creation fails.
 */
export async function createPayment(paymentData: { paymentType: string, cardId: number, price: string }): Promise<number | null> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to insert the payment
        const sql = `
            INSERT INTO Payment (Payment_Type, Card_ID, Price)
            VALUES (?, ?, ?)
        `;
        
        const values = [
            paymentData.paymentType,
            paymentData.cardId,
            paymentData.price,
        ];

        // Execute the payment insertion query
        const [result] = await connection.execute<ResultSetHeader>(sql, values);
        
        // Return the newly created Payment_ID
        return result.insertId; 
    } catch (error) {
        console.error('Failed to create payment:', error);
        return null; // Return null in case of failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Retrieve payment details by Payment_ID.
 * @param {string} paymentId - The ID of the payment to fetch.
 * @returns {Promise<{ paymentId: bigint, paymentType: string, cardId: bigint, price: string } | null>} A promise that resolves to the payment details or null if not found.
 */
export async function getPaymentById(paymentId: string): Promise<{ paymentId: bigint, paymentType: string, cardId: bigint, price: string } | null> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch payment details by paymentId
        const sql = `
            SELECT Payment_ID AS paymentId, Payment_Type AS paymentType, Card_ID AS cardId, Price AS price 
            FROM Payment 
            WHERE Payment_ID = ?
        `;
        
        // Execute the query and retrieve the payment details
        const [rows] = await connection.execute(sql, [paymentId]);
        
        // Check if a payment was found and return it
        return rows[0] ? {
            paymentId: rows[0].paymentId,
            paymentType: rows[0].paymentType,
            cardId: rows[0].cardId,
            price: rows[0].price
        } : null;  // Return null if no payment was found
    } catch (error) {
        console.error('Failed to fetch payment details:', error);
        return null; // Return null in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}


//**********************************************************************************************/

/**
 * Deletes a payment by its Payment_ID.
 * @param {number} paymentId - The ID of the payment to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the payment was successfully deleted, otherwise false.
 */
export async function deletePayment(paymentId: number): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to delete the payment
        const sql = 'DELETE FROM Payment WHERE Payment_ID = ?';
        
        // Execute the delete query
        const [result] = await connection.execute(sql, [paymentId]);

        // Check if a payment was deleted (affected rows > 0)
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Failed to delete payment:', error);
        return false; // Return false in case of failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/

export async function createDelivery(deliveryData: { deliveryType: string; status: string }): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to insert a new delivery record
        const sql = `
            INSERT INTO Delivery (Delivery_Type, Status)
            VALUES (?, ?)
        `;
        
        const values = [
            deliveryData.deliveryType,
            deliveryData.status
        ];

        // Execute the insert query
        const [result] = await connection.execute(sql, values);
        
        return result; // Return the result (could be the insert ID or other info)
    } catch (err) {
        console.error('Error creating delivery:', err);
        throw err; // Rethrow the error to handle it later if needed
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Retrieve delivery details by delivery ID.
 * @param {string} deliveryId - The ID of the delivery to fetch.
 * @returns {Promise<{ deliveryId: bigint, deliveryType: string, status: string } | null>} A promise that resolves to the delivery details or null if not found.
 */
export async function getDeliveryById(deliveryId: string): Promise<{ deliveryId: bigint, deliveryType: string, status: string } | null> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to fetch delivery details for the specified delivery ID
        const sql = `
            SELECT Delivery_ID as deliveryId, Delivery_Type as deliveryType, Status as status
            FROM Delivery
            WHERE Delivery_ID = ?
        `;
        
        // Execute the query and retrieve the delivery details
        const [rows] = await connection.execute(sql, [deliveryId]);
        
        return rows[0] ? {
            deliveryId: rows[0].deliveryId,
            deliveryType: rows[0].deliveryType,
            status: rows[0].status
        } : null; // Return delivery details or null if not found
    } catch (error) {
        console.error('Failed to fetch delivery:', error);
        return null; // Return null in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

//**********************************************************************************************/


/**
 * Updates the delivery status for a specific delivery.
 * @param {number} deliveryId - The ID of the delivery to update.
 * @param {string} status - The new status to set (e.g., 'pending', 'shipped', 'delivered').
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, otherwise false.
 */
export async function updateDeliveryStatus(deliveryId: number, status: string): Promise<boolean> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to update the delivery status
        const sql = `
            UPDATE Delivery
            SET Status = ?
            WHERE Delivery_ID = ?
        `;

        // Execute the update query
        const [result] = await connection.execute(sql, [status, deliveryId]);

        // Check if the delivery status was updated (affected rows > 0)
        return result.affectedRows > 0; 
    } catch (err) {
        console.error('Error updating delivery status:', err);
        return false; // Return false in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Calculate the total price of all items in the cart.
 * @param {number} cartId - The ID of the cart to calculate the total for.
 * @returns {Promise<number>} A promise that resolves to the total price.
 */
export async function getCartTotal(cartId: number): Promise<number> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare the SQL query to calculate the total price of items in the cart
        const sql = `
            SELECT SUM(i.Price_Increment + p.Base_Price) * ci.Quantity AS total
            FROM Cart_Item ci
            JOIN Item i ON ci.Item_ID = i.Variant_ID
            JOIN Product p ON i.Product_ID = p.Product_ID
            WHERE ci.Cart_ID = ?
            GROUP BY ci.Cart_ID
        `;

        // Execute the query and retrieve the total price
        const [rows] = await connection.execute(sql, [cartId]);
        
        // If rows exist, return the total, else return 0
        return rows[0] ? parseFloat(rows[0].total) : 0; 
    } catch (error) {
        console.error('Failed to calculate cart total:', error);
        return 0; // Return 0 in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Calculate the total price of an order.
 * @param {string} orderId - The ID of the order for which to calculate the total.
 * @returns {Promise<number>} A promise that resolves to the total price of the order.
 */
export async function getOrderTotal(orderId: string): Promise<number> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Prepare the SQL query to calculate the total price for the specified order
        const sql = `
            SELECT SUM(Item.Price_Increment * Cart_Item.Quantity) AS Total
            FROM Cart_Item
            JOIN Item ON Cart_Item.Item_ID = Item.Item_ID
            JOIN Cart ON Cart_Item.Cart_ID = Cart.Cart_ID
            JOIN \`Order\` ON Cart.Cart_ID = \`Order\`.Cart_ID
            WHERE \`Order\`.Order_ID = ?
            GROUP BY \`Order\`.Order_ID
        `;
        
        // Execute the query and retrieve the total price
        const [rows] = await connection.execute(sql, [orderId]);
        
        // If no rows are returned, total price is 0
        return rows[0] ? parseFloat(rows[0].Total) : 0;
    } catch (error) {
        console.error('Failed to calculate order total:', error);
        return 0; // Return 0 in case of an error
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Apply a discount to the cart.
 * @param {string} cartId - The ID of the cart to apply the discount to.
 * @param {string} discountCode - The discount code to apply.
 * @returns {Promise<{ newTotal: number, success: boolean }>} - The new total after discount and success status.
 */
export async function applyDiscount(cartId: string, discountCode: string): Promise<{ newTotal: number; success: boolean }> {
    let connection;
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        
        // Step 1: Fetch the discount details using the discount code
        const [discountRows] = await connection.execute(`
            SELECT Discount_Amount, Is_Percentage, Expiration_Date
            FROM Discount
            WHERE Discount_Code = ? AND Expiration_Date > NOW()
        `, [discountCode]);

        if (discountRows.length === 0) {
            return { newTotal: 0, success: false }; // Discount code not found or expired
        }

        const discount = discountRows[0];
        
        // Step 2: Fetch the current total from the cart
        const [cartRows] = await connection.execute(`
            SELECT SUM(i.Price_Increment * ci.Quantity) AS total
            FROM Cart_Item ci
            JOIN Item i ON ci.Item_ID = i.Item_ID
            WHERE ci.Cart_ID = ?
        `, [cartId]);

        const currentTotal = cartRows[0]?.total || 0; // Get current total, default to 0

        // Step 3: Calculate the new total after applying the discount
        let newTotal = currentTotal;

        if (discount.Is_Percentage) {
            const discountAmount = (discount.Discount_Amount / 100) * currentTotal; // Calculate percentage discount
            newTotal = Math.max(currentTotal - discountAmount, 0); // Ensure total doesn't go below 0
        } else {
            newTotal = Math.max(currentTotal - discount.Discount_Amount, 0); // Apply fixed discount
        }

        // Step 4: Optionally, update the cart with the new total
        // (Assuming you have a field to store the total in your Cart table)
        await connection.execute(`
            UPDATE Cart
            SET Total = ?
            WHERE Cart_ID = ?
        `, [newTotal, cartId]);

        return { newTotal, success: true }; // Return the new total and success status
    } catch (error) {
        console.error('Failed to apply discount:', error);
        return { newTotal: 0, success: false }; // Return failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}

//**********************************************************************************************/

/**
 * Generates an invoice for a specific order.
 * @param {string} orderId - The ID of the order for which to generate the invoice.
 * @returns {Promise<any>} A promise that resolves to the invoice data or null if not found.
 */
export async function generateInvoice(orderId: string): Promise<any> {
    let connection; // Declare the connection variable here
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Prepare SQL queries to fetch the order, payment, delivery, and customer details
        const sqlOrder = `
            SELECT * FROM \`Order\`
            WHERE Order_ID = ?
        `;

        const sqlPayment = `
            SELECT * FROM Payment
            WHERE Payment_ID = (
                SELECT Payment_ID FROM \`Order\`
                WHERE Order_ID = ?
            )
        `;

        const sqlDelivery = `
            SELECT * FROM Delivery
            WHERE Delivery_ID = (
                SELECT Delivery_ID FROM \`Order\`
                WHERE Order_ID = ?
            )
        `;

        const sqlCustomer = `
            SELECT * FROM Customer
            WHERE Customer_ID = (
                SELECT Customer_ID FROM Cart
                WHERE Cart_ID = (
                    SELECT Cart_ID FROM \`Order\`
                    WHERE Order_ID = ?
                )
            )
        `;

        // Execute the queries
        const [orderRows] = await connection.execute(sqlOrder, [orderId]);
        const [paymentRows] = await connection.execute(sqlPayment, [orderId]);
        const [deliveryRows] = await connection.execute(sqlDelivery, [orderId]);
        const [customerRows] = await connection.execute(sqlCustomer, [orderId]);

        // Check if order exists
        if (orderRows.length === 0) {
            return null; // No order found
        }

        // Extract details from the results
        const order = orderRows[0];
        const payment = paymentRows.length > 0 ? paymentRows[0] : null;
        const delivery = deliveryRows.length > 0 ? deliveryRows[0] : null;
        const customer = customerRows.length > 0 ? customerRows[0] : null;

        // Prepare the invoice data
        const invoice = {
            orderId: order.Order_ID,
            date: order.Date,
            customer: customer ? {
                name: `${customer.First_Name} ${customer.Last_Name}`,
                email: customer.Email,
                telephone: customer.Telephone,
                address: {
                    houseNo: order.House_No,
                    line1: order.Address_Line1,
                    line2: order.Address_Line2,
                    city: order.City,
                    zipcode: order.Zipcode,
                }
            } : null,
            payment: payment ? {
                type: payment.Payment_Type,
                amount: payment.Price,
            } : null,
            delivery: delivery ? {
                type: delivery.Delivery_Type,
                status: delivery.Status,
            } : null,
        };

        return invoice; // Return the invoice data
    } catch (error) {
        console.error('Failed to generate invoice:', error);
        return null; // Return null in case of failure
    } finally {
        if (connection) {
            connection.release(); // Always release the connection back to the pool
        }
    }
}
