
import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const Orders = () => {
  const { currentUser } = useAuth();
  
  // Mock order data
  const orders = [
    {
      id: 'ORD-001',
      date: '2023-12-15',
      status: 'Delivered',
      total: 1450.00,
      items: [
        { name: 'Premium Business Laptop', quantity: 1, price: 1200.00 },
        { name: 'Professional Office Chair', quantity: 1, price: 250.00 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2023-12-02',
      status: 'Processing',
      total: 800.00,
      items: [
        { name: 'Smart Conference System', quantity: 1, price: 800.00 }
      ]
    }
  ];
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border text-center">
            <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
            <p className="text-gray-600">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg border overflow-hidden">
                <div className="bg-gray-50 p-4 border-b grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Order ID</span>
                    <span className="font-medium">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Date</span>
                    <span className="font-medium">{order.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Status</span>
                    <span className={`font-medium ${
                      order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Total</span>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium mb-3">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Orders;
