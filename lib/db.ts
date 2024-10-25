// import mysql, { Connection } from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();

// let connection: Connection;

// const db_hostname = process.env.DB_HOSTNAME; // Use uppercase and match the .env variable names
// const db_port = process.env.DB_PORT;
// const db_user = process.env.DB_USER;
// const db_password = process.env.DB_PASSWORD;
// const db_database = process.env.DB_DATABASE;

// const createConnection = async (): Promise<Connection> => {
//   if (!connection) {
//     try {
//       connection = await mysql.createConnection({
//         host: db_hostname,         // MySQL host
//         port: Number(db_port),     // Make sure the port is a number
//         user: db_user,         // MySQL username
//         password: db_password,     // MySQL password
//         database: db_database,     // Database name
//         connectTimeout: 15000, // Increase to 15 seconds (15000 ms)
//       });
//       console.log('Database connection established successfully.');
//     } catch (error) {
//       console.error('Failed to connect to the database:', error);
//       throw error; // Re-throw the error after logging
//     }
//   }
//   return connection;
// };

// export default createConnection;

import mysql, { Pool, PoolConnection, Connection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    private static instance: Database;
    private pool: Pool;
    private isInitialized: boolean = false;

    private constructor() {
        const {
            DB_HOSTNAME,
            DB_PORT,
            DB_USER,
            DB_PASSWORD,
            DB_DATABASE
        } = process.env;

        // Validate environment variables
        if (!DB_HOSTNAME || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
            throw new Error('Missing required database configuration environment variables');
        }

        this.pool = mysql.createPool({
            host: DB_HOSTNAME,
            port: DB_PORT ? Number(DB_PORT) : 3306,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            connectTimeout: 15000,
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Test the connection
            const connection = await this.pool.getConnection();
            console.log('Database connection pool established successfully.');
            connection.release();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize database connection pool:', error);
            throw error;
        }
    }

    public async getConnection(): Promise<PoolConnection> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.pool.getConnection();
    }

    public async query<T extends [mysql.RowDataPacket[], mysql.ResultSetHeader]>(sql: string, values?: any[]): Promise<[T, any]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await this.getConnection();
            const result = await connection.query<T>(sql, values);
            return result;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    public async end(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.isInitialized = false;
        }
    }
}

// Export a function to get a database instance
const getDatabase = async (): Promise<Database> => {
    const db = Database.getInstance();
    await db.initialize();
    return db;
};

export default getDatabase;
