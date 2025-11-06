/**
 * POST /api/project
 *
 * 新しいプロジェクトを作成（認証必須）
 */

import type { NextRequest } from 'next/server'
import { verifyClerkToken, jsonResponse, errorResponse, corsHeaders } from '../_lib/auth'
import { saveProject, generateAvailableSlug } from '../_lib/storage'
import type { CreateProjectRequest, Project } from '../../src/types'

export const config = {
  runtime: 'edge'
}

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

    // リクエストボディを取得
    const body: CreateProjectRequest = await request.json()

    // バリデーション
    if (!body.title || body.title.trim() === '') {
      return errorResponse('Title is required', 400)
    }

    if (!body.slug || !/^[a-z0-9-]+$/.test(body.slug)) {
      return errorResponse('Invalid slug format (use lowercase letters, numbers, and hyphens)', 400)
    }

    // スラッグの一意性をチェック、必要に応じて自動調整
    const availableSlug = await generateAvailableSlug(user.userName, body.slug)

    // プロジェクトを作成
    const now = Date.now()
    const project: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: user.userId,
      userName: user.userName,
      slug: availableSlug,
      title: body.title.trim(),
      description: body.description?.trim() || '',
      sourceCode: body.sourceCode || '# Welcome to ScratchScript!\n\nset message to "Hello, World!"\nsay message',
      isPublic: body.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
      managers: [user.userId]
    }

    // 保存
    await saveProject(project)

    return jsonResponse(project, 201)
  } catch (error) {
    console.error('Error creating project:', error)
    return errorResponse('Internal server error', 500)
  }
}
