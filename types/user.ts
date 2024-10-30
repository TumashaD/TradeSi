import { RowDataPacket } from "mysql2";

export interface User {
    id?: number;
    firstName: string;
    lastName: string | null;
    email: string;
    telephone: string;
    houseNo: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    zipcode: string;
    isAdmin: boolean;
    isGuest: boolean;
    password: string;
  }

  export interface CustomerRow extends RowDataPacket {
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
