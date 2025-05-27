
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
  const { addToCart } = useProducts();

  const sendBotGreeting = (product: Product) => {
    const greeting = `👋 Hello! I'm your NEGO assistant for the "${product.name}". Let's find you the perfect deal!

💰 Current price: ₹${product.price.toFixed(2)}
⭐ Rating: ${product.rating}/5 stars
📦 Stock: ${product.inventory} units available

I'm here to help you get the best possible price. What would you like to know about this product?`;
    
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

  const extractPriceAndQuantity = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Extract price patterns: ₹50000, 50000, 50k, 50,000
    const pricePatterns = [
      /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/g,
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs?|inr)/g,
      /(\d+(?:\.\d+)?)\s*k/g, // 50k format
      /(?:price|offer|pay|cost)\s*(?:of|is|at)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/g,
      /(?:^|\s)(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*rupees?|\s*rs?|\s*₹|$)/g
    ];
    
    let extractedPrice = 0;
    
    for (const pattern of pricePatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        let priceStr = matches[0][1];
        
        // Handle 'k' notation (50k = 50000)
        if (pattern.toString().includes('k')) {
          extractedPrice = parseFloat(priceStr) * 1000;
        } else {
          // Remove commas and parse
          priceStr = priceStr.replace(/,/g, '');
          extractedPrice = parseFloat(priceStr);
        }
        
        if (extractedPrice > 0) break;
      }
    }
    
    // Extract quantity
    const quantityPatterns = [
      /(\d+)\s*(?:units?|pieces?|items?|pcs?)/g,
      /(?:buy|purchase|order|want|need)\s*(\d+)/g,
      /(\d+)\s*(?:of|x)/g
    ];
    
    let quantity = 1;
    for (const pattern of quantityPatterns) {
      const match = text.match(pattern);
      if (match) {
        const qty = parseInt(match[1]);
        if (qty > 0 && qty <= 100) { // reasonable quantity limit
          quantity = qty;
          break;
        }
      }
    }
    
    return { price: extractedPrice, quantity };
  };

  const processDealSuccess = (product: Product, finalPrice: number, quantity: number) => {
    const totalCost = finalPrice * quantity;
    const originalTotal = product.price * quantity;
    const savings = originalTotal - totalCost;
    const discountPercent = Math.round(((product.price - finalPrice) / product.price) * 100);

    // Add to cart
    addToCart(product, quantity, finalPrice);

    // Show success toast
    toast({
      title: "🎉 Deal Successful!",
      description: `Added ${quantity} × ${product.name} to cart at ₹${finalPrice.toFixed(2)} each. You saved ₹${savings.toFixed(2)} (${discountPercent}% off)!`,
    });

    return `🎉 **DEAL SUCCESSFUL!** 

📋 **Final Agreement:**
• Product: ${product.name}
• Quantity: ${quantity} ${quantity > 1 ? 'units' : 'unit'}
• Price per unit: ₹${finalPrice.toFixed(2)}
• Total cost: ₹${totalCost.toFixed(2)}
• Your savings: ₹${savings.toFixed(2)} (${discountPercent}% discount!)

✅ **Added to your cart!** Your negotiated deal has been secured and the items are ready for checkout.

Thank you for choosing NEGO! 🛒✨`;
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
    
    // Process bot response
    setTimeout(() => {
      if (activeProduct) {
        processUserMessage(text.trim(), activeProduct);
      }
    }, 1000);
  };

  const processUserMessage = (text: string, product: Product) => {
    const lowerText = text.toLowerCase();
    let responseText = '';
    
    // Extract price and quantity from message
    const { price: extractedPrice, quantity: extractedQuantity } = extractPriceAndQuantity(text);
    
    // Check if message contains a price offer
    if (extractedPrice > 0) {
      const minAcceptablePrice = product.price * 0.75; // 25% discount max
      const pricePerUnit = extractedPrice / extractedQuantity;
      
      if (pricePerUnit >= minAcceptablePrice) {
        // Deal successful!
        responseText = processDealSuccess(product, pricePerUnit, extractedQuantity);
      } else {
        // Counter offer
        const counterOffer = minAcceptablePrice;
        const counterTotal = counterOffer * extractedQuantity;
        
        responseText = `🤔 I appreciate your offer of ₹${pricePerUnit.toFixed(2)} per unit, but that's pushing beyond our limits.

💡 **Here's my counter-offer:**
• Price per unit: ₹${counterOffer.toFixed(2)}
• Total for ${extractedQuantity} ${extractedQuantity > 1 ? 'units' : 'unit'}: ₹${counterTotal.toFixed(2)}
• That's still a solid **25% discount** from list price!

🤝 This represents the best I can do while maintaining quality and service. It's still excellent value for money.

What do you think about this counter-offer?`;
      }
    }
    // Greeting responses
    else if (lowerText.match(/\b(hello|hi|hey|good morning|good afternoon|good evening|namaste)\b/)) {
      const greetings = [
        `Hello there! 😊 Welcome to NEGO! I'm excited to help you get the best deal on the ${product.name}.`,
        `Hi! 👋 Great to see you're interested in the ${product.name}. Let's negotiate a fantastic price!`,
        `Hey! 🌟 Ready to save some money on the ${product.name}? I'm here to make it happen!`
      ];
      responseText = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Thank you responses
    else if (lowerText.match(/\b(thank you|thanks|appreciate|grateful)\b/)) {
      const thankYouResponses = [
        `You're very welcome! 😊 I love helping customers save money. Anything else about the ${product.name}?`,
        `My pleasure! 🎉 That's what I'm here for - getting you the best deals possible!`,
        `Happy to help! 💫 Feel free to ask if you have any more questions about this product.`
      ];
      responseText = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
    }
    // Deal confirmation/acceptance
    else if (lowerText.match(/\b(deal|agreed|accept|ok|okay|fine|sure|yes|good|perfect)\b/) && lowerText.match(/\b(deal|price|offer)\b/)) {
      responseText = `🎉 Fantastic! I love when we can reach a great agreement! 

To finalize this deal, you can either:
1. Use the price slider and "Make Offer" button below
2. Tell me your exact offer (like "I'll pay ₹75000 for 1 unit")

What's your target price for the ${product.name}?`;
    }
    // Product information requests
    else if (lowerText.includes('tell me more') || lowerText.includes('details') || lowerText.includes('about') || lowerText.includes('info')) {
      responseText = `📝 Here's everything about the ${product.name}:

${product.description}

🔍 **Key Details:**
⭐ Customer Rating: ${product.rating}/5 stars
📦 Available Stock: ${product.inventory} units
💰 List Price: ₹${product.price.toFixed(2)}
🏷️ Category: ${product.category}

This product has excellent reviews and great value. What's your target budget?`;
    }
    // Price inquiries
    else if (lowerText.match(/\b(best price|lowest price|discount|cheap|affordable|budget)\b/)) {
      responseText = `🎯 I love a smart shopper! For the ${product.name}, I have flexibility to work with you.

💭 **Here's the situation:**
• Listed at ₹${product.price.toFixed(2)}
• I can negotiate up to 25% off for the right customer
• Bulk orders get even better consideration

🎪 **Quick question:** How many units are you considering? The quantity can help me offer you a better deal!

What price range were you hoping for?`;
    }
    // Wholesale/bulk inquiries
    else if (lowerText.match(/\b(wholesale|bulk|quantity|multiple|many|several)\b/)) {
      responseText = `💼 **Bulk Orders - Smart Choice!**

For larger quantities, I definitely have more negotiation flexibility!

🎯 **My approach:**
• 2-4 units: Good discount potential
• 5-10 units: Better rates possible  
• 10+ units: Maximum savings available

The ${product.name} is perfect for bulk orders. How many units were you thinking?

💡 **Pro tip:** The more you buy, the better price per unit I can offer!`;
    }
    // Purchase intent
    else if (lowerText.match(/\b(buy|purchase|order|want|need|cart)\b/)) {
      responseText = `🛒 Ready to make a purchase? Excellent choice with the ${product.name}!

Before we add it to your cart, let me try to save you some money! 💰

Current list price is ₹${product.price.toFixed(2)}, but I'm confident we can do better than that.

What's your ideal price point? Even saving ₹5,000-10,000 is money back in your pocket! 💪`;
    }
    // General negotiation
    else if (lowerText.match(/\b(negotiate|bargain|deal|offer|price)\b/)) {
      responseText = `🤝 Perfect! I love a good negotiation challenge!

For the ${product.name} at ₹${product.price.toFixed(2)}, here's how we can work together:

🎯 **Your options:**
1. Tell me your target price directly
2. Use the slider below to make an offer
3. Ask about bulk pricing if buying multiple units

💡 **Remember:** I can work within reasonable limits (up to 25% off), and the final deal depends on your offer and quantity.

What's your opening move? 😊`;
    }
    // Fallback with more personality
    else {
      const fallbacks = [
        `That's interesting! For the ${product.name}, I'm here to find you the perfect price. What's most important to you - getting the lowest price possible, or finding the best overall value?`,
        `I hear you! Let me focus on what matters most - getting you a great deal on the ${product.name}. What's your target budget for this purchase?`,
        `Absolutely! The ${product.name} is a fantastic choice. To help you get the best price, could you share what price range you had in mind?`
      ];
      responseText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
