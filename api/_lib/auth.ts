/**
 * Auth0 認証ヘルパー
 *
 * Edge Functions で Auth0 の JWT を検証します
 */

export interface Auth0User {
  userId: string
  userName: string
  email?: string
}

/**
 * リクエストから Auth0 のアクセストークンを検証してユーザー情報を取得
 */
export async function verifyAuth0Token(request: Request): Promise<Auth0User | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // Auth0 の JWT を検証
    // 本番環境では jwks-rsa と jsonwebtoken を使用して検証
    const payload = await verifyJWT(token)

    if (!payload || !payload.sub) {
      return null
    }

    return {
      userId: payload.sub,
      userName: payload.name || payload.nickname || payload.email?.split('@')[0] || payload.sub,
      email: payload.email
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * JWT を検証（簡易実装）
 * 本番環境では jose や jsonwebtoken ライブラリを使用してください
 */
async function verifyJWT(token: string): Promise<any> {
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

    // Note: 本番環境では以下も必要:
    // 1. Auth0 の公開鍵で署名を検証
    // 2. issuer (iss) が正しいか確認
    // 3. audience (aud) が正しいか確認

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
