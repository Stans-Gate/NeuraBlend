// frontend/src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userBadges, setUserBadges] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("No user found. Please login.");
      setLoading(false);
      return;
    }

    // Fetch user data
    fetch(`http://127.0.0.1:8000/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.detail) {
          setMessage(`Error: ${data.detail}`);
        } else {
          setUserData(data);
          
          // Fetch user badges
          fetch(`http://127.0.0.1:8000/users/${userId}/badges`)
            .then((badgeRes) => badgeRes.json())
            .then((badgeData) => {
              if (Array.isArray(badgeData)) {
                setUserBadges(badgeData);
              }
            })
            .catch((err) => {
              console.error("Error fetching badges:", err);
            });
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage("Failed to fetch user data.");
        setLoading(false);
      });
  }, []);

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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">{message}</p>
        </div>
        <Link to="/" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h2>
        <p className="text-gray-600">Welcome back, {userData.name}. Track your learning progress here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{userData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">{userData.id}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Stats</h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total XP</span>
              <span className="font-bold text-primary-600">{userData.total_points}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, (userData.total_points / 100) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {userData.total_points < 100 
                ? `Earn ${100 - userData.total_points} more XP to reach the next level!` 
                : "Great job on your progress!"}
            </p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Kudos</span>
              <span className="font-bold text-secondary-600">{userData.kudos}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-secondary-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, (userData.kudos / 20) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {userData.kudos > 0 
                ? `You have ${userData.kudos} Kudos to spend in the Shop!` 
                : "Earn Kudos by answering questions correctly on your first try!"}
            </p>
          </div>
        </div>
      </div>

      {/* User Badges Section */}
      {userBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userBadges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className="w-16 h-16 mb-2">
                  <img 
                    src={badge.image_path} 
                    alt={badge.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm font-medium text-center">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/study-plans" 
          className="card p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">View Study Plans</h3>
          <p className="text-primary-100">Check your existing study plans and track progress.</p>
        </Link>
        
        <Link 
          to="/create-plan" 
          className="card p-6 bg-gradient-to-br from-secondary-500 to-secondary-700 text-white hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Create New Plan</h3>
          <p className="text-secondary-100">Generate a new AI-powered study plan.</p>
        </Link>
        
        <Link 
          to="/shop" 
          className="card p-6 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Visit Shop</h3>
          <p className="text-yellow-100">Spend your Kudos on learning badges!</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;