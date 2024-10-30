'use server';

import getDatabase from '@/lib/db';
import { getCustomerCart } from './cart';
import { getCurrentGuestSession } from '../user';

export async function makeOrder(
    products: { Item_ID: bigint; Quantity: number }[], // Adjust type as needed
    totalPrice: number,
    customer: { Customer_ID: number }, // Adjust the structure based on your actual customer object
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
    const currentSession = await getCurrentGuestSession();

    try {
        // Step 1: Insert into Payment Table
        const paymentTypeId = formData.paymentType === 'Card' ? 1 : 2; // 1 for Card, 2 for Cash On Delivery
        const [paymentResult] = await connection.query<any>('INSERT INTO Payment (type_id, Card_ID, price) VALUES (?, NULL, ?)', [paymentTypeId, Number(totalPrice).toFixed(2)]);
        const paymentId = (paymentResult as any).insertId; // Access insertId from the result

        // Step 2: Insert into Delivery Table
        const [deliveryResult] = await connection.query<any>('INSERT INTO Delivery (Delivery_type, Status) VALUES (?, ?)', [formData.deliveryType, 'Processing']);
        const deliveryId = (deliveryResult as any).insertId; // Access insertId from the result
        const currentDateTime = new Date();

        // Step 3: Insert into Order Table and retrieve the Order_ID
        const [orderResult] = await connection.query<any>('INSERT INTO `Order` (Customer_ID, Date, Payment_ID, Delivery_ID, House_No, Address_Line1, Address_Line2, City, Province, Zipcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            customer.Customer_ID,
            currentDateTime,
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

        const cartIdCustomer = await getCustomerCart(customer.Customer_ID, true);
        // get the cart id of the session
        if (currentSession) {
            const cartIdSession = await getCustomerCart(currentSession, false);
            await connection.query<any>('DELETE FROM Cart_Item WHERE Cart_ID = ? OR ?', [cartIdCustomer, cartIdSession]);
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
export async function GetCard(customerId: number): Promise<Array<{ Card_ID: number; Card_Number: string; Name_On_Card: string; Expiry_Date: Date }>> {
    const connection = await getDatabase(); // Await the connection to the database

    try {
        // Query to get card details for the given customer ID
        const [rows] = await connection.query<any>('SELECT Card_ID, Card_Number, Name_On_Card, Expiry_Date FROM Card_Details WHERE Customer_ID = ?', [customerId]);

        // Map the results to the desired format
        return rows.map((row: { Card_ID: number; Card_Number: string; Name_On_Card: string; Expiry_Date: Date }) => ({
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

export async function updateDeliveryStatus(orderId: number, status: string): Promise<void> {
    const connection = await getDatabase(); // Await the connection to the database

    try {
        await connection.query<any>(`UPDATE Delivery d
JOIN TradeSi.Order o ON d.Delivery_ID = o.Delivery_ID
SET d.Status = ?
WHERE o.Order_ID = ?;`, [status, orderId]);
    } catch (error) {
        console.error('Failed to update delivery status:', error);
        throw error; // Handle or rethrow as needed
    }
}

