
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Product, useProducts } from '@/contexts/ProductContext';
import { useCustomerTracking } from '@/contexts/CustomerTrackingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, DollarSign, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import NegoLogo from './NegoLogo';
import DealSuccessAnimation from './DealSuccessAnimation';

interface ChatInterfaceProps {
  product: Product;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ product }) => {
  const { messages, setActiveProduct, sendMessage } = useChat();
  const { calculateNegotiatedPrice, addToCart } = useProducts();
  const { trackActivity } = useCustomerTracking();
  const [inputMessage, setInputMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState(Math.round(product.price * 0.9));
  const [showDealAnimation, setShowDealAnimation] = useState(false);
  const [lastDealSavings, setLastDealSavings] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  }, [product, setActiveProduct, trackActivity]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);
  
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setIsTyping(true);
      
      trackActivity({
        type: 'negotiation_start',
        productId: product.id,
        productName: product.name,
        details: `Customer message: ${inputMessage.trim()}`
      });
      
      sendMessage(inputMessage);
      setInputMessage('');
      
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleMakeOffer = () => {
    const minAcceptablePrice = product.price * 0.75;
    const totalMinPrice = minAcceptablePrice * quantity;
    
    trackActivity({
      type: 'price_offer',
      productId: product.id,
      productName: product.name,
      offerAmount: offerPrice,
      details: `Offered ₹${offerPrice.toFixed(2)} for ${quantity} units`
    });
    
    setIsTyping(true);
    const message = `I'd like to offer ₹${offerPrice.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'}.`;
    sendMessage(message);
    
    if (offerPrice >= totalMinPrice) {
      const originalTotal = product.price * quantity;
      const savings = originalTotal - offerPrice;
      setLastDealSavings(savings);
      
      setTimeout(() => {
        setShowDealAnimation(true);
        setIsTyping(false);
        
        trackActivity({
          type: 'deal_success',
          productId: product.id,
          productName: product.name,
          offerAmount: offerPrice,
          finalPrice: offerPrice,
          details: `Deal successful: ₹${offerPrice.toFixed(2)} for ${quantity} units`
        });
      }, 2000);
    } else {
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };
  
  const minPrice = Math.ceil(product.price * 0.75);
  const maxPrice = Math.ceil(product.price);
  
  const quickMessages = [
    "Tell me more about this product",
    "What's your best price?", 
    "Do you offer wholesale discounts?",
    "I'll take it at the listed price"
  ];

  const sendQuickMessage = (message: string) => {
    setIsTyping(true);
    
    trackActivity({
      type: 'negotiation_start',
      productId: product.id,
      productName: product.name,
      details: `Quick message: ${message}`
    });
    
    sendMessage(message);
    
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  const handleDealAnimationComplete = () => {
    setShowDealAnimation(false);
    addToCart(product, quantity, offerPrice);

    trackActivity({
      type: 'cart_add',
      productId: product.id,
      productName: product.name,
      details: `Added to cart after successful negotiation`
    });

    toast({
      title: "🎉 Added to Cart!",
      description: `${quantity} × ${product.name} successfully added!`,
    });
  };

  return (
    <>
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
        
        {/* Messages Area */}
        <div className="flex-1 min-h-[200px] bg-white">
          <ScrollArea className="h-[200px] w-full">
            <div className="p-3 space-y-3">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="mr-2 flex-shrink-0">
                      <NegoLogo size="sm" />
                    </div>
                  )}
                  
                  <div 
                    className={`max-w-[75%] p-2 rounded-lg text-sm ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="mr-2 flex-shrink-0">
                    <NegoLogo size="sm" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        {/* Quick Actions */}
        <div className="flex-shrink-0 p-2 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-1">
            {quickMessages.map((msg, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 px-2"
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
                  step={50}
                  onValueChange={(values) => setOfferPrice(values[0])}
                  className="flex-1"
                />
                <span className="min-w-[50px] text-right text-xs font-medium">
                  ₹{offerPrice.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            className="w-full h-8 text-sm"
            onClick={handleMakeOffer}
            variant="default"
          >
            <DollarSign className="mr-1 h-3 w-3" />
            Make Offer
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

      <DealSuccessAnimation
        show={showDealAnimation}
        onComplete={handleDealAnimationComplete}
        productName={product.name}
        savings={lastDealSavings}
      />
    </>
  );
};

export default ChatInterface;
