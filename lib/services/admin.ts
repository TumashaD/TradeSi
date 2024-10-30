'use server';

import getDatabase from '@/lib/db';
import {  CustomerOrderReport, Order, QuarterlySales } from "@/types/admin";

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
