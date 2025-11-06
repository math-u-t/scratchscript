/**
 * Clerk 認証ヘルパー
 *
 * Edge Functions で Clerk の JWT を検証します
 */

export interface ClerkUser {
  userId: string
  userName: string
}

/**
 * リクエストから Clerk のセッショントークンを検証してユーザー情報を取得
 */
export async function verifyClerkToken(request: Request): Promise<ClerkUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // Clerk の公開鍵で JWT を検証
    // 本番環境では @clerk/backend を使用するか、JWK エンドポイントから公開鍵を取得して検証
    const clerkSecretKey = process.env.CLERK_SECRET_KEY

    if (!clerkSecretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured')
    }

    // 簡易実装: トークンをデコードしてユーザー情報を取得
    // 実際には JWT を適切に検証する必要があります
    const payload = await verifyJWT(token, clerkSecretKey)

    if (!payload || !payload.sub) {
      return null
    }

    return {
      userId: payload.sub,
      userName: payload.username || payload.email?.split('@')[0] || payload.sub
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * JWT を検証（簡易実装）
 * 本番環境では jose などのライブラリを使用してください
 */
async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    // JWT は header.payload.signature の形式
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // ペイロードをデコード
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    // 有効期限チェック
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

/**
 * CORS ヘッダーを設定
 */
export function corsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

/**
 * JSON レスポンスを作成
 */
export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...headers
    }
  })
}

/**
 * エラーレスポンスを作成
 */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status)
}
