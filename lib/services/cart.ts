'use server';

import { verifySession } from "../dal";
import { User, CustomerRow } from "@/types/user";
import axios from "axios";
import getDatabase from '@/lib/db';
import { Customer, CustomerOrderReport, Order, QuarterlySales } from "@/types/admin";
import { RowDataPacket } from "mysql2";
import { hashPassword } from '@/lib/utils';
import { Product, ProductData } from "@/types/product";
import { getCurrentUser } from "./customer";
import { createGuestSession, getCurrentGuestSession } from "../user";

export interface Cart {
    Cart_ID: number;
    Session_ID: number;
    Customer_ID: string;
}

export async function getCurrentCart(): Promise<number> {
    const user = await getCurrentUser();
    let cartId: number | null = null;

    if (!user) {
        const guestSession = await getCurrentGuestSession();
        if (guestSession) {
            cartId = await getCustomerCart(guestSession, false);
        } else {
            console.log("No guest session found");
            const newGuestSession = await createGuestSession();
            cartId = await getCustomerCart(newGuestSession, false);
        }
    } else {
        cartId = await getCustomerCart(user?.id ?? 1, true);
    }

    return cartId;
}

export async function getCustomerCart(id: number, isCustomerId: boolean = true): Promise<number> {
    try {
        const connection = await getDatabase();  // Await the connection to the database
        const query = isCustomerId 
            ? 'SELECT Cart_ID FROM Cart WHERE Customer_ID = ?' 
            : 'SELECT Cart_ID FROM Cart WHERE Session_ID = ?';
        
        const [rows] = await connection.query<any>(query, [id]);

        // Check if rows[0] exists, and if so, return the Cart_ID; otherwise, return null
        return rows.length > 0 ? (rows[0] as { Cart_ID: number }).Cart_ID : 0;
    } catch (error) {
        console.error('Failed to fetch customer cart:', error);
        return 0;
    }
};

export interface CartItem extends RowDataPacket {
    Item_ID: number;
    Product_ID: number;
    Title: string;
    Quantity: number;
    Price: number;
    ImageURL: string;
    Stock: number;
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
            `SELECT i.Item_ID, p.Product_ID, p.Title,ci.Quantity,ci.Price,i.imageURL,i.quantity as Stock
            FROM Cart_Item ci 
            JOIN Item i ON ci.Item_ID = i.item_id
            JOIN Product p ON i.product_id = p.Product_ID
            where Cart_ID = ?`,
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
    Stock: number;
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

        const data = JSON.parse(JSON.stringify(rows));
        console.log('Cart items with details:', data);

        return data;
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
        console.log('Deleting item from cart:', cartId, itemId);
        await connection.query(
            'DELETE FROM Cart_Item WHERE Cart_ID = ? AND Item_ID = ?',
            [cartId, itemId]
        );
    } catch (error) {
        console.error('Failed to delete item from cart:', error);
        throw error;
    }
}

export const fetchCartData = async (): Promise<{ cartId: number; cartItems: CartItem[] }> => {
    try {
      const cartId = await getCurrentCart();
      const cartItems = await getCartItems(cartId);
      return { cartId, cartItems };
    } catch (error) {
      console.error("Error fetching cart data:", error);
      throw error;
    }
  };

