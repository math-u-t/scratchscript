/**
 * POST /api/slug/check
 *
 * スラッグの一意性をチェック（認証必須）
 */

import type { NextRequest } from 'next/server'
import { verifyClerkToken, jsonResponse, errorResponse, corsHeaders } from '../_lib/auth'
import { isSlugAvailable, generateAvailableSlug } from '../_lib/storage'
import type { CheckSlugRequest, CheckSlugResponse } from '../../src/types'

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
    const body: CheckSlugRequest = await request.json()

    // バリデーション
    if (!body.slug || !/^[a-z0-9-]+$/.test(body.slug)) {
      return errorResponse('Invalid slug format (use lowercase letters, numbers, and hyphens)', 400)
    }

    // スラッグの一意性をチェック
    const available = await isSlugAvailable(user.userName, body.slug, body.currentProjectId)

    const response: CheckSlugResponse = {
      available
    }

    // 利用不可の場合、代替スラッグを提案
    if (!available) {
      const suggestedSlug = await generateAvailableSlug(user.userName, body.slug)
      response.suggestedSlug = suggestedSlug
    }

    return jsonResponse(response)
  } catch (error) {
    console.error('Error checking slug:', error)
    return errorResponse('Internal server error', 500)
  }
}
