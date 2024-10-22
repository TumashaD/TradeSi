import mysql, { Connection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let connection: Connection;

const db_hostname = process.env.DB_HOSTNAME; // Use uppercase and match the .env variable names
const db_port = process.env.DB_PORT;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_database = process.env.DB_DATABASE;

const createConnection = async (): Promise<Connection> => {
  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host: db_hostname,         // MySQL host
        port: Number(db_port),     // Make sure the port is a number
        user: db_user,         // MySQL username
        password: db_password,     // MySQL password
        database: db_database,     // Database name
        connectTimeout: 15000, // Increase to 15 seconds (15000 ms)
      });
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      throw error; // Re-throw the error after logging
    }
  }
  return connection;
};

export default createConnection;