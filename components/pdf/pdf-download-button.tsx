"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function PDFDownloadButton({ responseId }: { responseId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      // Create a direct download link to the PDF endpoint
      const downloadUrl = `/api/pdf/${responseId}`

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = downloadUrl
      link.setAttribute("download", `form-response-${responseId}.pdf`)
      link.setAttribute("target", "_blank")

      // Append to the document and trigger the click
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Preparing PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  )
}
