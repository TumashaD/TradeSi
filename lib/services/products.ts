'use server';

import getDatabase from '@/lib/db';
import { Product, ProductData } from "@/types/product";


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