'use server';

import getDatabase from '@/lib/db';
import { Product, ProductData,Category, Attribute } from "@/types/product";


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
        const [rows] = await connection.query<any>(
            'SELECT c.category_id, c.Name FROM TradeSi.Category c WHERE c.Parent_Category_ID IS NULL'
        );
        // return rows as {category_id: bigint, Name: string}[]; // Return only category id and category name
        const categoryNames = rows.map((row: { Name: string }) => row.Name);  // Extract the 'Name' property
        return categoryNames as string[];
    } catch (error) {
        console.error(`Failed to fetch products:`, error);
        return [];
    }
}

export async function getAllCategories(): Promise<Category[]> {
    try {
        const connection = await getDatabase();
        const [rows] = await connection.query<any>('SELECT * FROM TradeSi.Category;');
        return rows as Category[];

    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
    }
}

export async function getSubCategories(category: string): Promise<string[]>{
    console.log('category:', category);
    try {
        const connection = await getDatabase();
        const [rows] = await connection.query<any>(
            'select c.Name from Category c  where c.Parent_Category_ID in (select pc.Category_ID from Category pc where pc.Name = ?);',
            [category]
        );
        const categoryNames = rows.map((row: { Name: string }) => row.Name);  // Extract the 'Name' property
        console.log(categoryNames);
        return categoryNames as string[];
    } catch (error) {
        console.error('Failed to fetch subcategories:', error);
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

export async function getAllAttributeTypes(): Promise<Attribute[]> {
    try {
        const connection = await getDatabase();
        const [rows] = await connection.query<any>('SELECT * FROM TradeSi.Attribute_type;');
        console.log(rows);
        return rows as Attribute[];
    } catch (error) {
        console.error('Failed to fetch attributes:', error);
        return [];
    }
}


export async function addProduct(product: Product): Promise<boolean> {
    
    try {
        // Start transaction
        const connection = await getDatabase();

        // 1. Insert main product
        const [productResult] = await connection.query<any>(
            'CALL AddProduct(?, ?, ?, ?, ?, ?, ?)',
            [
                product.title,
                product.description,
                product.basePrice,
                product.imageUrl,
                product.category,
                JSON.stringify(product.attributes?.map(attr => ({
                    type_id: parseInt(attr.type_id),
                    value: attr.name
                }))).replace(/\\/g, ""),
                JSON.stringify(product.variants?.map(variant => ({
                    sku: variant.sku,
                    quantity: variant.quantity,
                    imageUrl: variant.imageUrl,
                    price_increment: variant.priceIncrement,
                    attributes: variant.attributes.map(attr => ({
                        type_id: parseInt(attr.type_id),
                        value: attr.name
                    }))
                }))).replace(/\\/g, "")
            ]
        );

        // If everything succeeded, commit the transaction
        console.log('Product added successfully:', productResult[0]);
        return true;

    } catch (error) {
        // If there's an error, roll back the transaction
        console.error('Failed to add product:', error);
        return false;
    }
}