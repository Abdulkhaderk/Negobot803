
import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

const Orders = () => {
  const { currentUser } = useAuth();
  
  // This would be replaced with real order data from a database
  // For now we'll show an empty state
  const orders = [];
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {currentUser?.role === 'seller' ? 'Customer Orders' : 'Your Orders'}
        </h1>
        
        {orders.length === 0 ? (
          <Card className="bg-white rounded-lg p-8 border text-center">
            <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
            <p className="text-gray-600">
              {currentUser?.role === 'seller' 
                ? 'Customer orders will appear here once they make purchases.'
                : 'Your order history will appear here once you make a purchase.'}
            </p>
          </Card>
        ) : (
          <Table>
            <TableCaption>A list of your recent orders.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </>
  );
};

export default Orders;
