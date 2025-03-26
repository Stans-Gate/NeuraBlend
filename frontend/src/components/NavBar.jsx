// frontend/src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "/assets/logo.png";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, [location]);

  return (
    <nav className="bg-[#fbe3bb] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="NeuraBlend Logo" className="h-8 w-auto" />
            <span className="text-[#533933] text-2xl font-bold">
              NeuraBlend
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isLoggedIn && (
              <>
                <Link
                  to="/login"
                  className={`text-[#977968] hover:text-[#533933] transition-colors ${
                    location.pathname === "/login" ? "text-[#533933] font-medium" : ""
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`text-[#977968] hover:text-[#533933] transition-colors ${
                    location.pathname === "/register" ? "text-[#533933] font-medium" : ""
                  }`}
                >
                  Register
                </Link>
              </>
            )}
            {isLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-[#977968] hover:text-[#533933] transition-colors ${
                    location.pathname === "/dashboard" ? "text-[#533933] font-medium" : ""
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/study-plans"
                  className={`text-[#977968] hover:text-[#533933] transition-colors ${
                    location.pathname === "/study-plans" ? "text-[#533933] font-medium" : ""
                  }`}
                >
                  Study Plans
                </Link>
                <Link
                  to="/create-plan"
                  className={`text-[#977968] hover:text-[#533933] transition-colors ${
                    location.pathname === "/create-plan" ? "text-[#533933] font-medium" : ""
                  }`}
                >
                  Create Plan
                </Link>
                <Link
                  to="/shop"
                  className={`text-[#977968] hover:text-[#533933] transition-colors ${
                    location.pathname === "/shop" ? "text-[#533933] font-medium" : ""
                  }`}
                >
                  Shop
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#977968] hover:text-[#533933] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-2">
            {!isLoggedIn && (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
            {isLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/study-plans"
                  className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Study Plans
                </Link>
                <Link
                  to="/create-plan"
                  className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Create Plan
                </Link>
                <Link
                  to="/shop"
                  className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Shop
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;