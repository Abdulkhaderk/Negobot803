
import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect customer users
  React.useEffect(() => {
    if (currentUser?.role === 'customer') {
      navigate('/products');
    }
  }, [currentUser, navigate]);
  
  // Mock data for dashboard
  const salesData = {
    today: 1250,
    week: 8450,
    month: 32500,
    pendingOrders: 5,
    completedOrders: 28,
    negotiationData: [
      { product: 'Premium Business Laptop', avgDiscount: 15, successRate: 72 },
      { product: 'Professional Office Chair', avgDiscount: 12, successRate: 85 },
      { product: 'Smart Conference System', avgDiscount: 8, successRate: 92 }
    ]
  };
  
  if (!currentUser || currentUser.role !== 'seller') {
    return null; // Will redirect in useEffect
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {currentUser.name}! Here's an overview of your business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Today's Sales</CardTitle>
              <CardDescription>Total sales for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${salesData.today.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Weekly Sales</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${salesData.week.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Pending Orders</CardTitle>
              <CardDescription>Orders waiting to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesData.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="negotiations" className="mb-8">
          <TabsList>
            <TabsTrigger value="negotiations">Negotiation Analytics</TabsTrigger>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="negotiations">
            <Card>
              <CardHeader>
                <CardTitle>Product Negotiation Performance</CardTitle>
                <CardDescription>
                  Analytics on how your products are performing in negotiations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Product</th>
                        <th className="text-left py-3 px-4">Avg. Discount</th>
                        <th className="text-left py-3 px-4">Success Rate</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.negotiationData.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-3 px-4">{item.product}</td>
                          <td className="py-3 px-4">{item.avgDiscount}%</td>
                          <td className="py-3 px-4">{item.successRate}%</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Last 5 orders received
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">Order #{(idx + 1001).toString()}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(Date.now() - idx * 86400000).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-right">
                            ${(Math.random() * 1000 + 200).toFixed(2)}
                          </div>
                          <div className={`text-sm ${
                            idx % 3 === 0 ? 'text-amber-600' : 'text-green-600'
                          } text-right`}>
                            {idx % 3 === 0 ? 'Processing' : 'Completed'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Negotiation Bot Settings</CardTitle>
            <CardDescription>
              Configure how your AI negotiation assistant interacts with customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Your negotiation bot is currently configured to accept discounts up to 25% off the listed price.
              Wholesale pricing is enabled for qualifying purchases.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline">Edit Bot Settings</Button>
              <Button variant="outline">View Negotiation Logs</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Dashboard;
