import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("No user found. Please login.");
      setLoading(false);
      return;
    }

    fetch(`http://127.0.0.1:8000/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.detail) {
          setMessage(`Error: ${data.detail}`);
        } else {
          setUserData(data);
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
              <span className="text-gray-600">Total Points</span>
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
                ? `Earn ${100 - userData.total_points} more points to reach the next level!` 
                : "Great job on your progress!"}
            </p>
          </div>
        </div>
      </div>

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
        
        <div className="card p-6 bg-gradient-to-br from-gray-700 to-gray-900 text-white">
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-300 mb-4">Have questions about using Learn Smarter?</p>
          <button className="btn text-sm px-3 py-1 bg-white text-gray-800 hover:bg-gray-100">
            View Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;