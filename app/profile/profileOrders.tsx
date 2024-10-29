import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Order } from "@/types/admin";

interface ProfileOrdersProps {
    orders: Order[];
}

const ProfileOrders: React.FC<ProfileOrdersProps> = ({ orders }) => (
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
                    {orders.map((order: any) => (
                        <TableRow key={order.orderId}>
                            <TableCell className="font-medium">{order.orderId}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.items}</TableCell>
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
);

export default ProfileOrders;