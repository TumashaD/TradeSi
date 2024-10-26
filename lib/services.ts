'use server';

import { verifySession } from "./dal";
import { User } from "@/types/user";
import { Product } from "@/types/product";
import axios from "axios";
import getDatabase from '@/lib/db';
import { Customer, CustomerOrderReport,Order,QuarterlySales } from "@/lib/types";
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
 * @export
 * @param {string} [category]
 * @param {string} [query]
 * @return {Promise<Product[]>}
 */
export async function getProducts(
    category?: string,
    params?: string
): Promise<Product[]> {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    // const session = await verifySession();
    // if (!session) return [];

    try {
        const connection = await getDatabase();  // Await the connection to the database
        if (category) {
            const [rows] = await connection.query<any>(
                "call viewCategoryProducts(?)", [category]
            );
            const data = JSON.parse(JSON.stringify(rows[0]));
            return data;
        } else {
            const [rows] = await connection.query<any>(
                `select * from TradeSi.AllProducts`);
            const data = JSON.parse(JSON.stringify(rows));
            return data;
        }
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

export async function getTopSellingProducts(startDate:string,endDate:string) {
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

export async function getTopCategories(startDate:string,endDate:string) {
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

export async function getMonthlyProductInterest(p_id:number,year:number) {
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
