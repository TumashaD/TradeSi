'use server';

import { verifySession } from "./dal";
import { User } from "@/types/user";
import { Product } from "@/types/product";
import axios from "axios";
import getDatabase from '@/lib/db';
import { Customer, CustomerOrderReport, Order, QuarterlySales } from "@/lib/types";
import { RowDataPacket } from "mysql2";
import { hashPassword } from '@/lib/utils';

const API_URL = process.env.API_URL;

interface CustomerRow extends RowDataPacket {
    Customer_ID: number;
    First_Name: string;
    Last_Name: string | null;
    Email: string;
    Telephone: string;
    House_No: string | null;
    Address_Line1: string;
    Address_Line2: string | null;
    City: string;
    Zipcode: string;
    is_Guest: number;
    Password: string | null;
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const session = await verifySession();
        if (!session) return null;

        const { isAdmin, id } = session;

        const db = await getDatabase();

        const [rows] = await db.query<[CustomerRow[], any]>(
            `SELECT 
                Customer_ID,
                Password,
                First_Name,
                Last_Name,
                Email,
                Telephone,
                House_No,
                Address_Line1,
                Address_Line2,
                City,
                Zipcode,
                is_Guest
             FROM Customer 
             WHERE Customer_ID = ?`,
            [id]
        );

        if (!rows.length) {
            console.error(`No user found with ID ${id}`);
            return null;
        }

        const customer = JSON.parse(JSON.stringify(rows[0]));

        const user: User = {
            id: customer.Customer_ID,
            password: customer.Password,
            firstName: customer.First_Name,
            lastName: customer.Last_Name,
            email: customer.Email,
            telephone: customer.Telephone,
            houseNo: customer.House_No,
            addressLine1: customer.Address_Line1,
            addressLine2: customer.Address_Line2,
            city: customer.City,
            zipcode: customer.Zipcode,
            isAdmin: isAdmin ?? false,
            isGuest: customer.is_Guest === 1,
        };

        return user;
    } catch (error) {
        if ((error as Error).message === "UnauthorizedError") {
            throw new Error("UnauthorizedError");
        }
        console.error("Failed to fetch current user:", error);
        return null;
    }
}

export async function createCustomer(customerData: User): Promise<{ success: boolean; message: string; customerId?: number }> {
    try {
        const connection = await getDatabase();

        // Hash the password before storing it in the database
        const hashedPassword = await hashPassword(customerData.password);

        // SQL query with parameterized values for security
        const query = `
            INSERT INTO Customer (
                is_Guest, Password, First_Name, Last_Name, 
                Email, Telephone, House_No, Address_Line1, 
                Address_Line2, City, Zipcode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            customerData.isGuest,
            hashedPassword,
            customerData.firstName,
            customerData.lastName,
            customerData.email,
            customerData.telephone,
            customerData.houseNo,
            customerData.addressLine1,
            customerData.addressLine2,
            customerData.city,
            customerData.zipcode

        ];

        const [result] = await connection.query<any>(query, values);

        return {
            success: true,
            message: 'Customer created successfully',
            customerId: result.insertId
        };

    } catch (error: any) {
        // Handle specific MySQL errors
        if (error.code === 'ER_DUP_ENTRY') {
            return {
                success: false,
                message: 'Email address already exists'
            };
        }

        console.error('Failed to create customer:', error);
        return {
            success: false,
            message: 'Failed to create customer'
        };
    }
}

export async function updateCustomer(
    customerId: number,
    customerData: User
): Promise<{ success: boolean; message: string }> {
    try {
        const connection = await getDatabase();


        // Call the stored procedure
        const query = `CALL UpdateCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            customerId,
            customerData.isGuest,
            customerData.firstName,
            customerData.lastName,
            customerData.email,
            customerData.telephone,
            customerData.houseNo,
            customerData.addressLine1,
            customerData.addressLine2,
            customerData.city,
            customerData.zipcode
        ];

        await connection.query(query, values);

        return {
            success: true,
            message: 'Customer updated successfully'
        };

    } catch (error: any) {
        // Handle specific MySQL errors
        if (error.code === 'ER_DUP_ENTRY') {
            return {
                success: false,
                message: 'Email address already exists'
            };
        }

        // Log the error for debugging
        console.error('Failed to update customer:', error);

        return {
            success: false,
            message: 'Failed to update customer'
        };
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
    // const session = await verifySession();
    // if (!session) return null;

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
 /**
 * @export
 * @param {string} [category]
 * @param {string} [query]
 * @return {Promise<Product[]>}
 */
export async function getProducts(
    category?: string,
    query?: string
): Promise<Product[]> {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // const session = await verifySession();
    // if (!session) return [];

    try {
        const connection = await getDatabase();  // Await the connection to the database
        let data: Product[] = [];

        // Handle category filtering
        if (category) {
            const [rows] = await connection.query<any>(
                "call viewCategoryProducts(?)", [category]
            );
            data = JSON.parse(JSON.stringify(rows[0]));
        } else {
            // Default case: return all products
            const [rows] = await connection.query<any>(
                `select * from TradeSi.AllProducts`
            );
            data = JSON.parse(JSON.stringify(rows));
        }

        // Handle search query
        if (query) {
            const [rows] = await connection.query<any>(
                "call SearchProducts(?)", [query]
            );
            console.log("query executed");
            data = JSON.parse(JSON.stringify(rows[0]));
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
 */
export async function getCategories(): Promise<string[]> {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    // const session = await verifySession();
    // if (!session) return [];

    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>('SELECT c.category_id, c.Name FROM TradeSi.Category c WHERE c.Parent_Category_ID IS NULL');
        // return rows as {category_id: bigint, Name: string}[]; // Return only category id and category name
        const categoryNames = rows.map((row: { Name: string }) => row.Name);  // Extract the 'Name' property
        return categoryNames as string[];
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
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>('SELECT First_Name, Last_Name FROM Customer');
        return rows as { First_Name: string, Last_Name: string }[]; // Return only first name and last name of customers
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        return [];
    }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
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
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
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
        const connection = await getDatabase();
        const [rows] = await connection.query<any>(
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
        const connection = await getDatabase();
        const [rows] = await connection.query<any>(
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
        const connection = await getDatabase();

        // Check if the item already exists in the cart
        const [existingItem] = await connection.query<any>(
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
        const connection = await getDatabase();
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
        const connection = await getDatabase();
        const [rows] = await connection.query<any>(
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



/**
 * Creates an order by inserting into the Payment, Delivery, and Order tables.
 * @param products - The products being ordered.
 * @param totalPrice - The total price of the order.
 * @param customer - The customer details.
 * @param formData - The form data containing delivery details.
 */
export async function makeOrder(
    products: { Item_ID: bigint; Quantity: number }[], // Adjust type as needed
    totalPrice: number,
    customer: { Customer_ID: bigint }, // Adjust the structure based on your actual customer object
    formData: {
        paymentType: 'Card' | 'Cash On Delivery'; // Add more types if necessary
        deliveryType: string;
        houseNo: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        province: string;
        zipcode: string;
    }
): Promise<void> {
    const connection = await getDatabase(); // Await the connection to the database

    try {
        // Step 1: Insert into Payment Table
        const paymentTypeId = formData.paymentType === 'Card' ? 1 : 2; // 1 for Card, 2 for Cash On Delivery
        const [paymentResult] = await connection.query<any>('INSERT INTO Payment (type_id, Card_ID, price) VALUES (?, NULL, ?)', [paymentTypeId, Number(totalPrice).toFixed(2)]);
        const paymentId = (paymentResult as any).insertId; // Access insertId from the result

        // Step 2: Insert into Delivery Table
        const [deliveryResult] = await connection.query<any>('INSERT INTO Delivery (Deliverey_type, Status) VALUES (?, ?)', [formData.deliveryType, 'Processing']);
        const deliveryId = (deliveryResult as any).insertId; // Access insertId from the result

        // Step 3: Insert into Order Table and retrieve the Order_ID
        const [orderResult] = await connection.query<any>('INSERT INTO `Order` (Customer_ID, Date, Payment_ID, Delivery_ID, House_No, Address_Line1, Address_Line2, City, Province, Zipcode) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)', [
            customer.Customer_ID,
            paymentId,
            deliveryId,
            formData.houseNo,
            formData.addressLine1,
            formData.addressLine2 || null, // Handle optional field
            formData.city,
            formData.province,
            formData.zipcode,
        ]);
        const orderId = (orderResult as any).insertId; // Get the new Order_ID

        // Step 4: Insert each product into the Order_Item table
        for (const product of products) {
            await connection.query<any>('INSERT INTO Order_Item (Order_ID, Item_ID, Quantity) VALUES (?, ?, ?)', [
                orderId,
                product.Item_ID,
                product.Quantity,
            ]);
        }

    } catch (error) {
        console.error('Failed to create order:', error);
        throw error; // Handle or rethrow as needed
    }
}

/**
 * Retrieves card details for a specific customer.
 * @param customerId - The ID of the customer whose card details are to be retrieved.
 * @returns A promise that resolves to an array of card details or an empty array if no cards are found.
 */
export async function GetCard(customerId: bigint): Promise<Array<{ Card_ID: bigint; Card_Number: string; Name_On_Card: string; Expiry_Date: Date }>> {
    const connection = await getDatabase(); // Await the connection to the database

    try {
        // Query to get card details for the given customer ID
        const [rows] = await connection.query<any>('SELECT Card_ID, Card_Number, Name_On_Card, Expiry_Date FROM Card_Details WHERE Customer_ID = ?', [customerId]);

        // Map the results to the desired format
        return rows.map((row: { Card_ID: bigint; Card_Number: string; Name_On_Card: string; Expiry_Date: Date }) => ({
            Card_ID: row.Card_ID,
            Card_Number: row.Card_Number,
            Name_On_Card: row.Name_On_Card,
            Expiry_Date: row.Expiry_Date
        }));
    } catch (error) {
        console.error('Failed to retrieve card details:', error);
        throw error; // Handle or rethrow as needed
    }
}
// Sample data generators
export const generateQuarterlySales = (year: string) => {
    return [
        { quarter: 'Q1', sales: Math.floor(Math.random() * 50000) + 10000 },
        { quarter: 'Q2', sales: Math.floor(Math.random() * 50000) + 10000 },
        { quarter: 'Q3', sales: Math.floor(Math.random() * 50000) + 10000 },
        { quarter: 'Q4', sales: Math.floor(Math.random() * 50000) + 10000 },
    ];
};


export const generateTopProducts = () => {
    return [
        { name: 'Product A', sales: 234 },
        { name: 'Product B', sales: 189 },
        { name: 'Product C', sales: 156 },
        { name: 'Product D', sales: 123 },
        { name: 'Product E', sales: 99 },
    ];
};

export const generateCategoryData = () => {
    return [
        { category: 'Electronics', orders: 456 },
        { category: 'Clothing', orders: 389 },
        { category: 'Books', orders: 245 },
        { category: 'Home', orders: 198 },
        { category: 'Sports', orders: 167 },
    ];
};

export const generateProductInterest = () => {
    return Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        views: Math.floor(Math.random() * 1000) + 100,
        orders: Math.floor(Math.random() * 100) + 10,
    }));
};

export async function getTotalCustomers(): Promise<number | null> {
    try {
        const db = await getDatabase();
        const [rows] = await db.query<any>(
            'SELECT COUNT(*) as total FROM Customer'
        );
        return rows[0].total || null;
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        return null;
    }
}

export async function getTotalOrders(): Promise<number | null> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            'SELECT COUNT(*) as total FROM TradeSi.Payment'
        );

        return rows[0].total || null;  // Return the total number of orders
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return null;
    }
}

export async function getAvgOrderValue(): Promise<number | null> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            'SELECT AVG(Price) as avg From TradeSi.Payment'
        );
        return rows[0].avg || null;  // Return the average order value
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return null;
    }
}

export async function getCustomerOrderReport(): Promise<CustomerOrderReport | null> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            "SELECT * FROM TradeSi.CustomerAnalytics;"
        );
        const data = JSON.parse(JSON.stringify(rows));
        return data;
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return null;
    }
};

export async function getCustomerOrders(id: string): Promise<Order | null> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            `SELECT * FROM CustomerOrdersView WHERE customerID = ?`,
            [id]
        );
        const data = JSON.parse(JSON.stringify(rows));
        return data;
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return null;
    }
}

export async function getTotalRevenue(): Promise<number | null> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            'SELECT SUM(Price) as total From TradeSi.Payment'
        );
        return rows[0].total || null;  // Return the total revenue
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return null;
    }
}

export async function getQuarterlySales(year: number): Promise<QuarterlySales[] | null> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            `SELECT * FROM TradeSi.QuarterlySalesReport WHERE Year = ?`,
            [year]
        );
        const data = JSON.parse(JSON.stringify(rows));
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Failed to fetch customer:', error);
        return null;
    }

}

export async function getTopSellingProducts(startDate: string, endDate: string) {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            `CALL GetTopSellingProducts('${startDate}', '${endDate}')`
        );
        const data = JSON.parse(JSON.stringify(rows[0]));
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Failed to fetch customer:', error);
        return [];
    }
}

export async function getTopCategories(startDate: string, endDate: string) {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            `call TradeSi.GetCategoryOrderStats('${startDate}', '${endDate}');`
        );
        const data = JSON.parse(JSON.stringify(rows[0]));
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Failed to fetch customer:', error);
        return [];
    }
}

export async function getMonthlyProductInterest(p_id: number, year: number) {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            `CALL GetMonthlyProductInterest(${p_id}, ${year});`
        );
        const data = JSON.parse(JSON.stringify(rows[0]));
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Failed to fetch customer:', error);
        return [];
    }
}

export async function getAllProductNames() {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const [rows] = await connection.query<any>(
            `SELECT Product_ID,Title FROM TradeSi.Product;`
        );
        const data = JSON.parse(JSON.stringify(rows));
        console.log(data);
        return data;
    }
    catch (error) {
        console.error('Failed to fetch customer:', error);
        return [];
    }
}
