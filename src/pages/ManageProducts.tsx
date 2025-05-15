
import React, { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, Product } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const ManageProducts = () => {
  const { currentUser } = useAuth();
  const { products, addProduct } = useProducts();
  const navigate = useNavigate();
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'reviews'>>({
    name: '',
    description: '',
    price: 0,
    minPrice: 0,
    image: 'https://images.unsplash.com/photo-1505649118510-a5d934d3af17?q=80&w=2070&auto=format&fit=crop',
    category: 'Electronics',
    inventory: 0,
    rating: 0,
    wholesalePricing: [
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ]
  });
  
  // Redirect if not seller
  React.useEffect(() => {
    if (currentUser?.role !== 'seller') {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleAddProduct = () => {
    // Calculate minPrice as 75% of regular price
    const minPriceValue = newProduct.price * 0.75;
    
    addProduct({
      ...newProduct,
      minPrice: minPriceValue
    });
    
    setIsAddProductOpen(false);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      minPrice: 0,
      image: 'https://images.unsplash.com/photo-1505649118510-a5d934d3af17?q=80&w=2070&auto=format&fit=crop',
      category: 'Electronics',
      inventory: 0,
      rating: 0,
      wholesalePricing: [
        { quantity: 5, discountPercentage: 10 },
        { quantity: 10, discountPercentage: 15 }
      ]
    });
    
    toast({
      title: "Product added",
      description: "Your new product has been added successfully."
    });
  };
  
  const categories = ['Electronics', 'Office Furniture', 'Office Equipment'];
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manage Products</h1>
          
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details for your new product.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Select 
                    value={newProduct.category} 
                    onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inventory" className="text-right">Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    value={newProduct.inventory}
                    onChange={(e) => setNewProduct({...newProduct, inventory: parseInt(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image URL</Label>
                  <Input
                    id="image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={handleAddProduct}>Add Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {product.rating} · {product.inventory} in stock · {product.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-4">
                  <p className="font-semibold">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    Min price: ${product.minPrice.toFixed(2)} (25% discount limit)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
};

export default ManageProducts;
