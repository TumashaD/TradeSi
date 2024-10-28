'use server';

import { verifySession } from "../dal";
import { User, CustomerRow } from "@/types/user";
import axios from "axios";
import getDatabase from '@/lib/db';
import { Customer, CustomerOrderReport, Order, QuarterlySales } from "@/types/admin";
import { RowDataPacket } from "mysql2";
import { hashPassword } from '@/lib/utils';
import { Product, ProductData } from "@/types/product";
import { get } from "http";
import { getCurrentGuestSession } from "../user";

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

export async function createGuestCustomer(customerData: any): Promise<User> {
    try {
        const connection = await getDatabase();
        const session = await getCurrentGuestSession();

        // if customer data email exists in the database return that customer id
        const [rows] = await connection.query<any>('SELECT * FROM Customer WHERE Email = ?', [customerData.email]);
        if (rows.length) {
        const customer = JSON.parse(JSON.stringify(rows[0]));
        if (rows.length) {
            console.log('Guest customer already exists:', customer);
            return {
                id: customer.Customer_ID,
                firstName: customer.First_Name,
                lastName: customer.Last_Name,
                email: customer.Email,
                telephone: customer.Telephone,
                houseNo: customer.House_No,
                addressLine1: customer.Address_Line1,
                addressLine2: customer.Address_Line2,
                city: customer.City,
                zipcode: customer.Zipcode,
                isAdmin: false,
                isGuest: true,
                password: ""
            };
        }
    }

        // SQL query with parameterized values for security
        const query = `
            INSERT INTO Customer (
                is_Guest, Password, First_Name, Last_Name, 
                Email, Telephone, House_No, Address_Line1, 
                Address_Line2, City, Zipcode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;       

        const values = [
            1,
            null,
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

        // update the cart with the new customer id if session exists in cart table, create a new cart with the new customer id and the same session
        if (session) {
            const [cartResult] = await connection.query<any>('UPDATE Cart SET Customer_ID = ? WHERE Session_ID = ?', [result.insertId, session]);
            if (cartResult.affectedRows === 0) {
                await connection.query<any>('INSERT INTO Cart (Session_ID, Customer_ID) VALUES (?, ?)', [session, result.insertId]);
            }
        }


        return {
            id: result.insertId,
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            email: customerData.email,
            telephone: customerData.telephone,
            houseNo: customerData.houseNo,
            addressLine1: customerData.addressLine1,
            addressLine2: customerData.addressLine2,
            city: customerData.city,
            zipcode: customerData.zipcode,
            isAdmin: false,
            isGuest: true,
            password: ""
        };

    } catch (error: any) {
        console.error('Failed to create guest customer:', error);
        throw error;
    }
}
