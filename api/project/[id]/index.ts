/**
 * PUT /api/project/:id
 *
 * プロジェクトを更新（認証必須、権限チェック）
 */

import type { NextRequest } from 'next/server'
import { verifyClerkToken, jsonResponse, errorResponse, corsHeaders } from '../../_lib/auth'
import { getProject, saveProject, generateAvailableSlug } from '../../_lib/storage'
import type { UpdateProjectRequest } from '../../../src/types'

export const config = {
  runtime: 'edge'
}

export default async function handler(request: NextRequest) {
  // CORS プリフライト
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  if (request.method !== 'PUT') {
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
    const projectId = pathParts[pathParts.length - 1]

    if (!projectId) {
      return errorResponse('Invalid request', 400)
    }

    // プロジェクトを取得
    const project = await getProject(projectId)
    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // 権限チェック（管理者のみ編集可能）
    if (!project.managers.includes(user.userId)) {
      return errorResponse('Forbidden: You do not have permission to edit this project', 403)
    }

    // リクエストボディを取得
    const body: UpdateProjectRequest = await request.json()

    // 更新処理
    if (body.title !== undefined) {
      if (body.title.trim() === '') {
        return errorResponse('Title cannot be empty', 400)
      }
      project.title = body.title.trim()
    }

    if (body.description !== undefined) {
      project.description = body.description.trim()
    }

    if (body.sourceCode !== undefined) {
      project.sourceCode = body.sourceCode
    }

    if (body.isPublic !== undefined) {
      project.isPublic = body.isPublic
    }

    // スラッグの更新
    if (body.slug !== undefined) {
      if (!/^[a-z0-9-]+$/.test(body.slug)) {
        return errorResponse('Invalid slug format (use lowercase letters, numbers, and hyphens)', 400)
      }

      // スラッグが変更される場合、一意性をチェック
      if (body.slug !== project.slug) {
        const availableSlug = await generateAvailableSlug(user.userName, body.slug)
        project.slug = availableSlug
      }
    }

    // 更新日時を更新
    project.updatedAt = Date.now()

    // 保存
    await saveProject(project)

    return jsonResponse(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return errorResponse('Internal server error', 500)
  }
}
