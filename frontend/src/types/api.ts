export type User = {
  id: string
  name: string
  email: string
  username: string
  role: "user" | "admin"
  is_active: boolean
  is_email_verified: boolean
}

export type TokenResponse = {
  access_token: string
}

export type Repository = {
  id: string
  user_id: string
  url: string
  provider: string
  owner: string
  name: string
  branch: string
  commit_sha: string | null
  status: string
  file_count: number
  chunk_count: number
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export type Chat = {
  id: string
  user_id: string
  repository_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type MessageSource = {
  id?: string
  file_path?: string
  chunk_index?: number
  score?: number
}

export type Message = {
  id: string
  chat_id: string
  user_id: string
  role: "user" | "assistant" | "system"
  content: string
  sources?: MessageSource[]
  model?: string | null
  created_at: string
  updated_at: string
}
