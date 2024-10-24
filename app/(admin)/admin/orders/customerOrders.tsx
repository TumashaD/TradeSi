import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Package } from "lucide-react";


interface OrderDetailsModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}
// Create a new OrderDetailsModal component
interface Customer {
  id: string;
  name: string;
}
interface Orders {
  [key: string]: Order[];
}

// Define the type for mockOrders
interface Order {
  orderId: string;
  date: string;
  items: string[];
  total: number;
  status: string;
}


// Add mock order data
const mockOrders: Orders = {
  'CUS1000': [
    { 
      orderId: 'ORD001',
      date: '2024-03-15',
      items: ['Product A', 'Product B'],
      total: 150,
      status: 'Delivered'
    },
    { 
      orderId: 'ORD002',
      date: '2024-02-28',
      items: ['Product C'],
      total: 75,
      status: 'Delivered'
    }
  ],
  // Add more mock data for other customers...
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ customer, isOpen, onClose }) => {
  const orders = customer ? mockOrders[customer.id] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
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
                    <TableCell>{order.items.join(', ')}</TableCell>
                    <TableCell className="text-right">${order.total}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for this customer
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;