
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  minPrice: number; // Minimum price after negotiation (75% of original)
  image: string;
  category: string;
  inventory: number;
  rating: number;
  reviews: Review[];
  wholesalePricing?: {
    quantity: number;
    discountPercentage: number;
  }[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateNegotiatedPrice: (product: Product, quantity: number, offeredPrice: number) => {
    accepted: boolean;
    finalPrice: number;
    message: string;
  };
  addReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

export interface CartItem {
  product: Product;
  quantity: number;
  negotiatedPrice?: number;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Mock product data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Business Laptop',
    description: 'High-performance laptop with 16GB RAM and 512GB SSD',
    price: 1200,
    minPrice: 900, // 75% of original price
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
    category: 'Electronics',
    inventory: 50,
    rating: 4.7,
    reviews: [
      {
        id: '101',
        userId: '2',
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Excellent laptop for business use. Battery life is impressive.',
        date: '2023-11-15'
      }
    ],
    wholesalePricing: [
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 },
      { quantity: 20, discountPercentage: 20 }
    ]
  },
  {
    id: '2',
    name: 'Professional Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 250,
    minPrice: 187.5, // 75% of original price
    image: 'https://images.unsplash.com/photo-1505649118510-a5d934d3af17?q=80&w=2070&auto=format&fit=crop',
    category: 'Office Furniture',
    inventory: 100,
    rating: 4.5,
    reviews: [
      {
        id: '102',
        userId: '2',
        userName: 'Michael Brown',
        rating: 4,
        comment: 'Very comfortable for long work days. Assembly was straightforward.',
        date: '2023-10-20'
      }
    ],
    wholesalePricing: [
      { quantity: 5, discountPercentage: 8 },
      { quantity: 10, discountPercentage: 12 },
      { quantity: 20, discountPercentage: 18 }
    ]
  },
  {
    id: '3',
    name: 'Smart Conference System',
    description: 'All-in-one conference system with HD camera and microphone array',
    price: 800,
    minPrice: 600, // 75% of original price
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop',
    category: 'Electronics',
    inventory: 30,
    rating: 4.8,
    reviews: [
      {
        id: '103',
        userId: '2',
        userName: 'Lisa Chen',
        rating: 5,
        comment: 'Great audio and video quality. Perfect for our remote team meetings.',
        date: '2023-12-05'
      }
    ],
    wholesalePricing: [
      { quantity: 2, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ]
  },
  {
    id: '4',
    name: 'Multifunction Printer',
    description: 'Color laser printer with scanning and copying capabilities',
    price: 350,
    minPrice: 262.5, // 75% of original price
    image: 'https://images.unsplash.com/photo-1612815292258-f4471d1e7596?q=80&w=2070&auto=format&fit=crop',
    category: 'Office Equipment',
    inventory: 45,
    rating: 4.2,
    reviews: [
      {
        id: '104',
        userId: '2',
        userName: 'David Wilson',
        rating: 4,
        comment: 'Good quality prints and fast operation. Network setup was easy.',
        date: '2023-09-18'
      }
    ],
    wholesalePricing: [
      { quantity: 3, discountPercentage: 7 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ]
  },
  {
    id: '5',
    name: 'Digital Whiteboard',
    description: 'Interactive smart whiteboard with cloud integration',
    price: 1500,
    minPrice: 1125, // 75% of original price
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop',
    category: 'Office Equipment',
    inventory: 20,
    rating: 4.9,
    reviews: [
      {
        id: '105',
        userId: '2',
        userName: 'Emily Rodriguez',
        rating: 5,
        comment: 'Transformed our brainstorming sessions. The cloud integration is seamless.',
        date: '2023-11-30'
      }
    ],
    wholesalePricing: [
      { quantity: 2, discountPercentage: 7 },
      { quantity: 3, discountPercentage: 12 },
      { quantity: 5, discountPercentage: 17 }
    ]
  },
  {
    id: '6',
    name: 'Executive Desk',
    description: 'Premium oak executive desk with cable management system',
    price: 650,
    minPrice: 487.5, // 75% of original price
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2039&auto=format&fit=crop',
    category: 'Office Furniture',
    inventory: 15,
    rating: 4.6,
    reviews: [
      {
        id: '106',
        userId: '2',
        userName: 'Robert Taylor',
        rating: 5,
        comment: 'Beautiful craftsmanship and very sturdy. The cable management is a great feature.',
        date: '2023-10-12'
      }
    ],
    wholesalePricing: [
      { quantity: 2, discountPercentage: 5 },
      { quantity: 5, discountPercentage: 10 },
      { quantity: 10, discountPercentage: 15 }
    ]
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      // Check if product already in cart
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if product already in cart
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateNegotiatedPrice = (product: Product, quantity: number, offeredPrice: number) => {
    // Check if it's a wholesale order and apply appropriate discount
    let basePrice = product.price;
    let wholesaleDiscount = 0;
    
    if (product.wholesalePricing) {
      // Sort by quantity desc to get the highest applicable discount
      const sortedPricing = [...product.wholesalePricing].sort((a, b) => b.quantity - a.quantity);
      
      for (const pricing of sortedPricing) {
        if (quantity >= pricing.quantity) {
          wholesaleDiscount = pricing.discountPercentage;
          break;
        }
      }
    }
    
    if (wholesaleDiscount > 0) {
      basePrice = basePrice * (1 - wholesaleDiscount / 100);
    }
    
    const minAcceptablePrice = product.minPrice;
    const pricePerUnit = offeredPrice / quantity;
    const negotiationResult = {
      accepted: pricePerUnit >= minAcceptablePrice,
      finalPrice: 0,
      message: ''
    };

    if (negotiationResult.accepted) {
      negotiationResult.finalPrice = offeredPrice;
      negotiationResult.message = "We accept your offer. It's a deal!";
    } else {
      // Counter-offer at the minimum acceptable price
      negotiationResult.finalPrice = minAcceptablePrice * quantity;
      negotiationResult.message = `I'm afraid we can't go that low. Our best offer is $${negotiationResult.finalPrice.toFixed(2)} for ${quantity} units.`;
    }

    return negotiationResult;
  };

  const addReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `${Math.random().toString(36).substring(2, 10)}`,
      date: new Date().toISOString().split('T')[0]
    };
    
    // In a real app, you'd send this to an API
    // For now, we'll just log it
    console.log('New review added:', newReview);
  };

  return (
    <ProductContext.Provider value={{
      products,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      calculateNegotiatedPrice,
      addReview
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
