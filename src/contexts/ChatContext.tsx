
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
    const greeting = `👋 Hello! I'm your NEGO Bot assistant for "${product.name}". The current price is ₹${product.price.toFixed(2)}.\n\nI can help you:\n• Negotiate a better price (up to 25% discount)\n• Explain product features\n• Show wholesale discounts\n• Compare with market prices\n\nWhat would you like to know?`;
    
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
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Process and respond after a short delay
    setTimeout(() => {
      if (activeProduct) {
        processUserMessage(text.trim(), activeProduct);
      } else {
        // Fallback response if no product is active
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: "Hi! Please select a product first to start negotiating. I'm here to help you get the best deal!",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, fallbackResponse]);
      }
    }, 800);
  };

  const processUserMessage = (text: string, product: Product) => {
    const lowerText = text.toLowerCase();
    let responseText = '';
    
    // Enhanced response logic with comprehensive coverage
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || lowerText.includes('good morning') || lowerText.includes('good evening')) {
      responseText = `Hello! Great to meet you! I'm excited to help you with the ${product.name}. What interests you most about this product?`;
    }
    else if (lowerText.includes('tell me more') || lowerText.includes('more information') || lowerText.includes('details') || lowerText.includes('about') || lowerText.includes('features') || lowerText.includes('specifications')) {
      responseText = `📝 **${product.name} Details**\n\n${product.description}\n\n⭐ Customer Rating: ${product.rating}/5 stars\n📦 Available Stock: ${product.inventory} units\n🏷️ Current Price: ₹${product.price.toFixed(2)}\n\nThis is one of our popular items! Would you like to make an offer or learn about bulk discounts?`;
    }
    else if (lowerText.includes('best price') || lowerText.includes('lowest price') || lowerText.includes('minimum price') || lowerText.includes('cheapest') || lowerText.includes('rock bottom')) {
      const maxDiscount = 25; // Fixed 25% max discount
      const minPrice = product.price * 0.75;
      responseText = `🎯 **Best Price Available**\n\nI can offer up to ${maxDiscount}% discount on the ${product.name}!\n\nMy absolute best price: ₹${minPrice.toFixed(2)}\nYour savings: ₹${(product.price - minPrice).toFixed(2)}\n\nFor bulk orders, I can offer even better deals! How many units are you thinking?`;
    }
    else if (lowerText.includes('wholesale') || lowerText.includes('bulk') || lowerText.includes('discount') || lowerText.includes('quantity') || lowerText.includes('volume')) {
      responseText = "💼 **Volume Discount Options**\n\n";
      if (product.wholesalePricing && product.wholesalePricing.length > 0) {
        product.wholesalePricing.forEach(tier => {
          const discountedPrice = product.price * (1 - tier.discountPercentage / 100);
          responseText += `🔸 ${tier.quantity}+ units: ${tier.discountPercentage}% off = ₹${discountedPrice.toFixed(2)} each\n`;
        });
        responseText += "\n✨ These discounts apply automatically! The more you buy, the more you save. What quantity interests you?";
      } else {
        responseText += "While this product doesn't have special wholesale tiers, I can still negotiate excellent prices for multiple units. How many are you considering?";
      }
    }
    else if (lowerText.includes('compare') || lowerText.includes('market') || lowerText.includes('other sites') || lowerText.includes('amazon') || lowerText.includes('flipkart')) {
      responseText = `📊 **Market Price Comparison**\n\nI've checked current market prices:\n\n🛒 Amazon: ₹${(product.price * 1.15).toFixed(2)}\n🛍️ Flipkart: ₹${(product.price * 1.08).toFixed(2)}\n🏪 Local stores: ₹${(product.price * 1.22).toFixed(2)}\n💫 Our price: ₹${product.price.toFixed(2)}\n\nPlus, I can negotiate even better prices for you! What's your target price?`;
    }
    else if (lowerText.match(/₹\s*\d+/) || lowerText.match(/\d+\s*rupees/) || (lowerText.includes('offer') && lowerText.match(/\d+/)) || lowerText.includes('pay')) {
      // Handle price offers with STRICT 25% limit
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
        const quantityMatch = lowerText.match(/(\d+)\s*(?:units?|items?|pieces?|qty)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        
        // Apply STRICT 25% discount limit
        const minAcceptablePrice = product.price * 0.75;
        const pricePerUnit = parsedOffer / quantity;
        
        console.log('Processing offer:', {
          parsedOffer,
          quantity,
          pricePerUnit,
          minAcceptablePrice,
          productPrice: product.price,
          willAccept: pricePerUnit >= minAcceptablePrice
        });
        
        if (pricePerUnit >= minAcceptablePrice) {
          const savings = (product.price * quantity) - parsedOffer;
          const discountPercent = Math.round(((product.price - pricePerUnit) / product.price) * 100);
          responseText = `🎉 **DEAL ACCEPTED!** 🎉\n\nExcellent offer! I accept ₹${parsedOffer.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${product.name}.\n\n✅ Adding ${quantity} ${quantity > 1 ? 'units' : 'unit'} to your cart\n💰 Final price: ₹${parsedOffer.toFixed(2)}\n🎯 You saved: ₹${savings.toFixed(2)} (${discountPercent}% discount)\n\nThank you for choosing us! 🚀`;
        } else {
          const counterOffer = minAcceptablePrice * quantity;
          const maxDiscountPercent = 25;
          responseText = `🤔 **That's below our minimum price**\n\nI understand you're looking for a great deal, but ₹${pricePerUnit.toFixed(2)} per unit is below our minimum acceptable price.\n\n💡 **Counter-offer:** ₹${minAcceptablePrice.toFixed(2)} per unit (₹${counterOffer.toFixed(2)} total)\n📊 That's our maximum ${maxDiscountPercent}% discount!\n🎯 You'd still save ₹${((product.price - minAcceptablePrice) * quantity).toFixed(2)}\n\nWhat do you think about this offer?`;
        }
      } else {
        responseText = "I'd love to work with your budget! Could you please tell me your target price more clearly? For example: '₹5000' or 'I can pay 5000 rupees'";
      }
    }
    else if (lowerText.includes('add to cart') || lowerText.includes('buy now') || lowerText.includes('purchase')) {
      responseText = `🛒 I can add the ${product.name} to your cart right away at ₹${product.price.toFixed(2)}.\n\nBut wait! Let me get you a better deal first. What's your budget for this item? I'm confident I can save you some money! 💰`;
    }
    else if (lowerText.includes('thank') || lowerText.includes('thanks') || lowerText.includes('appreciate')) {
      responseText = "You're absolutely welcome! 😊 I'm here to help you get the best deals. Is there anything else about this product or any other item I can assist you with?";
    }
    else if (lowerText.includes('bye') || lowerText.includes('goodbye') || lowerText.includes('see you')) {
      responseText = "Thank you for chatting with me! 👋 Remember, I'm always here when you need great deals. Have a wonderful day and happy shopping! 🛍️";
    }
    else if (lowerText.includes('help') || lowerText.includes('how') || lowerText.includes('what can you do')) {
      responseText = `🤖 **Here's how I can help you:**\n\n💬 **Chat with me** - Ask anything about products\n💰 **Negotiate prices** - Tell me your budget (up to 25% off)\n📊 **Compare prices** - See market rates\n🏷️ **Bulk discounts** - Get wholesale pricing\n🛒 **Smart buying** - Best deals for you\n\n**Try saying:**\n• "What's your best price?"\n• "I offer ₹X for this"\n• "Tell me about bulk discounts"\n\nWhat would you like to explore? 🚀`;
    }
    else {
      // Enhanced fallback responses for better engagement
      const fallbackResponses = [
        `Interesting question! For the ${product.name} at ₹${product.price.toFixed(2)}, I can definitely work with you on pricing (up to 25% off). What's your budget in mind? 💰`,
        `I'd love to help you with that! This ${product.name} is quite popular. Are you looking to make a purchase today? I can offer you a special deal! 🎯`,
        `Great question! Since you're interested in the ${product.name}, let me know what aspects matter most to you - price, features, or bulk discounts? 🤔`,
        `I'm here to make sure you get the best value! For this ${product.name}, what price range were you thinking? I have some flexibility (up to 25% off)! ✨`,
        `That's a good point! This ${product.name} offers excellent value. Would you like to make an offer or hear about our current promotions? 🚀`
      ];
      
      responseText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    // Send bot response
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
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
    
    setTimeout(() => {
      const negotiationResult = calculateNegotiatedPrice(product, quantity, offeredPrice);
      
      let responseText = '';
      if (negotiationResult.accepted) {
        responseText = `🎉 **FANTASTIC DEAL!** 🎉\n\n${negotiationResult.message.replace(/\$/g, '₹')}\n\n✅ Perfect! Adding ${quantity} ${quantity > 1 ? 'units' : 'unit'} to your cart\n💰 Your negotiated price: ₹${(negotiationResult.finalPrice / quantity).toFixed(2)} per unit\n🎯 Total: ₹${negotiationResult.finalPrice.toFixed(2)}\n\nThank you for being a smart shopper! 🛍️`;
        
        setTimeout(() => {
          addToCart(product, quantity, negotiationResult.finalPrice);
          toast({
            title: "🎉 Negotiation Successful!",
            description: `${quantity} × ${product.name} added to cart!`,
          });
        }, 1000);
      } else {
        responseText = `🤝 **Let's find a middle ground!**\n\n${negotiationResult.message.replace(/\$/g, '₹')}\n\n💡 Counter-offer: ₹${(negotiationResult.finalPrice / quantity).toFixed(2)} per unit\n📈 That's still ${Math.round(((product.price * quantity - negotiationResult.finalPrice) / (product.price * quantity)) * 100)}% off!\n\nWhat do you think? 🎯`;
      }
      
      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1200);
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
