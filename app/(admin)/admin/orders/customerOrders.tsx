import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";
import { getCustomerOrders } from "@/lib/services";

interface Order {
    orderId: string;
    date: string;
    items: string[]; // Ensure items is an array of strings
    total: number;
    status: string;
}

interface OrderDetailsModalProps {
    customer: { id: string; name: string } | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ customer, isOpen, onClose }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (customer) {
            const fetchData = async () => {
                try {
                    const orders = await getCustomerOrders(customer.id.toString());
                    setOrders(Array.isArray(orders) ? orders : []);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }
    }, [customer]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order History - {customer?.name}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[600px]">
                    {orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.orderId}>
                                        <TableCell className="font-medium">{order.orderId}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>
                                            {order.items}
                                        </TableCell>
                                        <TableCell className="text-right">${order.total}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>No orders found.</p>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsModal;