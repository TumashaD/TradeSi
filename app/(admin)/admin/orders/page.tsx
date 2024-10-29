"use client";
import React, { useState, useEffect} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Download,
    SlidersHorizontal,
    Users,
    ShoppingCart,
    DollarSign,
} from "lucide-react";
import OrderDetailsModal from "./customerOrders";
import { getTotalCustomers, getTotalOrders, getAvgOrderValue, getCustomerOrderReport} from "@/lib/services/admin";
import SummaryCard from "../../summaryCard";
import type { CustomerOrderReport} from "@/types/admin";

const CustomerOrderReport = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFrame, setTimeFrame] = useState("30days");
    const [sortBy, setSortBy] = useState("totalOrders");
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOrderReport | null>(
        null,
    );
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [avgOrderValue, setAvgOrderValue] = useState(0);
    const [customerData, setCustomerData] = useState<CustomerOrderReport[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customers, totalCustomers, totalOrders, avgOrderValue] = await Promise.all([
                    getCustomerOrderReport(),
                    getTotalCustomers(),
                    getTotalOrders(),
                    getAvgOrderValue()
                ]);
                
                setCustomerData(Array.isArray(customers) ? customers : []);
                setTotalCustomers(totalCustomers || 0);
                setTotalOrders(totalOrders || 0);
                setAvgOrderValue(avgOrderValue || 0);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCustomers = customerData.filter(customer => 
        customer.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.Customer_ID.toString().includes(searchTerm)
    );

    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        switch (sortBy) {
            case 'totalOrders':
                return b.Total_Orders - a.Total_Orders;
            case 'totalSpent':
                return b.Total_Spent - a.Total_Spent;
            case 'lastOrder':
                return new Date(b.Last_Order).getTime() - new Date(a.Last_Order).getTime();
            case 'avgOrderValue':
                return b.Avg_Order_Value - a.Avg_Order_Value;
            default:
                return 0;
        }
    });

    if (isLoading) {
        return (
            <div className="flex-col space-y-6 p-8">
                <div className="flex h-screen items-center justify-center">
                    <p className="text-lg text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-col space-y-6 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Customer Order Report
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Detailed analysis of customer ordering patterns and
                        behavior
                    </p>
                </div>
            </div>

            <Separator />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                    title="Total Customers"
                    amount={totalCustomers}
                    logo={<Users />}
                />

                <SummaryCard
                    title="Total Orders"
                    amount={totalOrders}
                    logo={<ShoppingCart />}
                />

                <SummaryCard
                    title="Average Order Value"
                    amount={avgOrderValue}
                    amountType="currency"
                    logo={<DollarSign />}
                />
            </div>

            {/* Filters and Search */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers..."
                            className="w-64 pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="totalOrders">
                                Total Orders
                            </SelectItem>
                            <SelectItem value="totalSpent">
                                Total Spent
                            </SelectItem>
                            <SelectItem value="lastOrder">
                                Last Order Date
                            </SelectItem>
                            <SelectItem value="avgOrderValue">
                                Avg Order Value
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Customer Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                    <CardDescription>
                        Detailed view of customer ordering patterns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">
                                    Total Orders
                                </TableHead>
                                <TableHead className="text-right">
                                    Total Spent
                                </TableHead>
                                <TableHead>Last Order</TableHead>
                                <TableHead className="text-right">
                                    Avg Order Value
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedCustomers.map((customer) => (
                                <TableRow 
                                    key={customer.Customer_ID.toString()}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => {
                                        setSelectedCustomer(customer);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <TableCell>{customer.Customer_ID.toString()}</TableCell>
                                    <TableCell>{customer.Name}</TableCell>
                                    <TableCell>{customer.Email}</TableCell>
                                    <TableCell className="text-right">
                                        {customer.Total_Orders}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ${customer.Total_Spent.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(customer.Last_Order).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ${customer.Avg_Order_Value.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {selectedCustomer && (
                <OrderDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    customer={selectedCustomer ? { id: selectedCustomer.Customer_ID.toString(), name: selectedCustomer.Name } : { id: "0", name: "" }}
                />
            )}
        </div>
    );
};

export default CustomerOrderReport;