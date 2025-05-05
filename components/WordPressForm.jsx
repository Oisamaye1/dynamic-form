"use client"

import { useState, useEffect, useRef } from "react"

export default function WordPressForm() {
  const [height, setHeight] = useState(500)
  const iframeRef = useRef(null)

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event) => {
      // Make sure the message is from your WordPress site
      // In production, replace with your actual WordPress domain
      if (event.origin === "https://your-wordpress-site.com") {
        if (event.data.type === "formHeight") {
          // Add a small buffer to prevent scrollbars
          setHeight(event.data.height + 20)
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Function to handle form submission success
  const handleFormSuccess = () => {
    // You can add custom logic here when the form is successfully submitted
    console.log("Form submitted successfully!")
  }

  return (
    <div className="wordpress-form-container">
      <iframe
        ref={iframeRef}
        src="https://your-wordpress-site.com/form-page/"
        width="100%"
        height={height}
        frameBorder="0"
        title="Dynamic Form"
        style={{
          transition: "height 0.3s ease",
          minHeight: "500px",
          overflow: "hidden",
        }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
