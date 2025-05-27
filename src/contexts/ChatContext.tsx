
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
    }, 800);
  };

  const processUserMessage = (text: string, product: Product) => {
    const lowerText = text.toLowerCase();
    let responseText = '';
    
    // Greeting responses
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      responseText = `Hello there! 😊 Great to see you're interested in the ${product.name}. How can I assist you today?`;
    }
    // Product information requests
    else if (lowerText.includes('tell me more') || lowerText.includes('details') || lowerText.includes('about')) {
      responseText = `📝 Here's everything about the ${product.name}:

${product.description}

🔍 **Key Details:**
⭐ Customer Rating: ${product.rating}/5 stars
📦 Available Stock: ${product.inventory} units
💰 List Price: ₹${product.price.toFixed(2)}
🏷️ Category: ${product.category}

This product has been quite popular! What's your target budget?`;
    }
    // Price inquiries
    else if (lowerText.includes('best price') || lowerText.includes('lowest price') || lowerText.includes('discount')) {
      responseText = `🎯 I love a good negotiation! For the ${product.name}, I have some flexibility to work with you.

💭 **Here's what I'm thinking:**
• The listed price is ₹${product.price.toFixed(2)}
• I can negotiate within a reasonable range
• The final price depends on quantity and your offer

🎪 **Pro tip:** Bulk orders often get better rates! How many units are you considering?

What price range did you have in mind?`;
    }
    // Wholesale/bulk inquiries
    else if (lowerText.includes('wholesale') || lowerText.includes('bulk') || lowerText.includes('quantity')) {
      responseText = `💼 **Bulk Pricing - Smart Choice!**

While this product doesn't have official bulk pricing tiers, I can definitely work with you on better rates for larger quantities!

🎯 **My approach:**
• 2-5 units: Small discount possible
• 6-10 units: Better negotiation room  
• 10+ units: Significant savings potential

How many units were you thinking?`;
    }
    // Full price acceptance
    else if (lowerText.includes('listed price') || lowerText.includes('take it at') || lowerText.includes('full price')) {
      responseText = `🎉 Fantastic! The ${product.name} at ₹${product.price.toFixed(2)} is definitely a solid choice.

But wait! 🤔 Before we finalize this... As your negotiation assistant, I feel I'd be doing you a disservice if I didn't at least try to save you some money!

Would you be open to a slightly lower price if I could arrange it? 😊`;
    }
    // Price offers
    else if (lowerText.match(/₹\s*\d+/) || lowerText.match(/offer.*\d+/)) {
      const priceMatch = lowerText.match(/₹\s*(\d+(?:\.\d+)?)/);
      const offerMatch = lowerText.match(/(\d+(?:\.\d+)?)/);
      
      let parsedOffer = 0;
      if (priceMatch) {
        parsedOffer = parseFloat(priceMatch[1]);
      } else if (offerMatch) {
        parsedOffer = parseFloat(offerMatch[1]);
      }
      
      if (parsedOffer > 0) {
        const quantityMatch = lowerText.match(/(\d+)\s*(?:units?|items?)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        
        const minAcceptablePrice = product.price * 0.75; // 25% discount max
        const pricePerUnit = parsedOffer / quantity;
        
        if (pricePerUnit >= minAcceptablePrice) {
          const savings = (product.price * quantity) - parsedOffer;
          const discountPercent = Math.round(((product.price - pricePerUnit) / product.price) * 100);
          
          responseText = `🎉 **Excellent offer!** That's a deal I can definitely work with!

📋 **Deal Summary:**
• Product: ${product.name}
• Quantity: ${quantity} ${quantity > 1 ? 'units' : 'unit'}
• Your Price: ₹${parsedOffer.toFixed(2)}
• List Price: ₹${(product.price * quantity).toFixed(2)}

💰 **Your Savings: ₹${savings.toFixed(2)} (${discountPercent}% off!)**

🎁 This is a fantastic deal! I'll process this for you right away and add it to your cart at this negotiated price.

Ready to proceed? 🛒`;
        } else {
          const counterOffer = minAcceptablePrice * quantity;
          const maxDiscount = 25;
          
          responseText = `🤔 I appreciate your offer, but that's pushing my limits a bit too far.

💡 **Here's what I can do:**
• Counter-offer: ₹${minAcceptablePrice.toFixed(2)} per unit
• Total for ${quantity} ${quantity > 1 ? 'units' : 'unit'}: ₹${counterOffer.toFixed(2)}
• That's still a solid **${maxDiscount}% discount!**

🤝 This represents the best I can do while ensuring quality and service. It's still a significant saving from the list price.

What do you think about this counter-offer?`;
        }
      }
    }
    // Purchase intent
    else if (lowerText.includes('add to cart') || lowerText.includes('buy') || lowerText.includes('purchase')) {
      responseText = `🛒 I'd be happy to help you add the ${product.name} to your cart!

💰 **Current pricing:**
• List price: ₹${product.price.toFixed(2)}

But hold on! 🛑 As your personal negotiation assistant, I'd be remiss if I didn't try to save you some money first!

What's your ideal budget for this item? Even saving a few hundred rupees is money back in your pocket! 💪`;
    }
    // Thank you responses
    else if (lowerText.includes('thank') || lowerText.includes('thanks')) {
      responseText = `You're very welcome! 😊 I'm here to ensure you get the best possible deal! Is there anything else about this product I can help you with?`;
    }
    // General fallback
    else {
      responseText = `That's a great point! For the ${product.name} at ₹${product.price.toFixed(2)}, I'm confident we can find a price that works for both of us.

🤔 Let me ask you this: What's the most important factor for you in this purchase?
• Getting the lowest possible price?
• Ensuring the best value for money?  
• Quick delivery and service?

Once I understand your priorities, I can tailor my approach! 🎯`;
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
