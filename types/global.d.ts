declare global {
  var veoTasks: Map<
    string,
    {
      status: "pending" | "processing" | "completed" | "failed"
      progress: number
      videoUrl?: string
      createdAt: Date
      prompt: string
      duration: number
    }
  >
}

export {}
