
import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();
  
  // Redirect customer users
  React.useEffect(() => {
    if (currentUser?.role === 'customer') {
      navigate('/products');
    }
  }, [currentUser, navigate]);
  
  // Actual product count
  const productCount = products.length;
  
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
              <CardTitle className="text-lg font-medium">Products</CardTitle>
              <CardDescription>Total active products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Bot Status</CardTitle>
              <CardDescription>Negotiation assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                Active
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Settings</CardTitle>
              <CardDescription>System configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/manage-products')} variant="outline" size="sm">
                Manage Products
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="orders" className="mb-8">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="settings">Bot Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  Manage your recent orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders to display yet.</p>
                  <p className="text-sm text-gray-500 mt-1">When customers place orders, they'll appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Negotiation Bot Settings</CardTitle>
                <CardDescription>
                  Configure how your AI negotiation assistant interacts with customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-1">Discount Limits</h3>
                    <p className="text-sm text-gray-600">
                      Your negotiation bot is currently configured to accept discounts up to 25% off the listed price.
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-1">Wholesale Pricing</h3>
                    <p className="text-sm text-gray-600">
                      Wholesale pricing is enabled for qualifying purchases. Configure minimum quantities and discount rates.
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline">Edit Bot Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default Dashboard;
