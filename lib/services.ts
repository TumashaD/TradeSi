'use server';

import { verifySession } from "@/lib/dal";
import { User } from "@/types/user";
import { Product } from "@/types/product";
import axios from "axios";
import pool from "@/lib/db";  // Import your database connection
import { RowDataPacket } from "mysql2";
const API_URL = process.env.API_URL;



/**
 * Getting a get Current User  from fake store API
 * @returns {Promise<User> | null} A promise that resolves to the fetched user.
 */
export async function getCurrentUser(): Promise<User | null> {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    const session = await verifySession();
    if (!session) return null;
    const { isAdmin, id } = session;
    try {
        const response = await axios.get<User>(`${API_URL}/users/${id}`);
        const { password,email, ...rest} = response.data;
        rest.isAdmin = isAdmin;
        return { ...rest};
    } catch (error) {
        console.error(`Failed to fetch User with ID ${id}:`, error);
        return null;
    }
}


/**
 * Getting a single product from fake store API
 * @param {string} id - The ID of the product to fetch.
 * @returns {Promise<Product> | null} A promise that resolves to the fetched product.
 */
export async function getProduct(id: string): Promise<Product | null> {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    const session = await verifySession();
    if (!session) return null;

    try {
        const response = await axios.get<Product>(`${API_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        return null;
    }
}


/**
 *  Getting all products from fake store API
 *
 * @export
 * @param {string} [category]
 * @return {Promise<Product[]>}
 */
export async function getProducts(
    category?: string,
    query?: string,
): Promise<Product[]> {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    const session = await verifySession();
    if (!session) return [];

    try {
        const url = new URL(`${API_URL}/products`);
        if (category) {
            url.pathname += `/category/${category}`;
        }

        const { data } = await axios.get<Product[]>(url.toString());

        if (query) {
            return data.filter((product) =>
                product.title.toLowerCase().includes(query?.toLowerCase()),
            );
        }

        return data;
    } catch (error) {
        console.error(`Failed to fetch products:`, error);
        return [];
    }
}

/**
 * Getting all categories from fake store API
 * @returns {Promise<string[]>} A promise that resolves to an array of product categories.
 * @throws {AxiosError} When the API request fails.
 */
export async function getCategories(): Promise<string[]> {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    const session = await verifySession();
    if (!session) return [];

    try {
        const { data } = await axios.get<string[]>(
            `${API_URL}/products/categories`,
        );
        return data;
    } catch (error) {
        console.error(`Failed to fetch products:`, error);
        return [];
    }
}

/**
 * Fetch the first name and last name of all customers from the database.
 * @returns {Promise<{ First_Name: string, Last_Name: string }[]>} A promise that resolves to an array of customer first and last names.
 */
export async function getCustomers(): Promise<{ First_Name: string, Last_Name: string }[]> {
    try {
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query('SELECT First_Name, Last_Name FROM Customer');
        return rows as { First_Name: string, Last_Name: string }[]; // Return only first name and last name of customers
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        return [];
    }
}

export interface Customer extends RowDataPacket {
    Customer_ID: bigint;        // Unique customer identifier
    is_Guest: boolean;          // True if the customer is a guest, false otherwise
    Password: string;           // Customer's password
    First_Name: string;         // Customer's first name
    Last_Name: string;          // Customer's last name
    Email: string;              // Customer's email address
    Telephone: string;          // Customer's telephone number
    House_No: string;           // Customer's house number
    Address_Line1: string;      // First line of the customer's address
    Address_Line2?: string;     // Second line of the customer's address (optional)
    City: string;               // Customer's city
    Zipcode: string;            // Customer's postal/zip code
}

export async function getCustomerById(id: string): Promise<Customer | null> {
    try {
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query<Customer[]>(
            'SELECT * FROM Customer WHERE Customer_ID = ?', 
            [id]
        );

        return rows[0] || null;  // Return the first matching customer or null if not found
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return null;
    }
};

export interface Cart {
    Cart_ID: number;
    Session_ID: number;
    Customer_ID: string;
}

export async function getCustomerCart(id: number): Promise<number> {
    try {
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT Cart_ID FROM Cart WHERE Customer_ID = ?', 
            [id]
        );

        // Check if rows[0] exists, and if so, return the Cart_ID; otherwise, return null
        return rows.length > 0 ? (rows[0] as { Cart_ID: number }).Cart_ID : 0;
    } catch (error) {
        console.error('Failed to fetch customer cart:', error);
        return 0;
    }
};

export interface CartItem extends RowDataPacket {
    Cart_ID: number;
    Item_ID: number;
    Quantity: number;
    Price: number;
}

/**
 * Fetches all items in the cart based on the provided Cart_ID.
 * @param {string} cartId - The ID of the cart to fetch items for.
 * @returns {Promise<CartItem[]>} A promise that resolves to an array of cart items with Item_ID and Quantity.
 */
export async function getCartItems(cartId: number): Promise<CartItem[]> {
    try {
        const connection = await pool();
        const [rows] = await connection.query<CartItem[]>(
            'SELECT Item_ID, Quantity, Price FROM Cart_Item WHERE Cart_ID = ?',
            [cartId]
        );

        return rows;  // Returns all items with their Item_ID and Quantity
    } catch (error) {
        console.error('Failed to fetch cart items:', error);
        return [];
    }
}

export interface CartItemDetail extends RowDataPacket {
    Cart_ID: number;
    Item_ID: number;
    Quantity: number;
    Price: number;
}

export async function getCartItemsWithDetails(cartId: number): Promise<CartItemDetail[]> {
    try {
        const connection = await pool();
        const [rows] = await connection.query<CartItemDetail[]>(
            `
            SELECT 
                ci.Item_ID, 
                ci.Quantity, 
                ci.Price,
                i.Product_ID,
                i.imageURL,
                i.quantity as Stock,
                p.Title, 
                p.Description
            FROM 
                Cart_Item ci
            JOIN 
                Item i ON ci.Item_ID = i.Item_ID
            JOIN 
                Product p ON i.Product_ID = p.Product_ID
            WHERE 
                ci.Cart_ID = ?
            `,
            [cartId]
        );

        return rows;
    } catch (error) {
        console.error('Failed to fetch cart items with details:', error);
        return [];
    }
}

/**
 * Adds a new item to the cart with the specified Cart_ID, Item_ID, and Quantity.
 * @param {number} itemId - The ID of the item to add.
 * @param {string} cartId - The ID of the cart to add the item to.
 * @param {number} quantity - The quantity of the item to add.
 * @returns {Promise<void>} A promise that resolves when the item is added to the cart.
 */
export async function addCartItem(cartId: number, itemId: number, quantity: number, price: number): Promise<void> {
    try {
        const connection = await pool();

        // Check if the item already exists in the cart
        const [existingItem] = await connection.query<CartItem[]>(
            'SELECT * FROM Cart_Item WHERE Cart_ID = ? AND Item_ID = ?',
            [cartId, itemId]
        );

        // Convert current price to a number to avoid concatenation issues
        const currentPrice = existingItem.length > 0 ? parseFloat(existingItem[0].Price.toString()) : 0;
 
        if (existingItem.length > 0) {
            // If it exists, you might want to update the quantity instead
            const newQuantity = existingItem[0].Quantity + quantity; // Example: Increment quantity
            const newPrice = currentPrice + price;
            await connection.query(
                'UPDATE Cart_Item SET Quantity = ?, Price = ? WHERE Cart_ID = ? AND Item_ID = ?',
                [newQuantity, newPrice, cartId, itemId]
            );
        } else {
            // If it doesn't exist, insert a new record
            await connection.query(
                'INSERT INTO Cart_Item (Cart_ID, Item_ID, Quantity, Price) VALUES (?, ?, ?, ?)',
                [cartId, itemId, quantity, price]
            );
        }
    } catch (error) {
        console.error('Failed to add cart item:', error);
        throw error; // Rethrow or handle the error as needed
    }
}

/**
 * Deletes an item from the cart based on the specified Cart_ID and Item_ID.
 * @param {string} cartId - The ID of the cart from which to delete the item.
 * @param {number} itemId - The ID of the item to delete from the cart.
 * @returns {Promise<void>} A promise that resolves when the item is deleted from the cart.
 */
export async function deleteCartItem(cartId: number, itemId: number): Promise<void> {
    try {
        const connection = await pool();
        await connection.query(
            'DELETE FROM Cart_Item WHERE Cart_ID = ? AND Item_ID = ?',
            [cartId, itemId]
        );
    } catch (error) {
        console.error('Failed to delete item from cart:', error);
        throw error;
    }
}

export interface ProductData extends RowDataPacket {
    Product_ID: bigint;
    Title: string;
    Base_price: string;
    Description: string;
    item_id: number;
    SKU: string;
    imageURL: string | null;
    price_increment: string;
    quantity: number | null;
    Type_ID: number | null;
    Attribute_ID: number | null;
    value: string | null;
    Attribute_Type_ID: number | null;
    Attribute_Type_Name: string | null;
}

export async function fetchProductData(id: string): Promise<ProductData[][] | null> {
    try {
        const connection = await pool();
        const [rows] = await connection.query<ProductData[]>(
            'CALL FetchProductData(?)',
            [id]
        );
        const data = JSON.parse(JSON.stringify(rows));
        return data;
    } catch (error) {
        console.error('Failed to fetch product data:', error);
        return [];
    }
}

export async function updateCustomer(
    customerId: bigint,
    isGuest: boolean,
    password: string,
    firstName: string,
    lastName: string,
    email: string,
    telephone: string,
    houseNo: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    zipcode: string
  ): Promise<void> {
    const sql = `
      CALL UpdateCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    try {
        const connection = await pool();
        await connection.query(sql, [
            customerId,
            isGuest,
            password,
            firstName,
            lastName,
            email,
            telephone,
            houseNo,
            addressLine1,
            addressLine2 || "",
            city,
            zipcode
        ]);
    } catch (error) {
      console.error('Error calling UpdateCustomer procedure:', error);
      throw error;
    }
  }

