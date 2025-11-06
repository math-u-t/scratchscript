/**
 * POST /api/project/:id/upload
 *
 * ファイルをアップロード（認証必須、権限チェック、5KB制限）
 */

import type { NextRequest } from 'next/server'
import { verifyClerkToken, jsonResponse, errorResponse, corsHeaders } from '../../_lib/auth'
import { getProject, saveUpload, getProjectUploadSize } from '../../_lib/storage'
import type { UploadFileRequest, ProjectUpload } from '../../../src/types'

export const config = {
  runtime: 'edge'
}

const MAX_UPLOAD_SIZE = 5 * 1024 // 5KB
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
  'audio/wav',
  'audio/mpeg',
  'text/plain'
]

export default async function handler(request: NextRequest) {
  // CORS プリフライト
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  if (request.method !== 'POST') {
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
    const projectId = pathParts[pathParts.length - 2] // upload の前

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
      return errorResponse('Forbidden: You do not have permission to upload files to this project', 403)
    }

    // リクエストボディを取得
    const body: UploadFileRequest = await request.json()

    // バリデーション
    if (!body.fileName || !body.mimeType || !body.data) {
      return errorResponse('Missing required fields (fileName, mimeType, data)', 400)
    }

    // MIME タイプチェック
    if (!ALLOWED_MIME_TYPES.includes(body.mimeType)) {
      return errorResponse(`File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`, 400)
    }

    // Base64 デコードしてサイズを計算
    let fileSize: number
    try {
      // Base64 文字列のサイズを計算（padding を考慮）
      const base64Data = body.data.replace(/^data:[^;]+;base64,/, '')
      const padding = (base64Data.match(/=/g) || []).length
      fileSize = (base64Data.length * 3 / 4) - padding
    } catch (error) {
      return errorResponse('Invalid base64 data', 400)
    }

    // ファイルサイズチェック
    if (fileSize > MAX_UPLOAD_SIZE) {
      return errorResponse(`File too large. Maximum size is ${MAX_UPLOAD_SIZE} bytes (5KB)`, 413)
    }

    // プロジェクトの合計アップロードサイズをチェック
    const currentSize = await getProjectUploadSize(projectId)
    if (currentSize + fileSize > MAX_UPLOAD_SIZE) {
      return errorResponse(
        `Total upload size would exceed limit. Current: ${currentSize} bytes, Limit: ${MAX_UPLOAD_SIZE} bytes`,
        413
      )
    }

    // アップロードを作成
    const upload: ProjectUpload = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      projectId,
      fileName: body.fileName,
      mimeType: body.mimeType,
      size: fileSize,
      data: body.data,
      createdAt: Date.now()
    }

    // 保存
    await saveUpload(upload)

    return jsonResponse({
      id: upload.id,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      size: upload.size,
      createdAt: upload.createdAt
    }, 201)
  } catch (error) {
    console.error('Error uploading file:', error)
    return errorResponse('Internal server error', 500)
  }
}
