
import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ShoppingCart } from 'lucide-react';

interface DealSuccessAnimationProps {
  show: boolean;
  onComplete: () => void;
  productName: string;
  savings: number;
}

const DealSuccessAnimation: React.FC<DealSuccessAnimationProps> = ({ 
  show, 
  onComplete, 
  productName,
  savings 
}) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (show) {
      setStage(0);
      const timer1 = setTimeout(() => setStage(1), 200);
      const timer2 = setTimeout(() => setStage(2), 800);
      const timer3 = setTimeout(() => setStage(3), 1400);
      const timer4 = setTimeout(() => {
        onComplete();
        setStage(0);
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl relative overflow-hidden">
        {/* Stage 0 & 1: Success Icon */}
        <div className={`transition-all duration-500 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className="relative">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
            {stage >= 2 && (
              <div className="absolute -top-2 -right-2 animate-spin">
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
            )}
          </div>
        </div>

        {/* Stage 2: Deal Text */}
        <div className={`mt-6 transition-all duration-500 delay-300 ${stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 Deal Successful!</h2>
          <p className="text-gray-600 mb-4">
            You've successfully negotiated a great price for
          </p>
          <p className="font-semibold text-lg text-blue-600">{productName}</p>
        </div>

        {/* Stage 3: Savings & Cart */}
        <div className={`mt-6 transition-all duration-500 delay-700 ${stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-700 font-semibold">
              💰 You saved ₹{savings.toFixed(2)}!
            </p>
          </div>
          
          <div className="flex items-center justify-center text-blue-600">
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Added to cart successfully</span>
          </div>
        </div>

        {/* Confetti Effect */}
        {stage >= 2 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-75 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealSuccessAnimation;
