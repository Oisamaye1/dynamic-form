"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { useState } from "react"

interface ExcelDownloadButtonProps {
  url: string
  filename?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function ExcelDownloadButton({
  url,
  filename,
  variant = "outline",
  size = "default",
  className,
  children,
}: ExcelDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsLoading(true)

      // Fetch the Excel file
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to download Excel file")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = downloadUrl

      // Set the filename from the Content-Disposition header or use the provided filename
      const contentDisposition = response.headers.get("Content-Disposition")
      const serverFilename = contentDisposition ? contentDisposition.split("filename=")[1]?.replace(/"/g, "") : null

      link.download = serverFilename || filename || "download.xlsx"

      // Append the link to the body
      document.body.appendChild(link)

      // Click the link to start the download
      link.click()

      // Remove the link from the body
      document.body.removeChild(link)

      // Release the URL object
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error downloading Excel:", error)
      alert("Failed to download Excel file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={isLoading} className={className}>
      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
      {children || "Download Excel"}
    </Button>
  )
}
