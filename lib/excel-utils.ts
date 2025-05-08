import * as XLSX from "xlsx"
import { formatFormData } from "./form-utils"
import { logError } from "./debug-utils"

// Format a single form response for Excel export
export const formatResponseForExcel = (response: any) => {
  try {
    // Get the formatted sections with full questions
    const sections = formatFormData(response.form_data || {})

    // Flatten the data for Excel
    const flatData: Record<string, string> = {
      "Submission ID": response.id,
      "Submission Date": new Date(response.created_at).toLocaleString(),
    }

    // Add all form fields
    Object.entries(sections).forEach(([sectionName, items]) => {
      items.forEach((item) => {
        // Create a key that includes the section for better organization
        const key = `${sectionName.replace("_", " ")} - ${item.question}`
        flatData[key] = item.answer
      })
    })

    return flatData
  } catch (error) {
    logError("formatResponseForExcel", error)
    return {
      "Submission ID": response.id,
      "Submission Date": new Date(response.created_at).toLocaleString(),
      Error: "Failed to format response data",
    }
  }
}

// Generate Excel file for a single form response
export const generateSingleResponseExcel = (response: any) => {
  try {
    const formattedData = formatResponseForExcel(response)

    // Convert to worksheet format (array of arrays)
    const worksheet = XLSX.utils.json_to_sheet([formattedData])

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Form Response")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

    return {
      buffer: excelBuffer,
      filename: `form-response-${response.id}.xlsx`,
    }
  } catch (error) {
    logError("generateSingleResponseExcel", error)
    throw new Error("Failed to generate Excel file")
  }
}

// Generate Excel file for multiple form responses
export const generateAllResponsesExcel = (responses: any[]) => {
  try {
    // Format all responses
    const formattedData = responses.map((response) => formatResponseForExcel(response))

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Form Responses")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

    return {
      buffer: excelBuffer,
      filename: `all-form-responses-${new Date().toISOString().split("T")[0]}.xlsx`,
    }
  } catch (error) {
    logError("generateAllResponsesExcel", error)
    throw new Error("Failed to generate Excel file")
  }
}
