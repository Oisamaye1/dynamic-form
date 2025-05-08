import { CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FormSuccessProps {
  googleDriveSuccess?: boolean
}

export function FormSuccess({ googleDriveSuccess }: FormSuccessProps) {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="border-green-500 bg-green-50">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-800">Form submitted successfully!</AlertTitle>
        <AlertDescription className="text-green-700">
          Thank you for completing the form. Your response has been recorded.
        </AlertDescription>
      </Alert>

      {googleDriveSuccess === false && (
        <Alert variant="default" className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <AlertTitle className="text-yellow-800">Google Drive Notice</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your form was submitted successfully, but we couldn't save a copy to Google Drive. Don't worry, your
            submission is still recorded in our system.
          </AlertDescription>
        </Alert>
      )}

      {googleDriveSuccess === true && (
        <Alert variant="default" className="border-blue-500 bg-blue-50">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          <AlertTitle className="text-blue-800">Saved to Google Drive</AlertTitle>
          <AlertDescription className="text-blue-700">
            A copy of your submission has been saved to Google Drive for record-keeping.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
