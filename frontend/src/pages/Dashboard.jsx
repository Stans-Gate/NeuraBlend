// frontend/src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DecryptedText from "../ui/DecryptedText";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userBadges, setUserBadges] = useState([]);

  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#533933]"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <div className="bg-yellow-50 border-l-4 border-[#977968] p-4 mb-6">
          <p className="text-yellow-700">{message}</p>
        </div>
        <Link to="/" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 ml-10 mr-10 mb-10 bg-white min-h-screen">
      <h1 className="text-3xl font-bold">DashBoard</h1>
      <div className="mb-8">
        <DecryptedText
          text={`${getTimeBasedGreeting()}, ${
            userData.name.charAt(0).toUpperCase() +
            userData.name.slice(1).toLowerCase()
          }. Track your learning progress here.`}
          animateOn="view"
          revealDirection="left"
          className="text-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 bg-white border-2 border-[#533933] rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[#533933] mb-4">
            <DecryptedText
              text="Profile Information"
              animateOn="view"
              revealDirection="center"
              className="text-xl font-semibold mb-4"
              color="#533933"
            />
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#533933]">Name</p>
              <p className="font-medium">
                {userData.name.charAt(0).toUpperCase() +
                  userData.name.slice(1).toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#533933]">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-[#533933]">Your Unique ID</p>
              <p className="font-medium">{userData.id}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-white border-2 border-[#533933] rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[#533933] mb-4">
            <DecryptedText
              text="Learning Stats"
              animateOn="view"
              revealDirection="center"
            />
          </h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#533933]">Total XP</span>
              <span className="font-bold text-green-400">
                {userData.total_points}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#533933] h-2.5 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (userData.total_points / 100) * 100
                  )}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {userData.total_points < 100
                ? `Earn ${
                    100 - userData.total_points
                  } more XP to reach the next level!`
                : "Great job on your progress!"}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#533933]">Kudos</span>
              <span className="font-bold text-[#533933]">{userData.kudos}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#977968] h-2.5 rounded-full"
                style={{
                  width: `${Math.min(100, (userData.kudos / 20) * 100)}%`,
                }}
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
          <h3 className="text-xl font-semibold text-[#533933] mb-4">
            <DecryptedText
              text="Your Badges"
              animateOn="view"
              revealDirection="center"
            />
          </h3>
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
          className="card p-6 bg-gradient-to-br from-[#533933] to-[#977968] text-white hover:shadow-lg hover:shadow-[#533933]/40 transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">
            <DecryptedText
              text="View Study Plans"
              animateOn="view"
              revealDirection="right"
              color="#fbe3bb"
            />
          </h3>
          <p className="text-[#fbe3bb]">
            Check your existing study plans and track progress.
          </p>
        </Link>

        <Link
          to="/create-plan"
          className="card p-6 bg-gradient-to-br from-[#977968] to-[#533933] text-white hover:shadow-lg hover:shadow-[#533933]/40 transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">
            <DecryptedText
              text="Create New Plan"
              animateOn="view"
              revealDirection="right"
              color="#fbe3bb"
            />
          </h3>
          <p className="text-[#fbe3bb]">
            Generate a new AI-powered study plan.
          </p>
        </Link>

        <Link
          to="/shop"
          className="card p-6 bg-gradient-to-br from-[#fbe3bb] to-[#977968] text-[#533933] hover:shadow-lg hover:shadow-[#533933]/40 transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">
            <DecryptedText
              text="Visit Shop"
              animateOn="view"
              revealDirection="right"
            />
          </h3>
          <p className="text-[#533933]">Spend your Kudos on learning badges!</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
