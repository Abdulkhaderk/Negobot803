
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Product, useProducts } from '@/contexts/ProductContext';
import { useCustomerTracking } from '@/contexts/CustomerTrackingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Send, MessageSquare, DollarSign, Globe, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import NegoLogo from './NegoLogo';
import DealSuccessAnimation from './DealSuccessAnimation';

interface ChatInterfaceProps {
  product: Product;
}

const getComparablePrices = (productName: string, basePrice: number) => {
  return [
    { 
      site: 'Amazon', 
      price: Math.round((basePrice * (0.95 + Math.random() * 0.25)) * 100) / 100,
      url: 'https://amazon.in'
    },
    { 
      site: 'Flipkart', 
      price: Math.round((basePrice * (0.9 + Math.random() * 0.3)) * 100) / 100,
      url: 'https://flipkart.com'
    },
    { 
      site: 'Snapdeal', 
      price: Math.round((basePrice * (0.85 + Math.random() * 0.4)) * 100) / 100,
      url: 'https://snapdeal.com'
    }
  ];
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ product }) => {
  const { messages, setActiveProduct, sendMessage } = useChat();
  const { calculateNegotiatedPrice, addToCart } = useProducts();
  const { trackActivity } = useCustomerTracking();
  const [inputMessage, setInputMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState(Math.round(product.price * 0.9));
  const [comparablePrices, setComparablePrices] = useState<{ site: string; price: number; url: string }[]>([]);
  const [showComparisons, setShowComparisons] = useState(false);
  const [showDealAnimation, setShowDealAnimation] = useState(false);
  const [lastDealSavings, setLastDealSavings] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setActiveProduct(product);
    
    // Track product view
    trackActivity({
      type: 'product_view',
      productId: product.id,
      productName: product.name,
      details: `Viewed product: ${product.name}`
    });
    
    const prices = getComparablePrices(product.name, product.price);
    setComparablePrices(prices);
    
    return () => {
      setActiveProduct(null);
    };
  }, [product, setActiveProduct, trackActivity]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Track customer message
      trackActivity({
        type: 'negotiation_start',
        productId: product.id,
        productName: product.name,
        details: `Customer message: ${inputMessage.trim()}`
      });
      
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
    // Track offer
    trackActivity({
      type: 'price_offer',
      productId: product.id,
      productName: product.name,
      offerAmount: offerPrice,
      details: `Offered ₹${offerPrice.toFixed(2)} for ${quantity} units`
    });
    
    const message = `I'd like to offer ₹${offerPrice.toFixed(2)} for ${quantity} ${quantity > 1 ? 'units' : 'unit'}.`;
    sendMessage(message);
    
    // Check if deal will be accepted and prepare animation
    const negotiationResult = calculateNegotiatedPrice(product, quantity, offerPrice);
    if (negotiationResult.accepted) {
      const originalTotal = product.price * quantity;
      const savings = originalTotal - negotiationResult.finalPrice;
      setLastDealSavings(savings);
      
      // Show animation after a delay to match chat response
      setTimeout(() => {
        setShowDealAnimation(true);
        
        // Track successful deal
        trackActivity({
          type: 'deal_success',
          productId: product.id,
          productName: product.name,
          offerAmount: offerPrice,
          finalPrice: negotiationResult.finalPrice,
          details: `Deal successful: ₹${negotiationResult.finalPrice.toFixed(2)} for ${quantity} units`
        });
      }, 2000);
    }
  };
  
  const minPrice = product.minPrice;
  const maxPrice = product.price;
  
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
    "How does your price compare to other sites?"
  ];

  const sendQuickMessage = (message: string) => {
    if (message === "How does your price compare to other sites?") {
      setShowComparisons(true);
    }
    
    // Track quick message
    trackActivity({
      type: 'negotiation_start',
      productId: product.id,
      productName: product.name,
      details: `Quick message: ${message}`
    });
    
    sendMessage(message);
  };

  const handleDealAnimationComplete = () => {
    setShowDealAnimation(false);
    
    // Track cart addition
    trackActivity({
      type: 'cart_add',
      productId: product.id,
      productName: product.name,
      details: `Added to cart after successful negotiation`
    });
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="p-4 border-b bg-gray-50 flex items-center space-x-3">
          <div className="animate-scale-in">
            <NegoLogo size="sm" />
          </div>
          <div>
            <h3 className="font-medium">NEGO Assistant</h3>
            <p className="text-xs text-gray-500">AI-powered price negotiation</p>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`chat-message-container flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="mr-2 flex-shrink-0 mt-1">
                  <NegoLogo size="sm" />
                </div>
              )}
              
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
          
          {showComparisons && (
            <div className="chat-message-container flex justify-start animate-scale-in">
              <div className="mr-2 flex-shrink-0 mt-1">
                <NegoLogo size="sm" />
              </div>
              <div className="max-w-[80%] p-3 rounded-lg bg-secondary text-secondary-foreground">
                <p className="font-medium mb-2">Here's how our price compares:</p>
                <div className="space-y-2">
                  {comparablePrices.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white/50 rounded">
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {item.site}:
                      </span>
                      <span className="font-semibold">₹{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded mt-2">
                    <span className="font-medium">Our price:</span>
                    <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs">You can negotiate a better deal with me!</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick message options */}
        <div className="px-4 py-2 flex flex-wrap gap-2">
          {quickMessages.map((msg, idx) => (
            <Button 
              key={idx} 
              variant="outline" 
              size="sm" 
              className="text-xs animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => sendQuickMessage(msg)}
            >
              {msg}
            </Button>
          ))}
        </div>
        
        {/* Negotiation controls */}
        <div className="border-t p-4 space-y-4 bg-gray-50">
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
              <Label>Your Offer (₹)</Label>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm">₹</span>
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
            <Button size="icon" onClick={handleSendMessage} className="animate-pulse">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Deal Success Animation */}
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
