
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Product, useProducts } from '@/contexts/ProductContext';
import { useCustomerTracking } from '@/contexts/CustomerTrackingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Send, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import NegoLogo from './NegoLogo';

interface ChatInterfaceProps {
  product: Product;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ product }) => {
  const { messages, setActiveProduct, sendMessage } = useChat();
  const { addToCart } = useProducts();
  const { trackActivity } = useCustomerTracking();
  const [inputMessage, setInputMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState(Math.round(product.price * 0.9));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom function with debouncing
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    setActiveProduct(product);
    trackActivity({
      type: 'product_view',
      productId: product.id,
      productName: product.name,
      details: `Viewed product: ${product.name}`
    });
    
    return () => {
      setActiveProduct(null);
    };
  }, [product.id]); // Only depend on product.id to prevent re-renders
  
  // Scroll to bottom when messages change, but with a small delay to prevent vibration
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length, scrollToBottom]);
  
  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      trackActivity({
        type: 'negotiation_start',
        productId: product.id,
        productName: product.name,
        details: `Customer message: ${inputMessage.trim()}`
      });
      
      sendMessage(inputMessage);
      setInputMessage('');
    }
  }, [inputMessage, product.id, product.name, trackActivity, sendMessage]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  const handleMakeOffer = useCallback(() => {
    const minAcceptablePrice = product.price * 0.75; // 25% discount max
    const totalOfferPrice = offerPrice * quantity;
    
    trackActivity({
      type: 'price_offer',
      productId: product.id,
      productName: product.name,
      offerAmount: offerPrice,
      details: `Offered ₹${offerPrice.toFixed(2)} for ${quantity} units`
    });
    
    const message = `I'd like to offer ₹${offerPrice.toFixed(2)} per unit for ${quantity} ${quantity > 1 ? 'units' : 'unit'}. Total: ₹${totalOfferPrice.toFixed(2)}`;
    sendMessage(message);
    
    // Check if offer is acceptable
    if (offerPrice >= minAcceptablePrice) {
      const originalTotal = product.price * quantity;
      const savings = originalTotal - totalOfferPrice;
      
      // Add to cart and show success toast
      setTimeout(() => {
        addToCart(product, quantity, offerPrice);
        
        trackActivity({
          type: 'deal_success',
          productId: product.id,
          productName: product.name,
          offerAmount: offerPrice,
          finalPrice: offerPrice,
          details: `Deal successful: ₹${offerPrice.toFixed(2)} for ${quantity} units`
        });

        toast({
          title: "🎉 Deal Successful!",
          description: `Added ${quantity} × ${product.name} to cart. You saved ₹${savings.toFixed(2)}!`,
        });
      }, 2000);
    }
  }, [product, quantity, offerPrice, trackActivity, sendMessage, addToCart]);
  
  // Price slider range: 0 to actual product price
  const minPrice = 0;
  const maxPrice = Math.ceil(product.price);
  
  const quickMessages = [
    "Tell me more about this product",
    "What's your best price?", 
    "Do you offer wholesale discounts?",
    "I'll take it at the listed price"
  ];

  const sendQuickMessage = useCallback((message: string) => {
    trackActivity({
      type: 'negotiation_start',
      productId: product.id,
      productName: product.name,
      details: `Quick message: ${message}`
    });
    
    sendMessage(message);
  }, [product.id, product.name, trackActivity, sendMessage]);

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <NegoLogo size="sm" />
          <div>
            <h3 className="font-semibold text-sm">NEGO Assistant</h3>
            <p className="text-xs text-gray-500">AI-powered price negotiation</p>
          </div>
        </div>
      </div>
      
      {/* Messages Area with stable scrolling */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
        style={{ minHeight: '200px', maxHeight: '300px' }}
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex mb-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div className="mr-2 flex-shrink-0 self-start">
                <NegoLogo size="sm" />
              </div>
            )}
            
            <div 
              className={`max-w-[75%] p-3 rounded-lg text-sm leading-relaxed ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Actions */}
      <div className="flex-shrink-0 p-2 border-t bg-gray-50">
        <div className="grid grid-cols-2 gap-1">
          {quickMessages.map((msg, idx) => (
            <Button 
              key={idx} 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 px-2 hover:bg-blue-50"
              onClick={() => sendQuickMessage(msg)}
            >
              {msg}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Negotiation Controls */}
      <div className="flex-shrink-0 border-t p-3 space-y-3 bg-white">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium mb-1 block">Quantity</Label>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="h-7 w-7 p-0 text-xs"
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setQuantity(quantity + 1)}
                className="h-7 w-7 p-0 text-xs"
              >
                +
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-xs font-medium mb-1 block">Your Offer (₹)</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[offerPrice]}
                min={minPrice}
                max={maxPrice}
                step={100}
                onValueChange={(values) => setOfferPrice(values[0])}
                className="flex-1"
              />
              <span className="min-w-[60px] text-right text-xs font-medium">
                ₹{offerPrice.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
        
        <Button
          className="w-full h-8 text-sm bg-blue-600 hover:bg-blue-700"
          onClick={handleMakeOffer}
          variant="default"
        >
          <DollarSign className="mr-1 h-3 w-3" />
          Make Offer - ₹{(offerPrice * quantity).toFixed(2)}
        </Button>
        
        <div className="flex items-center space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 h-8 text-sm"
          />
          <Button size="sm" onClick={handleSendMessage} className="h-8 w-8 p-0">
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
