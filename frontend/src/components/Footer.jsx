import React from "react";

function Footer() {
  return (
    <footer className="bg-[#533933] text-[#fbe3bb] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl text-[#fbe3bb] font-bold">NeuraBlend</h3>
            <p className="text-sm mt-1">AI-powered learning assistant</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm">
              © {new Date().getFullYear()} NeuraBlend. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
