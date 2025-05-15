
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, useProducts } from './ProductContext';

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

  // Initial greeting when a product is selected
  const sendBotGreeting = (product: Product) => {
    const greeting = `Hi there! I'm your negotiation assistant for ${product.name}. The listed price is $${product.price.toFixed(2)}. Would you like to make an offer, or shall I tell you more about this product?`;
    
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
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Process user message and generate bot response
    setTimeout(() => {
      if (activeProduct) {
        processUserMessage(text, activeProduct);
      }
    }, 500);
  };

  const processUserMessage = (text: string, product: Product) => {
    const lowerText = text.toLowerCase();
    let responseText = '';
    
    // Simple NLP to interpret common intents
    if (lowerText.includes('tell me more') || lowerText.includes('more information') || lowerText.includes('details')) {
      responseText = `${product.name} - ${product.description}. It has received an average rating of ${product.rating} stars. We currently have ${product.inventory} units in stock.`;
    } 
    else if (lowerText.includes('wholesale') || lowerText.includes('bulk') || lowerText.includes('discount')) {
      responseText = "We offer volume discounts! Here's our wholesale pricing:\n";
      if (product.wholesalePricing) {
        product.wholesalePricing.forEach(tier => {
          responseText += `• Buy ${tier.quantity}+ units: ${tier.discountPercentage}% discount\n`;
        });
      } else {
        responseText += "Sorry, this product doesn't have special wholesale pricing.";
      }
    } 
    else if (lowerText.match(/\$\d+/) || lowerText.match(/\d+ dollars/) || (lowerText.includes('offer') && lowerText.match(/\d+/))) {
      // Extract price from message
      const priceMatch = lowerText.match(/\$(\d+(\.\d+)?)/);
      const numberMatch = lowerText.match(/(\d+) dollars/);
      const offerMatch = lowerText.includes('offer') ? lowerText.match(/(\d+)/) : null;
      
      let parsedOffer = 0;
      if (priceMatch) {
        parsedOffer = parseFloat(priceMatch[1]);
      } else if (numberMatch) {
        parsedOffer = parseFloat(numberMatch[1]);
      } else if (offerMatch) {
        parsedOffer = parseFloat(offerMatch[1]);
      }
      
      if (parsedOffer > 0) {
        // Default to 1 unit if quantity not specified
        const quantityMatch = lowerText.match(/(\d+) (?:units|items|pieces)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        
        const negotiationResult = calculateNegotiatedPrice(product, quantity, parsedOffer);
        
        if (negotiationResult.accepted) {
          responseText = `${negotiationResult.message} I've added ${quantity} ${quantity > 1 ? 'units' : 'unit'} to your cart at the negotiated price of $${parsedOffer.toFixed(2)} ${quantity > 1 ? 'per unit' : ''}.`;
          
          // Add to cart with negotiated price
          addToCart(product, quantity);
        } else {
          responseText = negotiationResult.message;
        }
      } else {
        responseText = "I didn't catch the price you're offering. Could you please state your offer clearly, like '$100' or '100 dollars'?";
      }
    } 
    else {
      // Generic responses for other inputs
      const genericResponses = [
        `Would you like to make an offer for the ${product.name}? The current price is $${product.price.toFixed(2)}.`,
        `Is there anything specific you'd like to know about the ${product.name}?`,
        `We can offer up to 25% discount on this item, depending on quantity. Would you like to make an offer?`,
        `This ${product.name} is one of our best sellers. Would you like to negotiate a price?`
      ];
      
      responseText = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
    
    const botMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text: responseText,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, botMessage]);
  };

  const negotiatePrice = (product: Product, quantity: number, offeredPrice: number) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `I'd like to offer $${offeredPrice.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${product.name}.`,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Process negotiation and respond
    setTimeout(() => {
      const negotiationResult = calculateNegotiatedPrice(product, quantity, offeredPrice);
      
      let responseText = '';
      if (negotiationResult.accepted) {
        responseText = `${negotiationResult.message} I've added ${quantity} ${quantity > 1 ? 'units' : 'unit'} to your cart at the negotiated price of $${(negotiationResult.finalPrice / quantity).toFixed(2)} per unit.`;
        
        // Add to cart with negotiated price
        addToCart(product, quantity);
      } else {
        responseText = negotiationResult.message;
      }
      
      const botMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
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
