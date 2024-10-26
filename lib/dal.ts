import "server-only";
import jwt from "jsonwebtoken";
import getDatabase  from "./db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { jwtVerify } from "jose";
import { RowDataPacket } from "mysql2";
import { z } from "zod";

interface CustomerRow extends RowDataPacket {
    Customer_ID: number;
    Email: string;
    Password: string | null;
    is_Guest: number;
    First_Name: string;
    Last_Name: string | null;
  }

  interface SessionRow extends RowDataPacket {
    Session_ID: number;
    CreatedAt: Date;
    ExpiresAt: Date;
  }

  // Verify session function
// Verify session function
export const verifySession = cache(async () => {
  const db = await getDatabase();
  
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      // Return null for guests instead of redirecting
      return null;
    }

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.sessionId) {
      return null;  // Treat as guest
    }

    // Check if session exists and is valid
    const [sessions] = await db.query<[SessionRow[], any]>(
      'SELECT * FROM Session WHERE Session_ID = ? AND ExpiresAt > NOW()',
      [payload.sessionId]
    );

    if (!sessions.length) {
      return null;  // Treat as guest
    }

    const userId = Number(payload.sub);
    
    // Get customer details
    const [customers] = await db.query<[CustomerRow[], any]>(
      'SELECT * FROM Customer WHERE Customer_ID = ? AND is_Guest = 0',
      [userId]
    );

    if (!customers.length) {
      return null;  // Treat as guest
    }

    const customer = JSON.parse(JSON.stringify(customers[0])); 
    const isAdmin = customer.Email === 'admin@email.com';

    return {
      isAuth: true,
      isAdmin, 
      id: userId,
      firstName: customer.First_Name,
      lastName: customer.Last_Name,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;  // Allow guest access on error
  }
});


  export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
