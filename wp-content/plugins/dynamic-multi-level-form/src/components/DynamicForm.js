"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formStructure } from "./formStructure"

// Declare dynamicFormData to avoid undefined variable error.
// In a real scenario, this data would be passed as props or fetched from a context.
const dynamicFormData = {
  restUrl: "", // Replace with your actual REST API endpoint
  nonce: "", // Replace with your actual nonce value
}

export default function DynamicForm() {
  // State to track current question
  const [currentQuestionId, setCurrentQuestionId] = useState(formStructure.startQuestion)

  // State to store all answers
  const [answers, setAnswers] = useState({})

  // State to track form completion
  const [isComplete, setIsComplete] = useState(false)

  // State to track question history for back navigation
  const [questionHistory, setQuestionHistory] = useState([formStructure.startQuestion])

  // State to track if we're in summary view
  const [showingSummary, setShowingSummary] = useState(false)

  // State for loading indicators
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State to track if the form is ready to submit
  const [readyToSubmit, setReadyToSubmit] = useState(false)

  // State to track if we're on the final question
  const [isOnFinalQuestion, setIsOnFinalQuestion] = useState(false)

  // State to track the next question
  const [nextQuestionId, setNextQuestionId] = useState(null)

  // State for form submission status
  const [submissionStatus, setSubmissionStatus] = useState(null)

  // Get current question
  const currentQuestion = formStructure.questions[currentQuestionId]

  // Calculate the current section
  const currentSection = useMemo(() => {
    const sectionId = currentQuestion.section || ""
    return formStructure.sections.find((section) => section.id === sectionId)
  }, [currentQuestion])

  // Calculate the next question based on the current answer
  useEffect(() => {
    if (currentQuestion.type === "radio" || currentQuestion.type === "select") {
      const answer = answers[currentQuestionId]
      if (answer) {
        const option = currentQuestion.options?.find((opt) => opt.value === answer)
        setNextQuestionId(option?.nextQuestion || null)
      } else {
        setNextQuestionId(null)
      }
    } else {
      setNextQuestionId(currentQuestion.nextQuestion || null)
    }
  }, [currentQuestionId, answers, currentQuestion])

  // Check if we've reached the final question
  useEffect(() => {
    if (currentQuestionId === formStructure.finalQuestion) {
      setIsOnFinalQuestion(true)
      setReadyToSubmit(true)
    } else {
      setIsOnFinalQuestion(false)

      // Only set readyToSubmit to false if we're not on the final question
      // and we haven't already completed the form
      if (!isComplete) {
        setReadyToSubmit(false)
      }
    }
  }, [currentQuestionId, isComplete])

  // Calculate the remaining questions count
  const remainingQuestionsCount = useMemo(() => {
    if (nextQuestionId === null) return 0

    let count = 0
    let nextId = nextQuestionId

    // Count questions until we reach the end or a null nextQuestion
    while (nextId) {
      count++
      const question = formStructure.questions[nextId]

      // If we've reached the final question, break
      if (nextId === formStructure.finalQuestion) {
        break
      }

      // Determine the next question based on the current answer
      if (question.type === "radio" || question.type === "select") {
        const answer = answers[nextId]
        if (answer) {
          const option = question.options?.find((opt) => opt.value === answer)
          nextId = option?.nextQuestion || null
        } else {
          // If no answer, assume the first option's next question
          nextId = question.options?.[0]?.nextQuestion || null
        }
      } else {
        nextId = question.nextQuestion || null
      }
    }

    return count
  }, [nextQuestionId, answers])

  // Function to handle answer selection
  const handleAnswer = (questionId, answer) => {
    // Update answers
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))

    // Find the next question based on the answer
    if (currentQuestion.type === "radio" || currentQuestion.type === "select") {
      const option = currentQuestion.options?.find((opt) => opt.value === answer)
      const nextQuestionId = option?.nextQuestion

      if (nextQuestionId) {
        // Add the next question to history
        setQuestionHistory((prev) => [...prev, nextQuestionId])
        setCurrentQuestionId(nextQuestionId)
      } else {
        setIsComplete(true)
        // Don't automatically show summary
      }
    } else {
      // For text and textarea, use the nextQuestion property
      if (currentQuestion.nextQuestion) {
        // Add the next question to history
        setQuestionHistory((prev) => [...prev, currentQuestion.nextQuestion])
        setCurrentQuestionId(currentQuestion.nextQuestion)
      } else {
        setIsComplete(true)
        // Don't automatically show summary
      }
    }
  }

  // Function to go back to the previous question
  const handleBack = () => {
    if (questionHistory.length > 1) {
      // Remove the current question from history
      const newHistory = [...questionHistory]
      newHistory.pop()

      // Set the previous question as current
      setCurrentQuestionId(newHistory[newHistory.length - 1])
      setQuestionHistory(newHistory)

      // If we're in summary view, exit it
      if (showingSummary) {
        setShowingSummary(false)
        setIsComplete(false)
      }
    }
  }

  // Function to show the summary view
  const handleShowSummary = () => {
    setShowingSummary(true)
  }

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    const missingRequiredFields = Object.entries(formStructure.questions)
      .filter(([_, question]) => question.required && !answers[question.id])
      .map(([_, question]) => question.id)

    if (missingRequiredFields.length > 0) {
      setSubmissionStatus({
        type: "error",
        message: "Please fill in all required fields before submitting.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit to WordPress REST API
      const response = await fetch(dynamicFormData.restUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": dynamicFormData.nonce,
        },
        body: JSON.stringify(answers),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmissionStatus({
          type: "success",
          message: "Form submitted successfully! We'll be in touch soon.",
        })

        // Clear form after submission
        setAnswers({})
        setCurrentQuestionId(formStructure.startQuestion)
        setQuestionHistory([formStructure.startQuestion])
        setIsComplete(false)
        setShowingSummary(false)
        setReadyToSubmit(false)
      } else {
        throw new Error(result.message || "Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmissionStatus({
        type: "error",
        message: "Failed to submit your form. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to edit a specific answer
  const handleEditAnswer = (questionId) => {
    // Find the index of the question in history
    const index = questionHistory.indexOf(questionId)

    if (index !== -1) {
      // Truncate history to that question
      const newHistory = questionHistory.slice(0, index + 1)
      setQuestionHistory(newHistory)
      setCurrentQuestionId(questionId)
      setShowingSummary(false)
      setIsComplete(false)
    }
  }

  // Function to render the appropriate question component
  const renderQuestion = (question) => {
    switch (question.type) {
      case "radio":
        return (
          <div className="form-radio-group">
            {question.options?.map((option) => (
              <div
                key={option.value}
                className={`form-radio-item ${answers[question.id] === option.value ? "form-radio-item-selected" : ""}`}
                onClick={() => handleAnswer(question.id, option.value)}
              >
                <input
                  type="radio"
                  id={option.value}
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={() => handleAnswer(question.id, option.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <label htmlFor={option.value} className="form-radio-item-label">
                    {option.label}
                  </label>
                </div>
                {answers[question.id] === option.value && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            ))}
          </div>
        )

      case "text":
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer here..."
              className="form-input text-lg p-4"
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => handleAnswer(question.id, answers[question.id] || "")}
                disabled={question.required && !answers[question.id]}
                className="form-button form-button-primary flex items-center gap-2"
              >
                Continue
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <textarea
              value={answers[question.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer here..."
              className="form-textarea min-h-[150px] text-lg p-4"
            ></textarea>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => handleAnswer(question.id, answers[question.id] || "")}
                disabled={question.required && !answers[question.id]}
                className="form-button form-button-primary flex items-center gap-2"
              >
                Continue
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )

      case "select":
        return (
          <div className="space-y-4">
            <select
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="form-select"
            >
              <option value="" disabled>
                Select an option
              </option>
              {question.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      default:
        return null
    }
  }

  // Function to render the summary view
  const renderSummary = () => {
    // Get all questions that have been answered
    const answeredQuestionIds = Object.keys(answers)

    // Group questions by their section (first part of the ID before underscore)
    const sections = {}

    answeredQuestionIds.forEach((id) => {
      const sectionName = id.split("_")[0]
      if (!sections[sectionName]) {
        sections[sectionName] = []
      }
      sections[sectionName].push(id)
    })

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6">Review Your Responses</h2>

        <div className="h-[400px] overflow-y-auto pr-4">
          <div className="space-y-8">
            {Object.entries(sections).map(([sectionName, questionIds]) => (
              <div key={sectionName} className="space-y-4">
                <h3 className="text-lg font-medium capitalize">{sectionName.replace("_", " ")}</h3>

                <div className="space-y-3">
                  {questionIds.map((questionId) => {
                    const question = formStructure.questions[questionId]
                    if (!question) return null

                    let answerDisplay = answers[questionId]

                    // Format the answer display based on question type
                    if (question.type === "radio" || question.type === "select") {
                      const option = question.options?.find((opt) => opt.value === answers[questionId])
                      answerDisplay = option?.label || answers[questionId]
                    } else if (question.type === "checkbox" && answers[questionId]) {
                      const selectedValues = answers[questionId].split(",").filter(Boolean)
                      const selectedLabels = selectedValues.map((value) => {
                        const option = question.options?.find((opt) => opt.value === value)
                        return option?.label || value
                      })
                      answerDisplay = selectedLabels.join(", ")
                    }

                    return (
                      <div key={questionId} className="border rounded-lg p-4 relative">
                        <div className="pr-8">
                          <h4 className="font-medium text-sm text-gray-500">{question.question}</h4>
                          <p className="mt-1">{answerDisplay}</p>
                        </div>
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleEditAnswer(questionId)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          <span className="sr-only">Edit</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="form-button form-button-outline flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
          <button
            type="submit"
            className="flex-1 py-6 text-lg flex items-center justify-center gap-2 form-button form-button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Submit Form
              </>
            )}
          </button>
        </div>
      </motion.div>
    )
  }

  // Render the form tracker
  const renderFormTracker = () => {
    // Find the current section
    const currentSectionId = currentQuestion.section || ""
    const sectionIndex = formStructure.sections.findIndex((section) => section.id === currentSectionId)

    return (
      <div className="mb-6">
        {/* Section progress */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Section {sectionIndex + 1} of {formStructure.sections.length}:
            </span>
            <span className="text-sm font-bold">{currentSection?.title || ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Question {questionHistory.length} of {questionHistory.length + remainingQuestionsCount}
            </span>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex mb-4 overflow-x-auto pb-2 gap-1">
          {formStructure.sections.map((section, index) => (
            <span
              key={section.id}
              className={`form-badge ${
                currentSectionId === section.id
                  ? "form-badge-primary"
                  : index < sectionIndex
                    ? "form-badge-success"
                    : "form-badge-outline"
              }`}
            >
              {section.title}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Progress calculation
  const totalQuestions = Object.keys(formStructure.questions).length
  const answeredQuestions = Object.keys(answers).length
  const progress = Math.min((answeredQuestions / totalQuestions) * 100, 100)

  // If form was successfully submitted, show thank you message
  if (submissionStatus && submissionStatus.type === "success") {
    return (
      <div className="form-card p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-6">{submissionStatus.message}</p>
        <button
          type="button"
          onClick={() => {
            setSubmissionStatus(null)
            setCurrentQuestionId(formStructure.startQuestion)
            setQuestionHistory([formStructure.startQuestion])
          }}
          className="form-button form-button-primary"
        >
          Start a New Form
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Progress bar */}
      <div className="form-progress-bar">
        <div className="form-progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Form tracker */}
      {!showingSummary && renderFormTracker()}

      <div className="form-card">
        <div className="form-card-header">
          {!showingSummary && (
            <>
              <h2 className="form-card-title">{currentQuestion.question}</h2>
              {isOnFinalQuestion && (
                <span className="form-badge form-badge-success mt-2 inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                  Final Question
                </span>
              )}
            </>
          )}
        </div>
        <div className="form-card-content">
          <AnimatePresence mode="wait">
            {showingSummary ? (
              renderSummary()
            ) : (
              <motion.div
                key={currentQuestionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {renderQuestion(currentQuestion)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="form-card-footer">
          <div>
            {questionHistory.length > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="form-button form-button-outline flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {isComplete && !showingSummary && (
              <>
                <button type="button" className="form-button form-button-outline" onClick={handleShowSummary}>
                  Review Answers
                </button>
                <button
                  type="submit"
                  className="form-button form-button-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
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
                  ) : (
                    <>
                      Complete Form
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isOnFinalQuestion && !showingSummary && (
        <div className="form-alert form-alert-success">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-green-600"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            This is the final question! After answering, you'll be able to review and submit your form.
          </div>
        </div>
      )}

      {isComplete && !isOnFinalQuestion && !showingSummary && (
        <div className="form-alert form-alert-success">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-green-600"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            You've completed all the questions! Please review your answers or click "Complete Form" to submit.
          </div>
        </div>
      )}

      {submissionStatus && submissionStatus.type === "error" && (
        <div className="form-alert bg-red-50 border-red-200 text-red-700 mt-4">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-red-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {submissionStatus.message}
          </div>
        </div>
      )}
    </form>
  )
}
