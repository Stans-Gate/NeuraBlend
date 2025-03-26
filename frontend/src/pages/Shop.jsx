// frontend/src/pages/Shop.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Shop() {
  const [userData, setUserData] = useState(null);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("Please login to access the shop");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Fetch user data
    fetch(`http://127.0.0.1:8000/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.detail) {
          setMessage(`Error: ${data.detail}`);
          setMessageType("error");
        } else {
          setUserData(data);

          // Fetch all available badges
          
          Promise.all([
            fetch("http://127.0.0.1:8000/badges/"),
            fetch(`http://127.0.0.1:8000/users/${userId}/badges`)
          ])
            .then(([badgesRes, userBadgesRes]) => Promise.all([
              badgesRes.json(),
              userBadgesRes.json()
            ]))
            .then(([badgesData, userBadgesData]) => {
              if (Array.isArray(badgesData)) {
                setAvailableBadges(badgesData);
              }
              if (Array.isArray(userBadgesData)) {
                setUserBadges(userBadgesData);
              }
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error fetching badges:", err);
              setMessage("Failed to load badges.");
              setMessageType("error");
              setLoading(false);
            });
        }
      })
      .catch(() => {
        setMessage("Failed to fetch user data.");
        setMessageType("error");
        setLoading(false);
      });
      
  }, []);

  const handlePurchaseBadge = async (badgeId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    setPurchasing(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}/purchase_badge?badge_id=${badgeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user data with new kudos balance
        setUserData({
          ...userData,
          kudos: data.new_kudos_balance
        });
        
        // Add the purchased badge to user badges
        setUserBadges([...userBadges, data.badge]);
        
        setMessage(`Successfully purchased ${data.badge.name} badge!`);
        setMessageType("success");
      } else {
        setMessage(data.detail || "Failed to purchase badge.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error during purchase. Please try again.");
      setMessageType("error");
    } finally {
      setPurchasing(false);
    }
  };

  const isBadgeOwned = (badgeId) => {
    return userBadges.some(badge => badge.id === badgeId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Badge Shop</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">{message}</p>
        </div>
        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Badge Shop</h2>
        <p className="text-gray-600">Spend your Kudos to collect achievement badges!</p>
      </div>

      {message && (
        <div 
          className={`p-4 mb-6 rounded-lg ${
            messageType === "success" ? "bg-green-100 text-green-800" : 
            messageType === "error" ? "bg-red-100 text-red-800" : 
            "bg-blue-100 text-blue-800"
          }`}
        >
          <p>{message}</p>
        </div>
      )}

      {/* User's kudos balance */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Your Kudos</h3>
            <p className="text-gray-600 mt-1">Earned by answering quiz questions correctly on your first try!</p>
          </div>
          <div className="bg-secondary-100 text-secondary-800 px-4 py-2 rounded-full">
            <span className="font-bold text-2xl">{userData.kudos}</span>
            <span className="ml-2">Kudos</span>
          </div>
        </div>
      </div>

      {/* User's badges */}
      {userBadges.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Collection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userBadges.map((badge) => (
              <div key={badge.id} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <div className="w-20 h-20 mb-2">
                  <img 
                    src={badge.image_path} 
                    alt={badge.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="font-medium text-center">{badge.name}</h4>
                <p className="text-xs text-gray-500 text-center mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available badges to purchase */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Badges</h3>
        
        {availableBadges.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No badges available at the moment. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBadges.map((badge) => {
              const owned = isBadgeOwned(badge.id);
              const canAfford = userData.kudos >= badge.kudos_cost;
              
              return (
                <div 
                  key={badge.id} 
                  className={`border rounded-lg overflow-hidden ${
                    owned ? 'border-green-300 bg-green-50' : 
                    !canAfford ? 'border-gray-300 bg-gray-50 opacity-75' : 
                    'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center p-4">
                      <img 
                        src={badge.image_path} 
                        alt={badge.name} 
                        className="max-h-32 object-contain"
                      />
                    </div>
                    {owned && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Owned
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-1">{badge.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-yellow-600">
                        <span className="font-bold">{badge.kudos_cost}</span> Kudos
                      </span>
                      
                      {owned ? (
                        <span className="text-green-600 font-medium text-sm">Already in collection</span>
                      ) : (
                        <button
                          onClick={() => handlePurchaseBadge(badge.id)}
                          disabled={!canAfford || purchasing}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            canAfford 
                              ? 'bg-secondary-600 text-white hover:bg-secondary-700' 
                              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {purchasing ? 'Purchasing...' : canAfford ? 'Purchase' : 'Not enough Kudos'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;