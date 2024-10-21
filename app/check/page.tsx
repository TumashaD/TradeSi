// app/check/page.tsx
import React from 'react';
import { getCustomers } from '@/lib/services'; // Import your function to fetch data

type Customer = {
    First_Name: string;
    Last_Name: string;
};

const CustomersTable = async () => {
    const customers: Customer[] = await getCustomers(); // Fetch customer data

    return (
        <div>
            <h1>Customers</h1>
            <table border={1}>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.length > 0 ? (
                        customers.map((customer, index) => (
                            <tr key={index}>
                                <td>{customer.First_Name}</td>
                                <td>{customer.Last_Name}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2}>No customers found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CustomersTable;