
// src/components/Footer.tsx
import React from 'react';
import { AuraLogo } from './AuraLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-white/10 py-12">
      <div className="container mx-auto px-4 text-center">
         <AuraLogo className="h-12 w-12 mx-auto mb-4" />
        <p className="mt-2 mb-2 text-lg font-semibold tracking-wider text-slate-300">
          Architecting Reality.
        </p>
        <p className="mb-8 text-xl font-semibold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-400 text-shadow-custom">
            Our Revolt Never Stops.
        </p>
        <div className="text-xs text-muted-foreground">
            <p>&copy; {currentYear} AuraOS. A Dakshin Vaarahi Initiative. Founder: KARTHIK GUNDA</p>
            <div className="flex justify-center gap-4 mt-2">
                 <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
                 <span>|</span>
                 <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                 <span>|</span>
                 <a href="mailto:dakshinnvaarahi@gmail.com" className="hover:text-primary transition-colors">Support</a>
            </div>
        </div>
      </div>
    </footer>
  );
};