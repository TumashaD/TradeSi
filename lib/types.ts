import { RowDataPacket } from "mysql2";

export interface Customer extends RowDataPacket {
    Customer_ID: bigint;        // Unique customer identifier
    is_Guest: boolean;          // True if the customer is a guest, false otherwise
    Password: string;           // Customer's password
    First_Name: string;         // Customer's first name
    Last_Name: string;          // Customer's last name
    Email: string;              // Customer's email address
    Telephone: string;          // Customer's telephone number
    House_No: string;           // Customer's house number
    Address_Line1: string;      // First line of the customer's address
    Address_Line2?: string;     // Second line of the customer's address (optional)
    City: string;               // Customer's city
    Zipcode: string;            // Customer's postal/zip code
}

export interface CustomerOrderReport extends RowDataPacket {
    Customer_ID: bigint;        // Unique customer identifier
    Name: string;         // Customer's first name
    Email: string;              // Customer's email address
    Total_Orders: number;       // Total number of orders placed by the customer
    Total_Spent: number;        // Total amount spent by the customer
    Last_Order: Date;         // Date of the customer's last order
    Avg_Order_Value: number;    // Average order value for the customer
}


export interface Order {
    orderId: string;
    date: string;
    items: string[];
    total: number;
    status: string;
  }

export interface QuarterlySales {
    Year: number;
    Quarter: number;
    TotalOrders: number;
    TotalRevenue: number;
}

export interface User {
    id: number;
    username: string;
    isAdmin: boolean;
    name: {
        firstname: string;
        lastname: string;
    };
}

