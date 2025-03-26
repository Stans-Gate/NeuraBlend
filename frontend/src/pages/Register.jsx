import React, { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !email) {
      setMessage("Please enter name and email");
      setMessageType("error");
      return;
    }

    try {
      setIsLoading(true);
      const resp = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMessage(`Error: ${data.detail || "Unknown error"}`);
        setMessageType("error");
        return;
      }

      // Save user ID in localStorage
      localStorage.setItem("userId", data.id);
      setMessage(`Welcome back, ${data.name}!`);
      setMessageType("success");

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      setMessage("Connection error. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#533933]  mb-2">
          Welcome to NeuraBlend
        </h1>
        <p className="text-[#977968] ">Create an account to get started</p>
      </div>

      <div className="bg-[#fffff] rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-[#533933] font-bold mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="form-label text-[#533933]">
                Username
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fbe3bb] focus:border-[#fbe3bb]"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label text-[#533933]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fbe3bb] focus:border-[#fbe3bb]"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={`bg-[#533933] text-[#fbe3bb] hover:text-[#533933] hover:bg-[#fbe3bb]   w-full btn btn-primary ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          By logging in, you'll get personalized study plans powered by AI to
          help you learn more effectively.
        </p>
      </div>
    </div>
  );
}

export default Register;
