
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, useProducts } from './ProductContext';
import { toast } from '@/components/ui/use-toast';

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

  // Enhanced initial greeting when a product is selected
  const sendBotGreeting = (product: Product) => {
    const greeting = `👋 Hello! I'm your NEGO assistant for "${product.name}". The current price is ₹${product.price.toFixed(2)}.\n\nI can:\n• Help you negotiate a fair price\n• Tell you more about this product\n• Explain our wholesale discount options\n\nWhat would you like to do today?`;
    
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
    
    // Enhanced NLP with more interactive responses
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      responseText = `Hello there! How can I help you with the ${product.name} today?`;
    }
    else if (lowerText.includes('tell me more') || lowerText.includes('more information') || lowerText.includes('details') || lowerText.includes('about')) {
      responseText = `📝 **About ${product.name}**\n\n${product.description}\n\n⭐ Rating: ${product.rating}/5\n🏬 In stock: ${product.inventory} units\n\nWould you like to know about our pricing options or make an offer?`;
    } 
    else if (lowerText.includes('wholesale') || lowerText.includes('bulk') || lowerText.includes('discount') || lowerText.includes('quantity')) {
      responseText = "🏷️ **Volume Discount Options**\n\n";
      if (product.wholesalePricing && product.wholesalePricing.length > 0) {
        product.wholesalePricing.forEach(tier => {
          const discountedPrice = product.price * (1 - tier.discountPercentage / 100);
          responseText += `• Buy ${tier.quantity}+ units: ${tier.discountPercentage}% off (₹${discountedPrice.toFixed(2)} per unit)\n`;
        });
        responseText += "\nThese discounts are applied automatically when you negotiate with the appropriate quantity. Would you like to make an offer?";
      } else {
        responseText += "Sorry, this product doesn't have special wholesale pricing, but I can still negotiate the price for individual units.";
      }
    }
    else if (lowerText.includes('lowest price') || lowerText.includes('best price') || lowerText.includes('minimum price')) {
      const minPriceDiscount = Math.round(((product.price - product.minPrice) / product.price) * 100);
      responseText = `I can offer up to ${minPriceDiscount}% discount on the ${product.name}, bringing the price down to ₹${product.minPrice.toFixed(2)}. This is for individual units. Wholesale discounts may apply for bulk orders.`;
    }
    else if (lowerText.includes('thank you') || lowerText.includes('thanks')) {
      responseText = "You're welcome! I'm happy to help. Is there anything else I can do for you?";
    }
    else if (lowerText.includes('bye') || lowerText.includes('goodbye')) {
      responseText = "Thank you for chatting! Feel free to come back if you have more questions or want to continue negotiating.";
    }
    else if (lowerText.match(/₹\d+/) || lowerText.match(/\d+ rupees/) || (lowerText.includes('offer') && lowerText.match(/\d+/))) {
      // Extract price from message
      const priceMatch = lowerText.match(/₹(\d+(\.\d+)?)/);
      const numberMatch = lowerText.match(/(\d+) rupees/);
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
          responseText = `🎉 **Deal!** ${negotiationResult.message.replace(/\$/g, '₹')}\n\nI've added ${quantity} ${quantity > 1 ? 'units' : 'unit'} to your cart at ₹${(parsedOffer / quantity).toFixed(2)} per unit.`;
          
          // Add to cart with negotiated price
          addToCart(product, quantity, parsedOffer);
          toast({
            title: "Added to cart!",
            description: `${quantity} × ${product.name} added at negotiated price.`
          });
        } else {
          responseText = `📊 ${negotiationResult.message.replace(/\$/g, '₹')}\n\nMay I suggest another offer?`;
        }
      } else {
        responseText = "I didn't catch the price you're offering. Could you please state your offer clearly, like '₹5000' or '5000 rupees'?";
      }
    } 
    else if (lowerText.includes('add to cart')) {
      responseText = `I can add the ${product.name} to your cart at the listed price of ₹${product.price.toFixed(2)}. Would you like to negotiate a better price first?`;
    }
    else if (lowerText.includes('help') || lowerText.includes('how')) {
      responseText = `Here's how negotiation works:\n\n1. Tell me how many units you want\n2. Make a price offer (e.g., "I offer ₹X per unit")\n3. I'll let you know if I can accept your offer\n4. If accepted, items will be added to your cart at that price\n\nYou can also ask about product details or wholesale pricing.`;
    }
    else {
      // Generic responses for other inputs
      const genericResponses = [
        `Would you like to make an offer for the ${product.name}? The current price is ₹${product.price.toFixed(2)}.`,
        `How many units of the ${product.name} are you interested in purchasing? I can offer better pricing for bulk orders.`,
        `I can negotiate up to 25% discount on this item, depending on quantity. What's your offer?`,
        `This ${product.name} is one of our popular items. Would you like to make a price offer?`
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
      text: `I'd like to offer ₹${offeredPrice.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${product.name}.`,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Process negotiation and respond
    setTimeout(() => {
      const negotiationResult = calculateNegotiatedPrice(product, quantity, offeredPrice);
      
      let responseText = '';
      if (negotiationResult.accepted) {
        responseText = `🎉 **Deal!** ${negotiationResult.message.replace(/\$/g, '₹')}\n\nI've added ${quantity} ${quantity > 1 ? 'units' : 'unit'} to your cart at ₹${(negotiationResult.finalPrice / quantity).toFixed(2)} per unit.`;
        
        // Add to cart with negotiated price
        addToCart(product, quantity, negotiationResult.finalPrice);
        toast({
          title: "Added to cart!",
          description: `${quantity} × ${product.name} added at negotiated price.`
        });
      } else {
        responseText = `📊 ${negotiationResult.message.replace(/\$/g, '₹')}\n\nMay I suggest another offer?`;
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
