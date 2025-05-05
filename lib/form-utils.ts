// Function to get the full question text from a question ID
export function getQuestionText(questionId: string): string {
  // Just format the ID as a readable question
  return questionId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Function to format form data with full questions
export function formatFormData(formData: Record<string, any>): Record<string, { question: string; answer: string }[]> {
  const sections: Record<string, { question: string; answer: string }[]> = {}

  // Ensure formData is an object
  if (!formData || typeof formData !== "object") {
    return sections
  }

  try {
    Object.entries(formData).forEach(([key, value]) => {
      // Skip if key is not a string or doesn't contain an underscore
      if (typeof key !== "string") {
        return
      }

      // Get section name - if no underscore, use "general" as section
      const sectionName = key.includes("_") ? key.split("_")[0] : "general"

      if (!sections[sectionName]) {
        sections[sectionName] = []
      }

      // Get the full question text
      const questionText = getQuestionText(key)

      // Format the answer as string
      const formattedAnswer = typeof value === "string" ? value : JSON.stringify(value)

      sections[sectionName].push({
        question: questionText,
        answer: formattedAnswer,
      })
    })
  } catch (error) {
    console.error("Error formatting form data:", error)
    // Return at least an empty object
    return { error: [{ question: "Error", answer: "An error occurred while formatting the form data." }] }
  }

  return sections
}
