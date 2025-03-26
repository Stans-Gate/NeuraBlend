import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-white">Learn Smarter</h3>
            <p className="text-gray-400 text-sm mt-1">AI-powered learning assistant</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Learn Smarter. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;