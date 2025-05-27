
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, useProducts } from './ProductContext';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  activeProduct: Product | null;
  setActiveProduct: (product: Product | null) => void;
  sendMessage: (text: string) => void;
  negotiatePrice: (product: Product, quantity: number, offeredPrice: number) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const { calculateNegotiatedPrice, addToCart } = useProducts();

  const sendBotGreeting = (product: Product) => {
    const greeting = `👋 Hello! I'm your NEGO assistant for "${product.name}". 

Current price: ₹${product.price.toFixed(2)}

I can help you get the best deal possible! What would you like to know about this product?`;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text: greeting,
      timestamp: new Date()
    };
    
    setMessages([newMessage]);
  };

  const setProductAndGreet = (product: Product | null) => {
    setActiveProduct(product);
    if (product) {
      sendBotGreeting(product);
    } else {
      setMessages([]);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setTimeout(() => {
      if (activeProduct) {
        processUserMessage(text.trim(), activeProduct);
      }
    }, 800);
  };

  const processUserMessage = (text: string, product: Product) => {
    const lowerText = text.toLowerCase();
    let responseText = '';
    
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      responseText = `Hello! Great to see you're interested in the ${product.name}. What would you like to know about it?`;
    }
    else if (lowerText.includes('tell me more') || lowerText.includes('more information') || lowerText.includes('details') || lowerText.includes('about') || lowerText.includes('features')) {
      responseText = `📝 ${product.name}

${product.description}

⭐ Rating: ${product.rating}/5 stars
📦 In Stock: ${product.inventory} units
💰 Current Price: ₹${product.price.toFixed(2)}

This is a popular choice! Ready to make a deal?`;
    }
    else if (lowerText.includes('best price') || lowerText.includes('lowest price') || lowerText.includes('minimum price') || lowerText.includes('discount')) {
      responseText = `🎯 I can definitely work with you on the price! 

For the ${product.name}, I have some flexibility to negotiate. What price range were you thinking?`;
    }
    else if (lowerText.includes('wholesale') || lowerText.includes('bulk') || lowerText.includes('quantity')) {
      responseText = "💼 Bulk Order Benefits:\n\n";
      if (product.wholesalePricing && product.wholesalePricing.length > 0) {
        product.wholesalePricing.forEach(tier => {
          const discountedPrice = product.price * (1 - tier.discountPercentage / 100);
          responseText += `• ${tier.quantity}+ units: ${tier.discountPercentage}% off (₹${discountedPrice.toFixed(2)} each)\n`;
        });
        responseText += "\nHow many units are you considering?";
      } else {
        responseText += "While this product doesn't have specific bulk pricing, I can still negotiate better rates for larger quantities!";
      }
    }
    else if (lowerText.includes('listed price') || lowerText.includes('take it at') || lowerText.includes('full price')) {
      responseText = `Perfect! The ${product.name} at ₹${product.price.toFixed(2)} is a great choice. 

Would you like me to add it to your cart, or shall we see if I can get you an even better deal first? 😊`;
    }
    else if (lowerText.match(/₹\s*\d+/) || lowerText.match(/\d+\s*rupees/) || (lowerText.includes('offer') && lowerText.match(/\d+/))) {
      const priceMatch = lowerText.match(/₹\s*(\d+(?:\.\d+)?)/);
      const rupeesMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*rupees/);
      const offerMatch = lowerText.match(/(\d+(?:\.\d+)?)/);
      
      let parsedOffer = 0;
      if (priceMatch) {
        parsedOffer = parseFloat(priceMatch[1]);
      } else if (rupeesMatch) {
        parsedOffer = parseFloat(rupeesMatch[1]);
      } else if (offerMatch) {
        parsedOffer = parseFloat(offerMatch[1]);
      }
      
      if (parsedOffer > 0) {
        const quantityMatch = lowerText.match(/(\d+)\s*(?:units?|items?|pieces?)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        
        const minAcceptablePrice = product.price * 0.75;
        const pricePerUnit = parsedOffer / quantity;
        
        if (pricePerUnit >= minAcceptablePrice) {
          const savings = (product.price * quantity) - parsedOffer;
          const discountPercent = Math.round(((product.price - pricePerUnit) / product.price) * 100);
          responseText = `🎉 Excellent offer! 

I can accept ₹${parsedOffer.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${product.name}.

✅ Your savings: ₹${savings.toFixed(2)} (${discountPercent}% off)
💰 Final price: ₹${parsedOffer.toFixed(2)}

Should I add this to your cart with this negotiated price?`;
        } else {
          const counterOffer = minAcceptablePrice * quantity;
          responseText = `🤔 That's a bit too low for us.

💡 How about ₹${minAcceptablePrice.toFixed(2)} per unit (₹${counterOffer.toFixed(2)} total)?
📊 That's still a great ${Math.round(((product.price - minAcceptablePrice) / product.price) * 100)}% discount!

What do you think?`;
        }
      }
    }
    else if (lowerText.includes('add to cart') || lowerText.includes('buy') || lowerText.includes('purchase')) {
      responseText = `🛒 I can add the ${product.name} to your cart right away!

Current price: ₹${product.price.toFixed(2)}

But wait - let me see if I can get you a better deal first! What's your budget for this item?`;
    }
    else if (lowerText.includes('thank') || lowerText.includes('thanks')) {
      responseText = "You're very welcome! 😊 Is there anything else about this product I can help you with?";
    }
    else {
      const fallbackResponses = [
        `Great question! For the ${product.name} at ₹${product.price.toFixed(2)}, I'm here to help you get the best possible deal. What's your budget?`,
        `I'd be happy to help with that! This ${product.name} is popular for good reasons. Are you ready to negotiate a price?`,
        `Absolutely! Since you're interested in the ${product.name}, what price point would work best for you?`
      ];
      
      responseText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: responseText,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, botMessage]);
  };

  const negotiatePrice = (product: Product, quantity: number, offeredPrice: number) => {
    // This function is kept for compatibility but main logic is in ChatInterface
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user', 
      text: `I'd like to offer ₹${offeredPrice.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'}.`,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setTimeout(() => {
      processUserMessage(`offer ${offeredPrice} rupees for ${quantity} units`, product);
    }, 800);
  };

  const clearChat = () => {
    setMessages([]);
    setActiveProduct(null);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      activeProduct,
      setActiveProduct: setProductAndGreet,
      sendMessage,
      negotiatePrice,
      clearChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
