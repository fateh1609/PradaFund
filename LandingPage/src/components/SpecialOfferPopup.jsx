import React, { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const CountdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return <div className="text-3xl lg:text-4xl font-bold text-gold">Offer has ended!</div>;
  } else {
    const timeParts = [
      { label: 'Days', value: days },
      { label: 'Hours', value: hours },
      { label: 'Minutes', value: minutes },
      { label: 'Seconds', value: seconds },
    ];

    return (
      <div className="flex justify-center gap-4 lg:gap-8">
        {timeParts.map((part, index) => (
          <div key={index} className="text-center">
            <div className="text-4xl lg:text-6xl font-bold gradient-text">
              {String(part.value).padStart(2, '0')}
            </div>
            <div className="text-sm lg:text-base text-gray-400 uppercase tracking-wider">{part.label}</div>
          </div>
        ))}
      </div>
    );
  }
};

const SpecialOfferPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const offerEndDate = new Date('2025-08-09T00:00:00');

  useEffect(() => {
    const now = new Date();
    if (now > offerEndDate) {
      return; 
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };
  
  if (new Date() > offerEndDate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="bg-black/80 backdrop-blur-lg border-2 border-gold glow-gold text-white rounded-2xl max-w-2xl p-0 overflow-hidden">
             <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative p-8 lg:p-12 text-center"
              >
              <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                <X className="w-6 h-6" />
              </button>

              <div className="flex justify-center mb-4">
                <div className="bg-gold/10 p-3 rounded-full">
                  <Zap className="w-8 h-8 text-gold" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                Limited Time <span className="gradient-text">2x Return</span> Offer!
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                For one week only, any token purchase over 1,000 USDT/USDC will be eligible for a <span className="font-bold text-white">2x return in just 3 months!</span> Don't miss this exclusive opportunity.
              </p>
              <div className="mb-8">
                <Countdown date={offerEndDate} renderer={CountdownRenderer} onComplete={handleClose} />
              </div>
              <Button onClick={handleClose} variant="outline" className="bg-transparent text-gold border-gold hover:bg-gold hover:text-black">
                Close
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Offer valid for purchases made between August 2nd and August 9th, 2025.
              </p>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default SpecialOfferPopup;