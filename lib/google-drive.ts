import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { logError } from "./debug-utils"

// Initialize the Google Drive API client
const initGoogleDriveClient = () => {
  try {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    })

    const drive = google.drive({ version: "v3", auth })
    return drive
  } catch (error) {
    logError("initGoogleDriveClient", error)
    throw new Error("Failed to initialize Google Drive client")
  }
}

// Create a folder in Google Drive
export const createFolder = async (folderName: string, parentFolderId?: string) => {
  try {
    const drive = initGoogleDriveClient()

    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentFolderId ? [parentFolderId] : undefined,
    }

    const response = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    })

    return response.data.id
  } catch (error) {
    logError("createFolder", error)
    throw new Error(`Failed to create folder: ${folderName}`)
  }
}

// Check if a folder exists and return its ID, or create it if it doesn't exist
export const findOrCreateFolder = async (folderName: string, parentFolderId?: string) => {
  try {
    const drive = initGoogleDriveClient()

    // Search for the folder
    const query = parentFolderId
      ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
    })

    // If folder exists, return its ID
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id
    }

    // If folder doesn't exist, create it
    return await createFolder(folderName, parentFolderId)
  } catch (error) {
    logError("findOrCreateFolder", error)
    throw new Error(`Failed to find or create folder: ${folderName}`)
  }
}

// Create a JSON file in Google Drive
export const createJsonFile = async (fileName: string, content: any, folderId: string) => {
  try {
    const drive = initGoogleDriveClient()

    // Convert content to JSON string
    const jsonContent = JSON.stringify(content, null, 2)

    // Create file metadata
    const fileMetadata = {
      name: `${fileName}.json`,
      parents: [folderId],
    }

    // Create media
    const media = {
      mimeType: "application/json",
      body: jsonContent,
    }

    // Create the file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    })

    return response.data.id
  } catch (error) {
    logError("createJsonFile", error)
    throw new Error(`Failed to create JSON file: ${fileName}`)
  }
}

// Save form submission to Google Drive
export const saveFormSubmissionToDrive = async (
  userName: string,
  formData: Record<string, string>,
  submissionId: string,
) => {
  try {
    // Get or create the main submissions folder
    const mainFolderId = await findOrCreateFolder("Form Submissions")

    // Sanitize user name for folder name (remove special characters)
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9 ]/g, "").trim()

    // Create a folder for the user if it doesn't exist
    const userFolderId = await findOrCreateFolder(sanitizedUserName || `Anonymous-${submissionId}`, mainFolderId)

    // Create a JSON file with the form data
    const timestamp = new Date().toISOString().replace(/:/g, "-")
    const fileName = `submission-${timestamp}`

    const fileId = await createJsonFile(
      fileName,
      {
        submissionId,
        userName,
        submissionDate: new Date().toISOString(),
        formData,
      },
      userFolderId,
    )

    return {
      success: true,
      fileId,
      userFolderId,
    }
  } catch (error) {
    logError("saveFormSubmissionToDrive", error)
    return {
      success: false,
      error: "Failed to save submission to Google Drive",
    }
  }
}
