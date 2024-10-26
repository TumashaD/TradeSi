import bcrypt from "bcryptjs"; // For hashing passwords
import { connectToDatabase } from "@/lib/db"; // Change the import to use your MySQL connection utility

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { firstname, lastname, email, telephone, address, password } = req.body;

        // Basic validation
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const db = await connectToDatabase();

            // Prepare the SQL query
            const query = `
                INSERT INTO users (firstname, lastname, email, telephone, address, password) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [firstname, lastname, email, telephone, address, hashedPassword];

            // Execute the SQL query
            const [result] = await db.execute(query, values);

            return res.status(201).json({ message: "User registered successfully!", userId: result.insertId });
        } catch (error) {
            console.error("Error registering user:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        // Handle any other HTTP method
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
