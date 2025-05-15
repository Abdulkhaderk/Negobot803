
import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { IndianRupee } from 'lucide-react';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useProducts();
  const { toast } = useToast();
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.negotiatedPrice || item.product.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Check if cart is empty
  const isCartEmpty = cart.length === 0;
  
  const handleCheckout = () => {
    toast({
      title: "Order placed successfully!",
      description: `Your order for ${cart.reduce((total, item) => total + item.quantity, 0)} items has been placed.`,
    });
    
    // Clear the cart
    clearCart();
  };
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>
        
        {isCartEmpty ? (
          <div className="bg-white rounded-lg p-8 border text-center animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Browse our products to add items to your cart</p>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const unitPrice = item.negotiatedPrice || item.product.price;
                const itemTotal = unitPrice * item.quantity;
                const isNegotiated = item.negotiatedPrice !== undefined;
                
                return (
                  <div 
                    key={item.product.id}
                    className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-scale-in"
                  >
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-1">
                        <div>
                          <span className="text-gray-500">Price:</span>{' '}
                          <span className="font-medium flex items-center">
                            <IndianRupee className="h-3 w-3 mr-1" />
                            {unitPrice.toFixed(2)}
                            {isNegotiated && (
                              <span className="ml-1 text-green-600 text-xs">(Negotiated)</span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>{' '}
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>{' '}
                          <span className="font-medium flex items-center">
                            <IndianRupee className="h-3 w-3 mr-1" />
                            {itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 self-end sm:self-center">
                      <div className="flex border rounded overflow-hidden">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 flex items-center justify-center min-w-[40px]">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6 sticky top-24 animate-scale-in">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium flex items-center">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mb-4" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
                
                <Link to="/products">
                  <Button variant="outline" className="w-full" size="lg">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Cart;
