import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, [location]);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-primary-600 text-2xl font-bold">Quesiton Chaser</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-gray-600 hover:text-primary-600 transition-colors ${
                location.pathname === "/" ? "text-primary-600 font-medium" : ""
              }`}
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-gray-600 hover:text-primary-600 transition-colors ${
                    location.pathname === "/dashboard" ? "text-primary-600 font-medium" : ""
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/study-plans"
                  className={`text-gray-600 hover:text-primary-600 transition-colors ${
                    location.pathname === "/study-plans" ? "text-primary-600 font-medium" : ""
                  }`}
                >
                  Study Plans
                </Link>
                <Link
                  to="/create-plan"
                  className={`text-gray-600 hover:text-primary-600 transition-colors ${
                    location.pathname === "/create-plan" ? "text-primary-600 font-medium" : ""
                  }`}
                >
                  Create Plan
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-primary-600 focus:outline-none"
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
            <Link
              to="/"
              className="block px-4 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
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
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;