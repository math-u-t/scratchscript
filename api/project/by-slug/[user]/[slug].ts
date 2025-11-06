/**
 * GET /api/project/by-slug/:user/:slug
 *
 * 公開プロジェクトを取得（認証不要）
 */

import type { NextRequest } from 'next/server'
import { getProjectBySlug } from '../../../_lib/storage'
import { jsonResponse, errorResponse, corsHeaders } from '../../../_lib/auth'

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
    // URL からパラメータを取得
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const userName = pathParts[pathParts.length - 2]
    const slug = pathParts[pathParts.length - 1]

    if (!userName || !slug) {
      return errorResponse('Invalid request', 400)
    }

    // プロジェクトを取得
    const project = await getProjectBySlug(userName, slug)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // 非公開の場合は認証が必要
    if (!project.isPublic) {
      return errorResponse('This project is private', 403)
    }

    // 公開プロジェクトを返す
    return jsonResponse(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return errorResponse('Internal server error', 500)
  }
}
