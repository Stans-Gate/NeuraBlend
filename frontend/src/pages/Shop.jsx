// frontend/src/pages/Shop.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Shop() {
  const [userData, setUserData] = useState(null);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [purchasedBadge, setPurchasedBadge] = useState(null);
  const [featuredBadges, setFeaturedBadges] = useState([]);
  const [showLimitedTimeOffer, setShowLimitedTimeOffer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  // Timer for limited-time offers
  useEffect(() => {
    if (showLimitedTimeOffer && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showLimitedTimeOffer, timeLeft]);

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
            fetch(`http://127.0.0.1:8000/users/${userId}/badges`),
          ])
            .then(([badgesRes, userBadgesRes]) =>
              Promise.all([badgesRes.json(), userBadgesRes.json()])
            )
            .then(([badgesData, userBadgesData]) => {
              if (Array.isArray(badgesData)) {
                // Add rarity levels to badges
                const badgesWithRarity = badgesData.map((badge) => ({
                  ...badge,
                  rarity: determineRarity(badge.kudos_cost),
                }));

                setAvailableBadges(badgesWithRarity);

                // Set random featured badges
                if (badgesWithRarity.length > 0) {
                  const featured = [...badgesWithRarity]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, Math.min(3, badgesWithRarity.length));
                  setFeaturedBadges(featured);
                  setShowLimitedTimeOffer(true);
                }
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

  // Determine badge rarity based on kudos cost
  const determineRarity = (kudosCost) => {
    if (kudosCost >= 100) return "Legendary";
    if (kudosCost >= 50) return "Epic";
    if (kudosCost >= 25) return "Rare";
    return "Common";
  };

  // Get color based on rarity
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Legendary":
        return "text-orange-500 border-orange-500";
      case "Epic":
        return "text-purple-500 border-purple-500";
      case "Rare":
        return "text-blue-500 border-blue-500";
      case "Common":
        return "text-gray-500 border-gray-500";
      default:
        return "text-gray-500 border-gray-500";
    }
  };

  // Format time for countdown
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePurchaseBadge = async (badgeId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    setPurchasing(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}/purchase_badge?badge_id=${badgeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update user data with new kudos balance
        setUserData({
          ...userData,
          kudos: data.new_kudos_balance,
        });

        // Add the purchased badge to user badges
        const purchasedBadgeWithRarity = {
          ...data.badge,
          rarity: determineRarity(data.badge.kudos_cost),
        };
        setUserBadges([...userBadges, purchasedBadgeWithRarity]);

        // Show purchase animation
        setPurchasedBadge(purchasedBadgeWithRarity);
        setShowPurchaseAnimation(true);

        // Hide animation after 3 seconds
        setTimeout(() => {
          setShowPurchaseAnimation(false);
          setPurchasedBadge(null);
        }, 3000);

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
    return userBadges.some((badge) => badge.id === badgeId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#533933] "></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-[#533933] mb-4">Badge Shop</h2>
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
    <div className="mt-10 ml-10 mr-10 mb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#533933] mb-2">Badge Shop</h2>
        <p className="text-gray-600">
          Spend your Kudos to collect achievement badges!
        </p>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            messageType === "success"
              ? "bg-green-100 text-green-800"
              : messageType === "error"
              ? "bg-red-100 text-red-800"
              : "bg-white text-[#533933] "
          }`}
        >
          <p>{message}</p>
        </div>
      )}

      {/* Purchase animation overlay */}
      {showPurchaseAnimation && purchasedBadge && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-8 max-w-md text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: 1 }}
              className="w-32 h-32 mx-auto mb-4"
            >
              <img
                src={purchasedBadge.image_path}
                alt={purchasedBadge.name}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Badge Unlocked!</h3>
            <p className="text-xl mb-1">{purchasedBadge.name}</p>
            <p
              className={`text-lg font-semibold ${getRarityColor(
                purchasedBadge.rarity
              )}`}
            >
              {purchasedBadge.rarity}
            </p>
            <p className="text-gray-600 mt-2">{purchasedBadge.description}</p>
          </motion.div>
        </div>
      )}

      {/* Limited time offer */}
      {showLimitedTimeOffer && featuredBadges.length > 0 && (
        <div className="bg-gradient-to-r from-[#533933] to-[#fbe3bb] rounded-lg shadow-md p-6 mb-8 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Limited Time Offer!</h3>
            <div className="bg-white text-purple-600 px-3 py-1 rounded-full font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredBadges.map((badge) => (
              <motion.div
                key={`featured-${badge.id}`}
                whileHover={{ scale: 1.05 }}
                className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-2">
                  <img
                    src={badge.image_path}
                    alt={badge.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="font-medium text-center text-white">
                  {badge.name}
                </h4>
                <p
                  className={`text-xs font-bold mt-1 ${getRarityColor(
                    badge.rarity
                  )}`}
                >
                  {badge.rarity}
                </p>
                <div className="mt-2 w-full">
                  <button
                    onClick={() => handlePurchaseBadge(badge.id)}
                    disabled={
                      isBadgeOwned(badge.id) ||
                      userData.kudos < badge.kudos_cost ||
                      purchasing
                    }
                    className="w-full py-1 rounded-lg text-xs font-medium bg-white text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBadgeOwned(badge.id)
                      ? "Owned"
                      : `${badge.kudos_cost} Kudos`}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* User's kudos balance */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#533933] ">
              Your Kudos
            </h3>
            <p className="text-gray-600 mt-1">
              Earned by answering quiz questions correctly on your first try!
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-secondary-100 text-secondary-800 px-4 py-2 rounded-full"
          >
            <span className="font-bold text-2xl">{userData.kudos}</span>
            <span className="ml-2">Kudos</span>
          </motion.div>
        </div>
      </div>

      {/* User's badges */}
      {userBadges.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Your Collection
            </h3>
            <div className="text-sm text-gray-600">
              <span className="font-bold">{userBadges.length}</span> /{" "}
              {availableBadges.length} Badges Collected
            </div>
          </div>

          {/* Collection progress */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                style={{
                  width: `${
                    (userBadges.length / availableBadges.length) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Beginner</span>
              <span>Collector</span>
              <span>Master</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userBadges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ y: -5 }}
                className={`bg-gray-50 rounded-lg p-4 flex flex-col items-center border-2 ${
                  badge.rarity
                    ? getRarityColor(badge.rarity)
                    : "border-gray-200"
                }`}
              >
                <div className="w-20 h-20 mb-2">
                  <img
                    src={badge.image_path}
                    alt={badge.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="font-medium text-center">{badge.name}</h4>
                {badge.rarity && (
                  <span
                    className={`text-xs font-bold ${
                      getRarityColor(badge.rarity).split(" ")[0]
                    }`}
                  >
                    {badge.rarity}
                  </span>
                )}
                <p className="text-xs text-gray-500 text-center mt-1">
                  {badge.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available badges to purchase */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-[#533933] mb-4">
          Available Badges
        </h3>

        {availableBadges.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No badges available at the moment. Check back later!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBadges.map((badge) => {
              const owned = isBadgeOwned(badge.id);
              const canAfford = userData.kudos >= badge.kudos_cost;

              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.03 }}
                  className={`border rounded-lg overflow-hidden ${
                    owned
                      ? "border-green-300 bg-green-50"
                      : !canAfford
                      ? "border-gray-300 bg-gray-50 opacity-75"
                      : "border-yellow-300 bg-yellow-50"
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
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-lg">{badge.name}</h4>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${getRarityColor(
                          badge.rarity
                        )}`}
                      >
                        {badge.rarity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {badge.description}
                    </p>

                    {/* Achievement progress */}
                    {!owned && badge.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{badge.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${badge.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-yellow-600">
                        <span className="font-bold">{badge.kudos_cost}</span>{" "}
                        Kudos
                      </span>

                      {owned ? (
                        <span className="text-green-600 font-medium text-sm">
                          Already in collection
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchaseBadge(badge.id)}
                          disabled={!canAfford || purchasing}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            canAfford
                              ? "bg-secondary-600 text-white hover:bg-secondary-700"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          {purchasing
                            ? "Purchasing..."
                            : canAfford
                            ? "Purchase"
                            : "Not enough Kudos"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;
