'use server';

import { verifySession } from "@/lib/dal";
import { User } from "@/types/user";
import { Product } from "@/types/product";
import axios from "axios";
import pool from "@/lib/db";  // Import your database connection
import { RowDataPacket } from "mysql2";
import { Customer, CustomerOrderReport } from "@/lib/types";
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
        const { password, email, ...rest } = response.data;
        rest.isAdmin = isAdmin;
        return { ...rest };
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
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM Customer'
        );

        return rows[0].total || null;  // Return the total number of customers
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return null;
    }
};

export async function getTotalOrders(): Promise<number | null> {
    try {
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM TradeSi.Order'
        );

        return rows[0].total || null;  // Return the total number of orders
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return null;
    }
}

export async function getAvgOrderValue(): Promise<number | null> {
    try {
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT AVG(Price) as avg From TradeSi.Payment'
        );
        return rows[0].avg || null;  // Return the average order value
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return null;
    }
}

// export async function getCustomerOrderReport(): Promise<CustomerOrderReport[] | null> {
//     let connection;
//     try {
//         // Get a connection from the pool
//         connection = await pool(); 
        
//         // Execute the query
//         const [rows] = await connection.query<CustomerOrderReport[]>(
//             `SELECT 
//                 c.Customer_ID,
//                 CONCAT(c.First_Name, ' ', COALESCE(c.Last_Name, '')) AS Name,
//                 c.Email,
//                 COUNT(DISTINCT o.Order_ID) AS Total_Orders,
//                 SUM(p.Price) AS Total_Spent,
//                 MAX(o.Date) AS Last_Order,
//                 AVG(p.Price) AS Avg_Order_Value
//             FROM 
//                 Customer c
//                 INNER JOIN Cart ct ON c.Customer_ID = ct.Customer_ID
//                 INNER JOIN \`Order\` o ON ct.Cart_ID = o.Cart_ID  -- Escaping 'Order' as it's a reserved keyword
//                 INNER JOIN Payment p ON o.Payment_ID = p.Payment_ID
//             GROUP BY 
//                 c.Customer_ID, c.First_Name, c.Last_Name, c.Email
//             ORDER BY 
//                 c.Customer_ID;`
//         );
//         // Return the result
//         return rows[0];
//     } catch (error) {
//         console.error('Failed to fetch customer order report:', error);
//         return null;
//     } finally {
//         // Close the connection if it was opened
//         if (connection) {
//             await connection.end();
//         }
//     }
// }

export async function getCustomerOrderReport(): Promise<CustomerOrderReport | null> {
    try {
        const connection = await pool();  // Await the connection to the database
        const [rows] = await connection.query<CustomerOrderReport[]>(
            `SELECT 
                c.Customer_ID,
                CONCAT(c.First_Name, ' ', COALESCE(c.Last_Name, '')) AS Name,
                c.Email,
                COUNT(DISTINCT o.Order_ID) AS Total_Orders,
                SUM(p.Price) AS Total_Spent,
                MAX(o.Date) AS Last_Order,
                AVG(p.Price) AS Avg_Order_Value
            FROM 
                Customer c
                INNER JOIN Cart ct ON c.Customer_ID = ct.Customer_ID
                INNER JOIN TradeSi.Order o ON ct.Cart_ID = o.Cart_ID  -- Escaping 'Order' as it's a reserved keyword
                INNER JOIN Payment p ON o.Payment_ID = p.Payment_ID
            GROUP BY 
                c.Customer_ID, c.First_Name, c.Last_Name, c.Email
            ORDER BY 
                c.Customer_ID;`
        );
        const data = JSON.parse(JSON.stringify(rows));
        return data;
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return null;
    }
};




