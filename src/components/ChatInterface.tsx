
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Product, useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Send, MessageSquare, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ChatInterfaceProps {
  product: Product;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ product }) => {
  const { messages, setActiveProduct, sendMessage } = useChat();
  const { calculateNegotiatedPrice, addToCart } = useProducts();
  const [inputMessage, setInputMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState(Math.round(product.price * 0.9)); // Start with 10% discount
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Set active product when component mounts
  useEffect(() => {
    setActiveProduct(product);
    
    // Cleanup on unmount
    return () => {
      setActiveProduct(null);
    };
  }, [product, setActiveProduct]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleMakeOffer = () => {
    // Create a message about the offer
    const message = `I'd like to offer $${offerPrice.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'}.`;
    sendMessage(message);
  };
  
  // Calculate price range
  const minPrice = product.minPrice;
  const maxPrice = product.price;
  
  // Determine if wholesale pricing applies
  let wholesaleInfo = null;
  if (product.wholesalePricing) {
    const applicableTier = [...product.wholesalePricing]
      .sort((a, b) => b.quantity - a.quantity)
      .find(tier => quantity >= tier.quantity);
      
    if (applicableTier) {
      const discountedPrice = product.price * (1 - applicableTier.discountPercentage / 100);
      wholesaleInfo = {
        discount: applicableTier.discountPercentage,
        price: discountedPrice
      };
    }
  }
  
  const quickMessages = [
    "Tell me more about this product",
    "What's your best price?",
    "Do you offer wholesale discounts?",
    "I'll take it at the listed price"
  ];

  const sendQuickMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`chat-message-container flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick message options */}
      <div className="px-4 py-2 flex flex-wrap gap-2">
        {quickMessages.map((msg, idx) => (
          <Button 
            key={idx} 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => sendQuickMessage(msg)}
          >
            {msg}
          </Button>
        ))}
      </div>
      
      {/* Negotiation controls */}
      <div className="border-t p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Quantity</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Your Offer</Label>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm">$</span>
              <Slider
                value={[offerPrice]}
                min={Math.floor(minPrice)}
                max={Math.ceil(maxPrice)}
                step={1}
                onValueChange={(values) => setOfferPrice(values[0])}
                className="flex-1"
              />
              <span className="min-w-[50px] text-right">{offerPrice.toFixed(2)}</span>
            </div>
            
            {wholesaleInfo && (
              <p className="text-xs text-green-600 mt-1">
                Volume discount: {wholesaleInfo.discount}% off
              </p>
            )}
          </div>
        </div>
        
        <Button
          className="w-full"
          onClick={handleMakeOffer}
          variant="default"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Make Offer
        </Button>
        
        <div className="flex items-center space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
