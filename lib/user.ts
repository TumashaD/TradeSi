"use server";
import { verifySession ,loginSchema} from "./dal";
import { ProductCategory } from "@/types/product";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
const API_URL = process.env.API_URL;
import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cache } from 'react';
import { RowDataPacket } from 'mysql2';
import getDatabase from './db';
import { verifyPassword } from "./utils";


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
// Create a guest session
export async function createGuestSession(): Promise<number> {
  const db = await getDatabase();
  const sessionId = Date.now();
  const createdAt = new Date();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day for guest sessions
  
  try {
    await db.query<[SessionRow[], any]>(
      'INSERT INTO Session (Session_ID, CreatedAt, ExpiresAt) VALUES (?, ?, ?)',
      [sessionId, createdAt, expiresAt]
    );

    return sessionId;
  } catch (error) {
    console.error('Error creating guest session:', error);
    throw error;
  }
}

// Create an authenticated session
async function createSession(customerId: number): Promise<string> {
  const db = await getDatabase();
  const sessionId = Date.now();
  const createdAt = new Date();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for authenticated sessions
  
  try {
    await db.query<[SessionRow[], any]>(
      'INSERT INTO Session (Session_ID, CreatedAt, ExpiresAt) VALUES (?, ?, ?)',
      [sessionId, createdAt, expiresAt]
    );

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const token = await new SignJWT({
      user: true,
      sub: customerId.toString(),
      sessionId: sessionId.toString()
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(secret);

    return token;
  } catch (error) {
    console.error('Error creating authenticated session:', error);
    throw error;
  }
}

export async function login(formData: FormData) {
  
  try {
      const db = await getDatabase();
      const validatedFields = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
      });
  
      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
        };
      }
  
      const { email, password } = validatedFields.data;
  
      // Get customer from database
      const [rows] = await db.query<[CustomerRow[], any]>(
        'SELECT Customer_ID, Password FROM Customer WHERE Email = ?',
        [email]
      );
      const customer = JSON.parse(JSON.stringify(rows[0]));
      console.log(customer);

      const passwordMatch = await verifyPassword(password, customer.Password);

      if (!passwordMatch) {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

      // Check if customer exists
        if (customer === undefined) {
            return {
                errors: {
                    email: "Invalid email",
                    password: "Invalid password"
                }
            };
        }
  
      // Create session and get token
      const token = await createSession(customer.Customer_ID);
      console.log(token);
  
      // Set cookie
      const cookieExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      cookies().set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: cookieExpiry,
        sameSite: "lax",
        path: "/",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        errors: {
          email: "An error occurred during login",
          password: "An error occurred during login"
        },
        message: error.message
      };
    }
  }
/**
 ** Logs out the user by deleting the token cookie and redirecting to the login page.
 * @returns {Promise<void>}
 */
// Logout function
export async function logout() {
    const db = await getDatabase();
    
    try {
      const token = cookies().get("token")?.value;
      if (token) {
        if (!process.env.JWT_SECRET_KEY) {
          throw new Error('JWT_SECRET_KEY is not defined in environment variables');
        }
  
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        const { payload } = await jwtVerify(token, secret);
  
        if (payload.sessionId) {
          // Delete session from database
          await db.query<[SessionRow[], any]>(
            'DELETE FROM Session WHERE Session_ID = ?',
            [payload.sessionId]
          );
        }
      }
      
      cookies().delete("token");
    } catch (error) {
      console.error('Logout error:', error);
    }
    redirect("/login");
  }

const formSchema = z.object({
    title: z.string().min(1),
    price: z.coerce.number().min(1),
    description: z
        .string()
        .min(10, {
            message: "description must be at least 10 characters.",
        })
        .max(160, {
            message: "description must not be longer than 30 characters.",
        }),
    category: z.nativeEnum(ProductCategory),
    image: z.string().url(),
});

/**
 ** Creates a new product.
 *
 * @param {FormData} formData - The form data of the new product.
 * @returns {Promise<Product>} A promise that resolves to the created product.
 */
export async function createProduct(formData: FormData) {
    const session = await verifySession();
    if (!session) return [];
    // Redirect to home page if the user is not the Admin
    if (!session.isAdmin) {
        redirect("/");
    }

    try {
        const validatedFields = formSchema.safeParse({
            title: formData.get("title"),
            price: formData.get("price"),
            description: formData.get("description"),
            category: formData.get("category"),
            image: formData.get("image"),
        });

        // Return early if the form data is invalid
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }
        const res = await axios.post(
            `${API_URL}/products`,
            validatedFields.data,
        );

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { message: "Create Product successfully", data: res.data };
    } catch (error : any) {
        console.error(`Failed to create product:`, error?.response?.data);
        return {
            errors: {
                title: "There was an error with this title",
                description: "There was an error with this description",
                price: "There was an error with this price",
                category: "There was an error with this category",
                image: "There was an error with this image",
            },
            message: error?.response?.data,
        };
    }
}

/**
 * Updates an existing product.
 *
 * @param {string} id - The ID of the product to update.
 * @param {FormData} formData - The updated form data of the product.
 * @returns {Promise<Product> } A promise that resolves to the updated product.
 */
export async function updateProduct(id: string, formData: FormData) {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    const session = await verifySession();
    if (!session) return [];
    // Redirect to home page if the user is not the Admin
    if (!session.isAdmin) {
        redirect("/");
    }

    try {
        const validatedFields = formSchema.safeParse({
            title: formData.get("title"),
            price: formData.get("price"),
            description: formData.get("description"),
            category: formData.get("category"),
            image: formData.get("image"),
        });

        // Return early if the form data is invalid
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }
        const res = await axios.put(
            `${API_URL}/products/${id}`,
            validatedFields.data,
        );

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { message: "Update Product successfully", data: res.data };
    } catch (error: any) {
        console.error(`Failed to update product:`, error?.response?.data);
        return {
            errors: {
                title: "There was an error with this title",
                description: "There was an error with this description",
                price: "There was an error with this price",
                category: "There was an error with this category",
                image: "There was an error with this image",
            },
            message: error?.response?.data,
        };
    }
}

/**
 * Deletes a product.
 *
 * @param {string} id - The ID of the product to delete.
 * @returns {Promise<void>} A promise that resolves when the product is deleted.
 */
export async function deleteProduct(id: string) {
    // For enhanced security, the verifySession function can be used to authenticate the user.
    // While middleware is a viable option, verifySession can also be directly utilized within services.
    // We can use it also for checking the user role and other user data.
    // This forms part of the Data Access Layer (DAL).
    const session = await verifySession();
    if (!session) return [];
    // Redirect to home page if the user is not the Admin
    if (!session.isAdmin) {
        redirect("/");
    }

    try {
        const res = await axios.delete(`${API_URL}/products/${id}`);
        return res.data;
    } catch (error: any) {
        console.error(`Failed to delete product:`, error?.response?.data);
        return {
            message: error?.response?.data,
        };
    }
}