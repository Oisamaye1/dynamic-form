import { CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type FormSuccessProps = {}

export function FormSuccess({}: FormSuccessProps) {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="border-green-500 bg-green-50">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-800">Form submitted successfully!</AlertTitle>
        <AlertDescription className="text-green-700">
          Thank you for completing the form. Your response has been recorded.
        </AlertDescription>
      </Alert>
    </div>
  )
}
