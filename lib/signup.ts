import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import createConnection from "@/lib/db"; // Import your db connection setup

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { firstname, lastname, email, telephone, houseNumber, addressLine1, addressLine2, city, zipcode, password } = req.body;

  try {
    const connection = await createConnection(); // Establish MySQL connection

    // Check if the user already exists
    const [existingUser]: any = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user data
    await connection.execute(
      `INSERT INTO users (firstname, lastname, email, telephone, houseNumber, addressLine1, addressLine2, city, zipcode, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstname, lastname, email, telephone, houseNumber, addressLine1, addressLine2, city, zipcode, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Sign-up failed:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
