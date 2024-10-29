import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import { cache } from 'react';

dotenv.config();

// Declare global type
declare global {
    var dbInstance: Database | undefined;
    var dbInitPromise: Promise<void> | undefined;
}

class Database {
    private pool: Pool;

    private constructor() {
        const {
            DB_HOSTNAME,
            DB_PORT,
            DB_USER,
            DB_PASSWORD,
            DB_DATABASE
        } = process.env;

        if (!DB_HOSTNAME || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
            throw new Error('Missing required database configuration environment variables');
        }

        this.pool = mysql.createPool({
            host: DB_HOSTNAME,
            port: DB_PORT ? Number(DB_PORT) : 3306,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_DATABASE,
            multipleStatements: true,
        });
    }

    public static async getInstance(): Promise<Database> {
        if (!global.dbInstance) {
            global.dbInstance = new Database();
            console.log('Database instance created..................');
        }

        // Initialize if not already doing so
        if (!global.dbInitPromise) {
            global.dbInitPromise = global.dbInstance.initialize();
        }

        // Wait for initialization to complete
        await global.dbInitPromise;
        return global.dbInstance;
    }

    private async initialize(): Promise<void> {
        try {
            const connection = await this.pool.getConnection();
            console.log('Database connection pool established successfully.');
            connection.release();
        } catch (error) {
            console.error('Failed to initialize database connection pool:', error);
            // Reset the initialization promise so we can try again
            global.dbInitPromise = undefined;
            throw error;
        }
    }

    public async query<T extends [mysql.RowDataPacket[], mysql.ResultSetHeader]>(
        sql: string, 
        values?: any[]
    ): Promise<[T, any]> {
        const connection = await this.pool.getConnection();
        try {
            const result = await connection.query<T>(sql, values);
            return result;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    public async end(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            global.dbInitPromise = undefined;
            global.dbInstance = undefined;
        }
    }
}

// Development vs Production check
const isDevelopment = process.env.NODE_ENV === 'development';

// Export a function to get a database instance
const getDatabase = async (): Promise<Database> => {
    // In development, warn about connection pool recreation
    if (isDevelopment && !global.dbInstance) {
        console.warn('Creating new database connection pool in development mode');
    }
    return Database.getInstance();
};

export default getDatabase;