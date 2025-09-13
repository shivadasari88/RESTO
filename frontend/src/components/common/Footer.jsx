import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-amber-800 text-amber-100 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">&copy; 2025 DELICIOUS BITES. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4 text-xs">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
          <span>•</span>
          <span>Contact Us</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;