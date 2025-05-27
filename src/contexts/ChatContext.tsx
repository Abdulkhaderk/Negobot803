
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

  const sendBotGreeting = (product: Product) => {
    const greetings = [
      `👋 Hello! I'm your NEGO assistant for the "${product.name}". Let's find you the perfect deal!`,
      `Hi there! 🎯 I'm here to help you negotiate the best price for "${product.name}".`,
      `Welcome! 💼 Ready to get a great deal on "${product.name}"? Let's chat!`
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const followUp = `

💰 Current price: ₹${product.price.toFixed(2)}
⭐ Rating: ${product.rating}/5 stars
📦 Stock: ${product.inventory} units available

I'm here to help you get the best possible price. What would you like to know about this product?`;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text: greeting + followUp,
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
    
    // Greeting responses
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || lowerText.includes('good morning') || lowerText.includes('good evening')) {
      const greetingResponses = [
        `Hello there! 😊 Great to see you're interested in the ${product.name}. How can I assist you today?`,
        `Hi! 👋 Perfect timing - I was just thinking about how to get you the best deal on this ${product.name}!`,
        `Hey! 🎉 Welcome back! Ready to negotiate an amazing price for the ${product.name}?`
      ];
      responseText = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }
    // Product information requests
    else if (lowerText.includes('tell me more') || lowerText.includes('more information') || lowerText.includes('details') || lowerText.includes('about') || lowerText.includes('features') || lowerText.includes('specifications')) {
      responseText = `📝 Here's everything about the ${product.name}:

${product.description}

🔍 **Key Details:**
⭐ Customer Rating: ${product.rating}/5 stars
📦 Available Stock: ${product.inventory} units
💰 List Price: ₹${product.price.toFixed(2)}
🏷️ Category: ${product.category}

This product has been quite popular with our customers! Many have found great value in it. 

🎯 **Special for you:** I can work within a reasonable range to get you a better price. What's your target budget?`;
    }
    // Price inquiries
    else if (lowerText.includes('best price') || lowerText.includes('lowest price') || lowerText.includes('minimum price') || lowerText.includes('discount') || lowerText.includes('cheaper') || lowerText.includes('reduce')) {
      const discountResponses = [
        `🎯 I love a good negotiation! For the ${product.name}, I have some flexibility to work with you.`,
        `💡 Great question! I can definitely help you get a better deal on this ${product.name}.`,
        `🤝 Absolutely! I'm here to find you the best possible price for the ${product.name}.`
      ];
      
      const baseResponse = discountResponses[Math.floor(Math.random() * discountResponses.length)];
      
      responseText = `${baseResponse}

💭 **Here's what I'm thinking:**
• The listed price is ₹${product.price.toFixed(2)}
• I can negotiate within a reasonable range
• The final price depends on quantity and your offer

🎪 **Pro tip:** Bulk orders often get better rates! How many units are you considering?

What price range did you have in mind?`;
    }
    // Wholesale/bulk inquiries
    else if (lowerText.includes('wholesale') || lowerText.includes('bulk') || lowerText.includes('quantity') || lowerText.includes('multiple') || lowerText.includes('units')) {
      responseText = "💼 **Bulk Pricing - Smart Choice!**\n\n";
      if (product.wholesalePricing && product.wholesalePricing.length > 0) {
        responseText += "🎉 Great news! This product has special bulk pricing:\n\n";
        product.wholesalePricing.forEach(tier => {
          const discountedPrice = product.price * (1 - tier.discountPercentage / 100);
          responseText += `• **${tier.quantity}+ units:** ${tier.discountPercentage}% off = ₹${discountedPrice.toFixed(2)} each\n`;
        });
        responseText += "\n💡 **Even better news:** I might be able to negotiate additional savings on top of these rates!\n\nHow many units are you planning to purchase?";
      } else {
        responseText += "While this product doesn't have official bulk pricing tiers, I can definitely work with you on better rates for larger quantities!\n\n🎯 **My approach:**\n• 2-5 units: Small discount possible\n• 6-10 units: Better negotiation room\n• 10+ units: Significant savings potential\n\nHow many units were you thinking?";
      }
    }
    // Full price acceptance
    else if (lowerText.includes('listed price') || lowerText.includes('take it at') || lowerText.includes('full price') || lowerText.includes('agree') || lowerText.includes('accept')) {
      responseText = `🎉 Fantastic! The ${product.name} at ₹${product.price.toFixed(2)} is definitely a solid choice.

But wait! 🤔 Before we finalize this...

As your negotiation assistant, I feel I'd be doing you a disservice if I didn't at least try to save you some money! Even a small discount can add up.

🎯 **Quick question:** Would you be open to a slightly lower price if I could arrange it? Sometimes I can get approval for special pricing, especially for valued customers like yourself!

What do you say - shall we see what's possible? 😊`;
    }
    // Price offers
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
        
        const minAcceptablePrice = product.price * 0.75; // 25% discount max
        const pricePerUnit = parsedOffer / quantity;
        
        if (pricePerUnit >= minAcceptablePrice) {
          const savings = (product.price * quantity) - parsedOffer;
          const discountPercent = Math.round(((product.price - pricePerUnit) / product.price) * 100);
          
          const successResponses = [
            `🎉 **Excellent offer!** That's a deal I can definitely work with!`,
            `✅ **Outstanding!** Your offer is within my approval range!`,
            `🤝 **Perfect!** I'm happy to accept that offer!`
          ];
          
          const baseResponse = successResponses[Math.floor(Math.random() * successResponses.length)];
          
          responseText = `${baseResponse}

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
          const maxDiscount = Math.round(((product.price - minAcceptablePrice) / product.price) * 100);
          
          const counterResponses = [
            `🤔 I appreciate your offer, but that's pushing my limits a bit too far.`,
            `💭 I understand you're looking for a great deal, but I need to stay within reasonable bounds.`,
            `🎯 I'd love to help, but that price point is challenging for me to approve.`
          ];
          
          const baseResponse = counterResponses[Math.floor(Math.random() * counterResponses.length)];
          
          responseText = `${baseResponse}

💡 **Here's what I can do:**
• Counter-offer: ₹${minAcceptablePrice.toFixed(2)} per unit
• Total for ${quantity} ${quantity > 1 ? 'units' : 'unit'}: ₹${counterOffer.toFixed(2)}
• That's still a solid **${maxDiscount}% discount!**

🤝 This represents the best I can do while ensuring quality and service. It's still a significant saving from the list price of ₹${(product.price * quantity).toFixed(2)}.

What do you think about this counter-offer?`;
        }
      }
    }
    // Purchase intent
    else if (lowerText.includes('add to cart') || lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('order')) {
      responseText = `🛒 I'd be happy to help you add the ${product.name} to your cart!

💰 **Current pricing:**
• List price: ₹${product.price.toFixed(2)}

But hold on! 🛑 As your personal negotiation assistant, I'd be remiss if I didn't try to save you some money first!

🎯 **Quick opportunity:** Let me see what special pricing I can arrange for you. Sometimes I can get approval for exclusive discounts, especially for new customers!

What's your ideal budget for this item? Even if we can save you just a few hundred rupees, that's money back in your pocket! 💪`;
    }
    // Thank you responses
    else if (lowerText.includes('thank') || lowerText.includes('thanks') || lowerText.includes('appreciate')) {
      const thankResponses = [
        `You're very welcome! 😊 I'm here to ensure you get the best possible deal!`,
        `My pleasure! 🎉 That's what I'm here for - getting you amazing prices!`,
        `Absolutely my pleasure! 🤝 I love helping customers save money!`
      ];
      responseText = thankResponses[Math.floor(Math.random() * thankResponses.length)] + " Is there anything else about this product I can help you with?";
    }
    // Budget inquiries
    else if (lowerText.includes('budget') || lowerText.includes('afford') || lowerText.includes('spend') || lowerText.includes('range')) {
      responseText = `💰 **Budget Discussion - Let's Find Your Sweet Spot!**

I completely understand wanting to stay within budget! That's exactly why I'm here.

🎯 **For the ${product.name}:**
• List price: ₹${product.price.toFixed(2)}
• I have some flexibility to negotiate

💡 **Here's my approach:** Instead of you committing to a specific budget first, why don't I share what kind of pricing flexibility I might have?

I could potentially work within a reasonable range from the list price. Would you be interested in hearing what kind of deal I might be able to arrange?`;
    }
    // General fallback with personality
    else {
      const fallbackResponses = [
        `That's a great point! For the ${product.name} at ₹${product.price.toFixed(2)}, I'm confident we can find a price that works for both of us.`,
        `I appreciate you bringing that up! This ${product.name} has been getting excellent feedback, and I'd love to help you get it at a fantastic price.`,
        `Interesting perspective! Since you're considering the ${product.name}, let me see what kind of special arrangement I can make for you.`,
        `Good question! The ${product.name} is definitely worth discussing - I have some flexibility on pricing that might interest you.`
      ];
      
      const baseResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      responseText = `${baseResponse}

🤔 Let me ask you this: What's the most important factor for you in this purchase?
• Getting the lowest possible price?
• Ensuring the best value for money?
• Quick delivery and service?

Once I understand your priorities, I can tailor my negotiation approach to focus on what matters most to you! 🎯`;
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
