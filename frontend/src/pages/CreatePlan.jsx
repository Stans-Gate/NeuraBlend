import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CreatePlan() {
  const [grade, setGrade] = useState("5");
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [planOutput, setPlanOutput] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreatePlan() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("You need to be logged in to create a study plan");
      setMessageType("error");
      return;
    }
    if (!subject || !goal) {
      setMessage("Please provide both subject and goal");
      setMessageType("error");
      return;
    }

    try {
      setIsLoading(true);
      setMessage(
        "Generating your personalized study plan. This may take a moment..."
      );
      setMessageType("info");

      const resp = await fetch("http://127.0.0.1:8000/study_plans/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: parseInt(userId),
          grade: parseInt(grade),
          subject,
          goal,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMessage(`Error: ${data.detail || "Unknown"}`);
        setMessageType("error");
      } else {
        setPlanOutput(data.content_md);
        setMessage("Study plan created successfully!");
        setMessageType("success");
      }
    } catch (err) {
      setMessage("Failed to connect to the server");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-10 ml-10 mr-10 mb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#533933] mb-2">
          Create a Study Plan
        </h2>
        <p className="text-gray-600">
          Tell us what you want to learn, and our AI will generate a
          personalized study plan for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="card p-6 bg-[#fbe3bb]">
            <div className="space-y-6">
              <div>
                <label htmlFor="grade" className="form-label text-[#533933]">
                  Grade Level
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="form-select"
                  disabled={isLoading}
                >
                  {[...Array(12).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="form-label text-[#533933]">
                  Subject
                </label>
                <input
                  id="subject"
                  placeholder="e.g. Biology, Algebra, World History"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="goal" className="form-label text-[#533933]">
                  Learning Goal
                </label>
                <textarea
                  id="goal"
                  placeholder="e.g. Understand photosynthesis, Master quadratic equations"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="form-input min-h-24"
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about what you want to learn. The more details you
                  provide, the better your plan will be.
                </p>
              </div>

              <button
                onClick={handleCreatePlan}
                className={`w-full text-white py-3 rounded-md transition-colors duration-200 
                  ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                style={{ backgroundColor: "#533933" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Plan...
                  </span>
                ) : (
                  "Generate & Save Plan"
                )}
              </button>

              {message && (
                <div
                  className={`p-3 rounded-lg ${
                    messageType === "success"
                      ? "bg-green-100 text-green-800"
                      : messageType === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-white text-[#533933]"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-2">
              Tips for a Great Study Plan
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Be specific about what you want to learn</li>
              <li>• Include any time constraints or deadlines</li>
              <li>• Mention your preferred learning style if you have one</li>
              <li>
                • Specify if you need resources for a specific skill level
              </li>
            </ul>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-3">
          {planOutput ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Your Study Plan
                </h3>
                <Link
                  to="/study-plans"
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  View All Plans →
                </Link>
              </div>

              <div className="card p-6 prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {planOutput}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center h-full flex items-center justify-center">
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No study plan yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fill out the form and click "Generate & Save Plan" to create
                  your personalized study plan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatePlan;
