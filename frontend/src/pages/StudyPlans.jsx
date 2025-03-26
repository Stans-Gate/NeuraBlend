import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";


function parseSteps(markdown) {
  const lines = markdown.split("\n");
  let steps = [];
  let currentTitle = "";
  let currentContent = [];

  const stepRegex = /^\s*(\d+)\.\s+(.*)$/;

  function pushStep() {
    if (currentTitle) {
      steps.push({
        title: currentTitle.trim(),
        content: currentContent.join("\n").trim()
      });
    }
  }

  for (let line of lines) {
    const match = line.match(stepRegex);
    if (match) {
      pushStep();
      currentTitle = match[2];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  // Push the final step
  pushStep();

  return steps;
}

async function maybeFixResource(linkUrl, stepContent) {
  if (!linkUrl || linkUrl.includes("example") || linkUrl.includes("broken")) {
    // Attempt fallback
    try {
      const resp = await fetch("http://127.0.0.1:8000/fallback_material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_content: stepContent })
      });
      const data = await resp.json();
      // The fallback might be a new link or a short text resource
      if (data.resource_link) {
        return data.resource_link;
      } else if (data.text_material) {
        // If we get some text material, you might store it differently
        return data.text_material;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }
  return linkUrl;
}

/**
 * Attempt to embed the resource if it's a real link.
 * If it's a youtube link => embed <iframe>.
 * Otherwise => embed <iframe> or show text.
 */
function ResourceEmbed({ resource }) {
  if (!resource) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-gray-500">No resource available for this step.</p>
      </div>
    );
  }
  
  // If the fallback gave us text_material instead of a link, just show it:
  if (resource.startsWith("http")) {
    // youtube check
    if (resource.includes("youtube.com") || resource.includes("youtu.be")) {
      let videoId = "";
      if (resource.includes("youtu.be")) {
        videoId = resource.split("/").pop().split("?")[0];
      } else {
        const parts = resource.split("v=");
        videoId = parts[1]?.split("&")[0];
      }
      return (
        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
          <iframe
            title="YouTube Video"
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    } else {
      return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <span className="font-medium text-sm truncate">{resource}</span>
            <a 
              href={resource} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 text-sm ml-2"
            >
              Open in new tab
            </a>
          </div>
          <iframe
            title="Resource"
            src={resource}
            className="w-full h-96"
          />
        </div>
      );
    }
  } else {
    // We assume it's text
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {resource}
        </ReactMarkdown>
      </div>
    );
  }
}

/**
 * The main study plans component
 */
function StudyPlans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [steps, setSteps] = useState([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState(-1);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);

  // QUIZ states
  const [quizData, setQuizData] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);

  // Resource handling
  const [resource, setResource] = useState(null);
  const [resourceLoading, setResourceLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("No user logged in. Please login.");
      setMessageType("error");
      setLoading(false);
      return;
    }
    
    fetch(`http://127.0.0.1:8000/study_plans/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          setMessage(data.detail || "Error fetching plans");
          setMessageType("error");
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage("Failed to fetch plans");
        setMessageType("error");
        setLoading(false);
      });
  }, []);

  // 1) Select a plan from the list
  function handleSelectPlan(planId) {
    setSelectedPlan(null);
    setSteps([]);
    setSelectedStepIndex(-1);
    setQuizData(null);
    setFeedback("");
    setAttemptNumber(1);
    setResource(null);
    setLoading(true);

    const userId = localStorage.getItem("userId");
    fetch(`http://127.0.0.1:8000/study_plans/${userId}/${planId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.detail) {
          setMessage(data.detail);
          setMessageType("error");
        } else {
          setSelectedPlan(data);
          const stepArr = parseSteps(data.content_md);
          setSteps(stepArr);
          setMessage("");
        }
        setLoading(false);
      })
      .catch(() => {
        setMessage("Error fetching plan details");
        setMessageType("error");
        setLoading(false);
      });
  }

  // 2) Delete plan
  async function handleDeletePlan(planId, e) {
    e.stopPropagation(); // Prevent triggering plan selection
    
    if (!window.confirm("Are you sure you want to delete this study plan?")) {
      return;
    }
    
    try {
      const resp = await fetch(`http://127.0.0.1:8000/study_plans/${planId}`, {
        method: "DELETE"
      });
      if (!resp.ok) {
        const data = await resp.json();
        setMessage(data.detail || "Error deleting plan");
        setMessageType("error");
        return;
      }
      setPlans((old) => old.filter((p) => p.id !== planId));
      setMessage("Plan deleted successfully!");
      setMessageType("success");
      
      // Reset any selected plan if it was the one deleted
      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan(null);
        setSteps([]);
        setSelectedStepIndex(-1);
        setQuizData(null);
        setFeedback("");
        setAttemptNumber(1);
        setResource(null);
      }
    } catch (err) {
      setMessage("Failed to delete plan.");
      setMessageType("error");
    }
  }

  // 3) Select a step
  async function handleSelectStep(index) {
    setSelectedStepIndex(index);
    setQuizData(null);
    setFeedback("");
    setAttemptNumber(1);
    setResource(null);
    setResourceLoading(true);

    const stepContent = steps[index].content;

    // Try to find a markdown link in that step
    const linkRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/;
    const match = stepContent.match(linkRegex);
    let foundUrl = match ? match[2] : null;

    // Possibly fix or fallback
    try {
      const fixedUrl = await maybeFixResource(foundUrl, stepContent);
      setResource(fixedUrl);
    } catch (error) {
      console.error("Error fetching resource:", error);
    } finally {
      setResourceLoading(false);
    }
  }

  // 4) Generate quiz from step content
  async function handleGenerateQuiz() {
    setQuizData(null);
    setFeedback("");
    setAttemptNumber(1);
    setQuizLoading(true);

    if (selectedStepIndex < 0) {
      setQuizLoading(false);
      return;
    }

    const stepContent = steps[selectedStepIndex].content;
    try {
      const resp = await fetch("http://127.0.0.1:8000/generate_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_content: stepContent })
      });
      const data = await resp.json();
      setQuizData(data); // question, options[], answer_index, hint
    } catch (err) {
      setFeedback("Error generating quiz");
      setFeedbackType("error");
    } finally {
      setQuizLoading(false);
    }
  }

  // 5) Submit quiz answer
  async function handleSubmitAnswer(selectedOption) {
    if (!quizData) {
      setFeedback("No quiz data available");
      setFeedbackType("error");
      return;
    }
    
    const correctAnswerIdx = quizData.answer_index;
    const isCorrect = selectedOption === quizData.options[correctAnswerIdx];
    
    if (isCorrect) {
      // correct
      await scoreQuiz(attemptNumber, true);
      setFeedback("Great job! That's the correct answer.");
      setFeedbackType("success");
    } else {
      // wrong
      if (attemptNumber < 3) {
        setFeedback(`That's not quite right. Hint: ${quizData.hint}`);
        setFeedbackType("warning");
        setAttemptNumber((n) => n + 1);
      } else {
        // Third attempt also wrong => 4th attempt => 0 points
        await scoreQuiz(4, false);
        setFeedback(`Incorrect. The correct answer is: ${quizData.options[correctAnswerIdx]}`);
        setFeedbackType("error");
      }
    }
  }

  // 6) Score quiz in backend
  async function scoreQuiz(attemptNum, isCorrect) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    try {
      const resp = await fetch("http://127.0.0.1:8000/score_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: parseInt(userId),
          attempt_number: attemptNum,
          is_correct: isCorrect
        })
      });
      const data = await resp.json();
      
      let feedbackMessage = "";
      if (data.points_awarded !== undefined) {
        feedbackMessage += ` You earned ${data.points_awarded} XP!`;
      }
      
      if (data.kudos_awarded && data.kudos_awarded > 0) {
        feedbackMessage += ` +${data.kudos_awarded} Kudos for answering correctly on your first try!`;
      }
      
      if (feedbackMessage) {
        setFeedback((f) => f + feedbackMessage);
      }
    } catch (err) {
      console.error("Error scoring quiz:", err);
    }
  }

  if (loading && !selectedPlan) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Study Plans</h2>
        <p className="text-gray-600">Explore your personalized learning paths and track your progress.</p>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === "success" ? "bg-green-100 text-green-800" : 
          messageType === "error" ? "bg-red-100 text-red-800" : 
          "bg-blue-100 text-blue-800"
        }`}>
          {message}
        </div>
      )}

      {/* No plans yet message */}
      {plans.length === 0 && !loading && (
        <div className="text-center bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No study plans found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first study plan.</p>
          <div className="mt-6">
            <Link to="/create-plan" className="btn btn-primary">
              Create Study Plan
            </Link>
          </div>
        </div>
      )}

      {/* Plan selection and display area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plans list sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Plans</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {plans.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => handleSelectPlan(p.id)} 
                  className={`flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedPlan && selectedPlan.id === p.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{p.title}</h4>
                    <p className="text-xs text-gray-500">ID: {p.id}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeletePlan(p.id, e)}
                    className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            {plans.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <Link to="/create-plan" className="flex justify-center items-center text-primary-600 hover:text-primary-800">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create New Plan</span>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-2">
          {loading && selectedPlan && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          )}
          
          {!loading && selectedPlan && (
            <div>
              {/* Plan header */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPlan.title}</h3>
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedPlan.content_md}
                  </ReactMarkdown>
                </div>
              </div>
              
              {/* Steps navigation */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Learning Steps</h3>
                </div>
                <div className="p-4">
                  <ol className="space-y-2">
                    {steps.map((s, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 font-medium text-sm mr-3">
                          {idx + 1}
                        </span>
                        <button
                          onClick={() => handleSelectStep(idx)}
                          className={`text-left focus:outline-none ${
                            selectedStepIndex === idx 
                              ? 'text-primary-700 font-medium' 
                              : 'text-gray-700 hover:text-primary-600'
                          }`}
                        >
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              
              {/* Selected step details */}
              {selectedStepIndex >= 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Step {selectedStepIndex + 1}: {steps[selectedStepIndex].title}
                    </h3>
                  </div>
                  <div className="p-6">
                    {/* Step content */}
                    <div className="prose max-w-none mb-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {steps[selectedStepIndex].content}
                      </ReactMarkdown>
                    </div>
                    
                    {/* Resource section */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Learning Resource</h4>
                      {resourceLoading ? (
                        <div className="flex justify-center items-center h-24">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                      ) : (
                        <ResourceEmbed resource={resource} />
                      )}
                    </div>
                    
                    {/* Quiz section */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Test Your Knowledge</h4>
                      
                      {!quizData && !quizLoading && (
                        <button
                          onClick={handleGenerateQuiz}
                          className="btn btn-primary"
                        >
                          Generate Quiz
                        </button>
                      )}
                      
                      {quizLoading && (
                        <div className="flex justify-center items-center h-24">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                      )}
                      
                      {quizData && !quizLoading && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium text-gray-900 mb-4">{quizData.question}</p>
                          <div className="space-y-2">
                            {quizData.options.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleSubmitAnswer(opt)}
                                className="w-full text-left px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          
                          {feedback && (
                            <div className={`mt-4 p-3 rounded-lg ${
                              feedbackType === "success" ? "bg-green-100 text-green-800" : 
                              feedbackType === "error" ? "bg-red-100 text-red-800" : 
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!loading && !selectedPlan && plans.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Select a study plan</h3>
              <p className="mt-1 text-gray-500">Choose a plan from the list to view its content and start learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyPlans;