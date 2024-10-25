'use server';

import { verifySession } from "@/lib/dal";
import { User } from "@/types/user";
import { Product } from "@/types/product";
import axios from "axios";
import pool from "@/lib/db";  // Import your database connection
import { RowDataPacket } from "mysql2";
const API_URL = process.env.API_URL;
import bcrypt from 'bcrypt';
import { Order, Sequelize } from 'sequelize';
import { CustomerData } from "@/types/user"; // Adjust path as needed
import * as UserTypes from "@/types/user";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';




// /**
//  * Getting a get Current User  from fake store API
//  * @returns {Promise<User> | null} A promise that resolves to the fetched user.
//  */
// export async function getCurrentUser(): Promise<User | null> {
//     // For enhanced security, the verifySession function can be used to authenticate the user.
//     // While middleware is a viable option, verifySession can also be directly utilized within services.
//     // We can use it also for checking the user role and other user data.
//     // This forms part of the Data Access Layer (DAL).
//     const session = await verifySession();
//     if (!session) return null;
//     const { isAdmin, id } = session;
//     try {
//         const response = await axios.get<User>(`${API_URL}/users/${id}`);
//         const { password,email, ...rest} = response.data;
//         rest.isAdmin = isAdmin;
//         return { ...rest};
//     } catch (error) {
//         console.error(`Failed to fetch User with ID ${id}:`, error);
//         return null;
//     }
// }


// /**
//  * Getting a single product from fake store API
//  * @param {string} id - The ID of the product to fetch.
//  * @returns {Promise<Product> | null} A promise that resolves to the fetched product.
//  */
// export async function getProduct(id: string): Promise<Product | null> {
//     // For enhanced security, the verifySession function can be used to authenticate the user.
//     // While middleware is a viable option, verifySession can also be directly utilized within services.
//     // We can use it also for checking the user role and other user data.
//     // This forms part of the Data Access Layer (DAL).
//     const session = await verifySession();
//     if (!session) return null;

//     try {
//         const response = await axios.get<Product>(`${API_URL}/products/${id}`);
//         return response.data;
//     } catch (error) {
//         console.error(`Failed to fetch product with ID ${id}:`, error);
//         return null;
//     }
// }


// /**
//  *  Getting all products from fake store API
//  *
//  * @export
//  * @param {string} [category]
//  * @return {Promise<Product[]>}
//  */
// export async function getProducts(
//     category?: string,
//     query?: string,
// ): Promise<Product[]> {
//     // For enhanced security, the verifySession function can be used to authenticate the user.
//     // While middleware is a viable option, verifySession can also be directly utilized within services.
//     // We can use it also for checking the user role and other user data.
//     // This forms part of the Data Access Layer (DAL).
//     const session = await verifySession();
//     if (!session) return [];

//     try {
//         const url = new URL(`${API_URL}/products`);
//         if (category) {
//             url.pathname += `/category/${category}`;
//         }

//         const { data } = await axios.get<Product[]>(url.toString());

//         if (query) {
//             return data.filter((product) =>
//                 product.title.toLowerCase().includes(query?.toLowerCase()),
//             );
//         }

//         return data;
//     } catch (error) {
//         console.error(`Failed to fetch products:`, error);
//         return [];
//     }
// }

// /**
//  * Getting all categories from fake store API
//  * @returns {Promise<string[]>} A promise that resolves to an array of product categories.
//  * @throws {AxiosError} When the API request fails.
//  */
// export async function getCategories(): Promise<string[]> {
//     // For enhanced security, the verifySession function can be used to authenticate the user.
//     // While middleware is a viable option, verifySession can also be directly utilized within services.
//     // We can use it also for checking the user role and other user data.
//     // This forms part of the Data Access Layer (DAL).
//     const session = await verifySession();
//     if (!session) return [];

//     try {
//         const { data } = await axios.get<string[]>(
//             `${API_URL}/products/categories`,
//         );
//         return data;
//     } catch (error) {
//         console.error(`Failed to fetch products:`, error);
//         return [];
//     }
// }

// /**
//  * Fetch the first name and last name of all customers from the database.
//  * @returns {Promise<{ First_Name: string, Last_Name: string }[]>} A promise that resolves to an array of customer first and last names.
//  */
// export async function getCustomers(): Promise<{ First_Name: string, Last_Name: string }[]> {
//     try {
//         const connection = await pool();  // Await the connection to the database
//         const [rows] = await connection.query('SELECT First_Name, Last_Name FROM Customer');
//         return rows as { First_Name: string, Last_Name: string }[]; // Return only first name and last name of customers
//     } catch (error) {
//         console.error('Failed to fetch customers:', error);
//         return [];
//     }
// }

// export interface Customer extends RowDataPacket {
//     Customer_ID: bigint;        // Unique customer identifier
//     is_Guest: boolean;          // True if the customer is a guest, false otherwise
//     Password: string;           // Customer's password
//     First_Name: string;         // Customer's first name
//     Last_Name: string;          // Customer's last name
//     Email: string;              // Customer's email address
//     Telephone: string;          // Customer's telephone number
//     House_No: string;           // Customer's house number
//     Address_Line1: string;      // First line of the customer's address
//     Address_Line2?: string;     // Second line of the customer's address (optional)
//     City: string;               // Customer's city
//     Zipcode: string;            // Customer's postal/zip code
// }

// export async function getCustomerById(id: string): Promise<Customer | null> {
//     try {
//         const connection = await pool();  // Await the connection to the database
//         const [rows] = await connection.query<Customer[]>(
//             'SELECT * FROM Customer WHERE Customer_ID = ?', 
//             [id]
//         );

//         return rows[0] || null;  // Return the first matching customer or null if not found
//     } catch (error) {
//         console.error('Failed to fetch customer:', error);
//         return null;
//     }
//};










// /**
//  * Register a new user with username, email, and password.
//  * @param {string} username - The username of the user.
//  * @param {string} email - The email of the user.
//  * @param {string} password - The plain text password of the user.
//  * @param {string} firstName - The first name of the user.
//  * @param {string} lastName - The last name of the user.
//  * @param {string} telephone - The telephone number of the user.
//  * @param {string} houseNo - The house number of the user.
//  * @param {string} addressLine1 - The first line of the address.
//  * @param {string} addressLine2 - The second line of the address.
//  * @param {string} city - The city of the user.
//  * @returns {Promise<boolean>} A promise that resolves to true if registration is successful, otherwise false.
//  */
// export async function registerUser(
//     username: string,
//     email: string,
//     password: string,
//     firstName: string,
//     lastName: string,
//     telephone: string,
//     houseNo: string,
//     addressLine1: string,
//     addressLine2: string,
//     city: string
// ): Promise<boolean> {
//     const query = `
//         INSERT INTO Customers (Username, First_Name, Last_Name, Email, Telephone, House_No, Address_Line1, Address_Line2, City, Password)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     try {
//         const connection = await pool();

//         // Hash the password before storing it
//         const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

//         // Insert the user into the database
//         await connection.query(query, [
//             username,
//             firstName,
//             lastName,
//             email,
//             telephone,
//             houseNo,
//             addressLine1,
//             addressLine2,
//             city,
//             hashedPassword
//         ]);

//         return true;
//     } catch (error) {
//         console.error('Failed to register user:', error);
//         return false;
//     }
// }



// export async function loginUser(username: string, password: string): Promise<boolean> {
//     const query = `SELECT password FROM Customers WHERE Email = ?`;

//     try {
//         const connection = await pool();
//         const [rows]: [RowDataPacket[], unknown] = await connection.query(query, [username]); // Destructure with types

//         if (rows.length === 0) {
//             return false; // User not found
//         }

//         const storedHashedPassword = rows[0].password;

//         // Compare the entered password with the stored hashed password
//         const isMatch = await bcrypt.compare(password, storedHashedPassword);

//         return isMatch; // Return true if passwords match, false otherwise
//     } catch (error) {
//         console.error('Failed to login user:', error);
//         return false;
//     }
// }


//**************************************/


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


/**
 * Create a new session when a user logs in or starts a session.
 * @param {bigint} customerId - The ID of the customer for whom to create the session.
 * @returns {Promise<{ sessionId: bigint, expiresAt: string } | null>} A promise that resolves to the session details or null if creation fails.
 */
export async function createSession(customerId: bigint): Promise<{ sessionId: bigint, expiresAt: string } | null> {
    try {
        const connection = await pool(); // Await the connection to the database

        // Generate a new session ID
        const sessionId = uuidv4(); // This can be customized; ensure it meets your requirements.

        // Set session expiration time (e.g., 1 hour from now)
        const expiresAt = moment().add(1, 'hour').toISOString(); // Use moment.js to manage date and time

        // Insert the new session into the database
        const result = await connection.query<RowDataPacket[]>(
            'INSERT INTO Session (Session_ID, CreatedAt, ExpiresAt) VALUES (?, NOW(), ?)',
            [sessionId, expiresAt]
        );

        // Check if the insert was successful
        if (result[0].affectedRows > 0) {
            return { sessionId, expiresAt }; // Return session details
        } else {
            console.error('Failed to create session.');
            return null;
        }
    } catch (error) {
        console.error('Failed to create session:', error);
        return null;
    }
}