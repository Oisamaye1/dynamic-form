"use client"

import { useEffect, useState } from "react"
import DynamicForm from "./dynamic-form"

export default function EmbeddedForm() {
  const [isEmbedded, setIsEmbedded] = useState(false)

  useEffect(() => {
    // Check if the page is embedded in an iframe
    try {
      setIsEmbedded(window.self !== window.top)
    } catch (e) {
      // If we can't access window.top due to cross-origin restrictions,
      // we're definitely in an iframe
      setIsEmbedded(true)
    }
  }, [])

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      {isEmbedded && (
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Dynamic Form</h1>
          <p className="text-muted-foreground">Please fill out the form below to get started.</p>
        </div>
      )}
      <DynamicForm />
    </div>
  )
}
