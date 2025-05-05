export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          }
        }
        return value
      },
      2,
    )
  } catch (error) {
    return `[Error stringifying object: ${error instanceof Error ? error.message : String(error)}]`
  }
}

export function logError(context: string, error: unknown): void {
  console.error(`[${context}] Error:`, error instanceof Error ? error.message : String(error))
  if (error instanceof Error && error.stack) {
    console.error(`[${context}] Stack:`, error.stack)
  }
}
