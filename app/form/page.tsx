import DynamicForm from "@/components/dynamic-form"

export default function FormPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Dynamic Form</h1>
        <p className="text-muted-foreground">Please fill out the form below to get started.</p>
      </div>
      <DynamicForm />
    </div>
  )
}
