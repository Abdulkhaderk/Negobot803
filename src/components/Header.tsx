
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User } from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { cart } = useProducts();
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">NEGO</Link>
        
        <div className="flex items-center gap-6">
          {currentUser ? (
            <>
              <nav className="hidden md:flex space-x-6">
                {currentUser.role === 'customer' && (
                  <>
                    <Link to="/products" className="text-gray-700 hover:text-primary font-medium">
                      Products
                    </Link>
                    <Link to="/orders" className="text-gray-700 hover:text-primary font-medium">
                      Orders
                    </Link>
                  </>
                )}
                {currentUser.role === 'seller' && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-primary font-medium">
                      Dashboard
                    </Link>
                    <Link to="/manage-products" className="text-gray-700 hover:text-primary font-medium">
                      Manage Products
                    </Link>
                  </>
                )}
              </nav>
              
              <div className="flex items-center gap-4">
                {currentUser.role === 'customer' && (
                  <Link to="/cart" className="relative">
                    <ShoppingCart className="h-6 w-6 text-gray-700" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}
                
                <div className="relative group">
                  <Button variant="ghost" className="rounded-full p-2">
                    <User className="h-5 w-5" />
                  </Button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg hidden group-hover:block">
                    <div className="p-3 border-b">
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Role: {currentUser.role}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
