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
