/**
 * GET /api/project/:id/uploads
 *
 * プロジェクトのアップロード一覧を取得（認証必須、権限チェック）
 */

import type { NextRequest } from 'next/server'
import { verifyClerkToken, jsonResponse, errorResponse, corsHeaders } from '../../_lib/auth'
import { getProject, getProjectUploads, getProjectUploadSize } from '../../_lib/storage'

export const config = {
  runtime: 'edge'
}

export default async function handler(request: NextRequest) {
  // CORS プリフライト
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    // 認証チェック
    const user = await verifyClerkToken(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // URL からプロジェクト ID を取得
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const projectId = pathParts[pathParts.length - 2] // uploads の前

    if (!projectId) {
      return errorResponse('Invalid request', 400)
    }

    // プロジェクトを取得
    const project = await getProject(projectId)
    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // 権限チェック
    if (!project.managers.includes(user.userId)) {
      return errorResponse('Forbidden: You do not have permission to view uploads for this project', 403)
    }

    // アップロード一覧を取得
    const uploads = await getProjectUploads(projectId)
    const totalSize = await getProjectUploadSize(projectId)

    // data フィールドを除いて返す（メタデータのみ）
    const uploadsMeta = uploads.map(upload => ({
      id: upload.id,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      size: upload.size,
      createdAt: upload.createdAt
    }))

    return jsonResponse({
      uploads: uploadsMeta,
      totalSize,
      maxSize: 5 * 1024 // 5KB
    })
  } catch (error) {
    console.error('Error fetching uploads:', error)
    return errorResponse('Internal server error', 500)
  }
}
