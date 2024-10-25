import { registerUser } from './services'; // Adjust the path as necessary
import pool from '@/lib/db'; // Import your database connection pool

jest.mock('@/lib/db'); // Mock the database connection

describe('registerUser', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'securePassword123';
    const mockUserData = {
        username: 'testUser',
        email: mockEmail,
        password: mockPassword,
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock history before each test
    });

    it('should successfully register a user', async () => {
        // Mock the database query method
        (pool as jest.Mock).mockResolvedValue({
            query: jest.fn().mockResolvedValue([{}]), // Simulate a successful query
        });

        const result = await registerUser(mockEmail, mockPassword, mockUserData);
        expect(result).toBe(true);
    });

    it('should handle registration errors', async () => {
        // Mock the database query method to throw an error
        (pool as jest.Mock).mockResolvedValue({
            query: jest.fn().mockRejectedValue(new Error('Database error')), // Simulate an error
        });

        const result = await registerUser(mockEmail, mockPassword, mockUserData);
        expect(result).toBe(false); // Expect the function to return false
    });
});
