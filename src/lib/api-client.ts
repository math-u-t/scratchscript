/**
 * API クライアント
 *
 * バックエンド API との通信を管理
 */

import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UploadFileRequest,
  CheckSlugRequest,
  CheckSlugResponse
} from '@/types'

const API_BASE = import.meta.env.PROD ? '/api' : '/api'

/**
 * 認証トークンを取得
 */
async function getAuthToken(): Promise<string | null> {
  // Clerk から現在のセッショントークンを取得
  // 実際には Clerk の useAuth フックから取得する必要があります
  if (typeof window !== 'undefined' && (window as any).__clerk) {
    try {
      const session = await (window as any).__clerk.session
      if (session) {
        return await session.getToken()
      }
    } catch (error) {
      console.error('Failed to get auth token:', error)
    }
  }
  return null
}

/**
 * API リクエストを送信
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }

  if (requireAuth) {
    const token = await getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// ==================== Project APIs ====================

export async function getPublicProject(userName: string, slug: string): Promise<Project> {
  return request<Project>(`/project/${userName}/${slug}`)
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  return request<Project>('/project', {
    method: 'POST',
    body: JSON.stringify(data)
  }, true)
}

export async function updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
  return request<Project>(`/project/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, true)
}

export async function uploadFile(projectId: string, data: UploadFileRequest): Promise<any> {
  return request(`/project/${projectId}/upload`, {
    method: 'POST',
    body: JSON.stringify(data)
  }, true)
}

export async function getProjectUploads(projectId: string): Promise<any> {
  return request(`/project/${projectId}/uploads`, {}, true)
}

export async function checkSlug(data: CheckSlugRequest): Promise<CheckSlugResponse> {
  return request<CheckSlugResponse>('/slug/check', {
    method: 'POST',
    body: JSON.stringify(data)
  }, true)
}
