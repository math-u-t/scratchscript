// ==================== Project Types ====================

export interface Project {
  id: string
  userId: string
  userName: string
  slug: string
  title: string
  description: string
  sourceCode: string // .scs ファイルの内容
  isPublic: boolean
  createdAt: number
  updatedAt: number
  managers: string[] // 編集権限を持つユーザー ID のリスト
}

export interface ProjectUpload {
  id: string
  projectId: string
  fileName: string
  mimeType: string
  size: number // bytes
  data: string // base64 encoded
  createdAt: number
}

// ==================== API Request/Response Types ====================

export interface CreateProjectRequest {
  title: string
  description?: string
  slug: string
  sourceCode?: string
  isPublic?: boolean
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  slug?: string
  sourceCode?: string
  isPublic?: boolean
}

export interface UploadFileRequest {
  fileName: string
  mimeType: string
  data: string // base64
}

export interface CheckSlugRequest {
  slug: string
  userId: string
  currentProjectId?: string
}

export interface CheckSlugResponse {
  available: boolean
  suggestedSlug?: string
}

export interface ApiError {
  error: string
  message: string
}

// ==================== SCS Interpreter Types ====================

export interface SCSExecutionContext {
  variables: Map<string, any>
  output: string[]
  logs: string[]
}

export interface SCSExecutionResult {
  success: boolean
  output: string[]
  logs: string[]
  error?: string
}

// ==================== Theme Types ====================

export type Theme = 'light' | 'dark'
