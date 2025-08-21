export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface PromptHistory {
  id: string
  prompt: string
  enhancedPrompt?: string
  createdAt: Date
  status: "pending" | "completed" | "failed"
  videoUrl?: string
  duration: number
}

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("user")
  return userData ? JSON.parse(userData) : null
}

export const setUser = (user: User) => {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export const logout = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("user")
  localStorage.removeItem("promptHistory")
}

export const getPromptHistory = (): PromptHistory[] => {
  if (typeof window === "undefined") return []
  const history = localStorage.getItem("promptHistory")
  return history ? JSON.parse(history) : []
}

export const addToPromptHistory = (prompt: PromptHistory) => {
  if (typeof window === "undefined") return
  const history = getPromptHistory()
  history.unshift(prompt)
  localStorage.setItem("promptHistory", JSON.stringify(history.slice(0, 50))) // Keep last 50
}

/**
 * Atualiza o status de um prompt no histórico
 * Usado para marcar prompts como concluídos ou falhados após a geração
 */
export const updatePromptStatus = (id: string, status: "completed" | "failed", videoUrl?: string) => {
  if (typeof window === "undefined") return
  const history = getPromptHistory()
  const updatedHistory = history.map((item) => (item.id === id ? { ...item, status, videoUrl } : item))
  localStorage.setItem("promptHistory", JSON.stringify(updatedHistory))
}

/**
 * Busca um prompt específico no histórico pelo ID
 */
export const getPromptById = (id: string): PromptHistory | null => {
  const history = getPromptHistory()
  return history.find((item) => item.id === id) || null
}
