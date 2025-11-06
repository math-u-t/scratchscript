# ScratchScript

Scratch 風のシンプルなスクリプト言語でプログラミングを学び、共有できるウェブアプリケーション

## 概要

**ScratchScript** は、初心者でも簡単にプログラミングを学べるテキストベースのスクリプト言語とオンラインエディターです。Scratch にインスパイアされた直感的な文法で、ブラウザ上で安全に実行できます。

### 主な機能

- ✨ **シンプルな文法**: Scratch 風の直感的な文法（.scs 形式）
- 🔐 **認証**: Auth0 による安全な認証 (Social / Email / Username+Password)
- 💻 **ブラウザ実行**: Web Worker を使用した安全なサンドボックス実行
- 🎨 **ダーク/ライトモード**: Material Design に準拠した美しい UI
- 📤 **ファイルアップロード**: 最大 5KB までの画像・音声ファイル対応
- 🔗 **簡単共有**: 公開プロジェクトを URL で共有
- 📱 **レスポンシブ**: モバイル・タブレット対応

## 技術スタック

### フロントエンド
- **Vue 3** + **Vite** + **TypeScript**
- **Pinia**: 状態管理
- **Vue Router**: ルーティング
- **Material Icons**: アイコン

### バックエンド
- **Vercel Edge Functions**: API (Edge Runtime)
- **Vercel Marketplace Storage (KV)**: データストレージ (Redis互換のサーバーレスデータベース)
  - 注: 2025年6月9日より、Vercel KV は Vercel Marketplace Storage 統合に置き換えられました
- **Auth0**: 認証

### インフラ
- **Vercel**: ホスティング・デプロイ

## プロジェクト構成

```
scratchscript/
├── api/                          # Vercel Edge Functions
│   ├── _lib/
│   │   ├── auth.ts              # 認証ヘルパー
│   │   └── storage.ts           # KV ストレージヘルパー
│   ├── project/
│   │   ├── [user]/
│   │   │   └── [slug].ts        # GET プロジェクト取得
│   │   ├── index.ts             # POST プロジェクト作成
│   │   └── [id]/
│   │       ├── index.ts         # PUT プロジェクト更新
│   │       ├── upload.ts        # POST ファイルアップロード
│   │       └── uploads.ts       # GET アップロード一覧
│   └── slug/
│       └── check.ts             # POST スラッグチェック
├── public/
│   └── scs-worker.js            # Web Worker (.scs 実行)
├── src/
│   ├── components/
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── ThemeToggle.vue
│   │   └── CodeEditor.vue       # .scs エディター
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── ProjectEditor.vue    # 編集画面
│   │   ├── ProjectView.vue      # 公開ページ
│   │   └── FAQ.vue
│   ├── stores/
│   │   ├── auth.ts              # 認証ストア
│   │   ├── theme.ts             # テーマストア
│   │   └── project.ts           # プロジェクトストア
│   ├── lib/
│   │   ├── scs-parser.ts        # .scs パーサー
│   │   ├── scs-interpreter.ts   # .scs インタプリタ
│   │   └── api-client.ts        # API クライアント
│   ├── router/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd scratchscript
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Auth0 のセットアップ

1. [Auth0 Dashboard](https://manage.auth0.com/) でアカウントを作成
2. 新しいアプリケーションを作成（Single Page Application を選択）
3. 設定を行う:
   - Allowed Callback URLs: `http://localhost:5173` (開発時)
   - Allowed Logout URLs: `http://localhost:5173` (開発時)
   - Allowed Web Origins: `http://localhost:5173` (開発時)
4. Domain と Client ID を取得

### 4. 環境変数の設定

`.env` ファイルを作成（`.env.example` を参考に）:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_CLIENT_SECRET=your_client_secret

# Vercel Marketplace Storage - KV (Redis互換)
# 2025年6月9日より、Vercel KV は Vercel Marketplace Storage に統合
# Vercel が自動設定 (自動アカウントプロビジョニング、統一請求)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## デプロイ手順（Vercel）

### 前提条件
- Vercel アカウント
- Auth0 アプリケーションのセットアップ完了
- GitHub リポジトリ（推奨）

### 手順

1. **Vercel プロジェクトを作成**
   ```bash
   # Vercel CLI をインストール（初回のみ）
   npm install -g vercel

   # プロジェクトをデプロイ
   vercel
   ```

2. **Vercel Marketplace Storage (KV) を追加**
   - Vercel Dashboard でプロジェクトを開く
   - Storage タブから "Create Database" または "Add Storage"
   - Vercel Marketplace から Redis互換の KV ストレージを選択
   - データベース名を入力して作成
   - 自動的にアカウントがプロビジョニングされ、環境変数が設定されます
   - 注: 2025年6月9日より、Vercel Marketplace Storage 統合に移行

3. **環境変数を設定**
   - Vercel Dashboard → Settings → Environment Variables
   - 以下を追加:
     ```
     VITE_AUTH0_DOMAIN=your-domain.auth0.com
     VITE_AUTH0_CLIENT_ID=your_client_id
     VITE_AUTH0_AUDIENCE=https://your-api-identifier
     AUTH0_CLIENT_SECRET=your_client_secret
     ```
   - Auth0 Dashboard で Allowed Callback URLs と Allowed Logout URLs に本番 URL を追加

4. **デプロイ**
   ```bash
   vercel --prod
   ```

### CI/CD（GitHub 連携）

1. Vercel Dashboard で GitHub リポジトリと連携
2. main ブランチへの push で自動デプロイ
3. プレビュー環境は PR ごとに自動作成

**設定例（vercel.json）**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

## .scs 文法仕様

### 基本構文

#### 変数
```scs
set x to 10
set name to "Hello"
set isActive to true
```

#### 出力
```scs
say "Hello, World!"
say x
```

#### 演算
```scs
set result to x + 5
set result to x * 2
```

#### 条件分岐
```scs
if x > 10 then
  say "大きい"
else
  say "小さい"
end
```

#### 繰り返し
```scs
repeat 5 times
  say "Hello!"
end

set i to 0
while i < 10 do
  say i
  set i to i + 1
end
```

### サンプルプログラム

**FizzBuzz**:
```scs
set i to 1
while i <= 20 do
  if i % 15 == 0 then
    say "FizzBuzz"
  else
    if i % 3 == 0 then
      say "Fizz"
    else
      if i % 5 == 0 then
        say "Buzz"
      else
        say i
      end
    end
  end
  set i to i + 1
end
```

詳細は [SCS_SYNTAX.md](./SCS_SYNTAX.md) を参照

## テスト手順

### 動作確認チェックリスト

#### 1. 認証テスト
- [ ] Auth0 ログインが正常に動作する
- [ ] Social ログイン（設定している場合）が正常に動作する
- [ ] Email / Password ログインが正常に動作する
- [ ] ログアウトが正常に動作する

#### 2. プロジェクト管理テスト
- [ ] 新しいプロジェクトを作成できる
- [ ] プロジェクト名・説明を編集できる
- [ ] スラッグを変更できる（一意性チェック含む）
- [ ] プロジェクトを保存できる
- [ ] 公開/非公開を切り替えられる

#### 3. エディターテスト
- [ ] コードを入力・編集できる
- [ ] 行番号が正しく表示される
- [ ] コードを実行できる
- [ ] 実行結果が正しく表示される
- [ ] エラーメッセージが表示される
- [ ] タイムアウトが機能する（無限ループ対策）

#### 4. 公開ページテスト
- [ ] 公開プロジェクトを閲覧できる
- [ ] 非公開プロジェクトはアクセスできない
- [ ] ソースコードが表示される
- [ ] コードを実行できる（読み取り専用）
- [ ] リンクをコピーできる

#### 5. アップロードテスト
- [ ] 画像ファイルをアップロードできる
- [ ] 5KB を超えるファイルは拒否される
- [ ] 合計 5KB を超えるアップロードは拒否される
- [ ] アップロード一覧が表示される
- [ ] ファイルを削除できる

#### 6. UI/UX テスト
- [ ] ダーク/ライトモード切り替えが動作する
- [ ] レスポンシブデザインが機能する（モバイル・タブレット）
- [ ] Material Icons が正しく表示される

#### 7. セキュリティテスト
- [ ] 未認証ユーザーは編集画面にアクセスできない
- [ ] 管理者以外はプロジェクトを編集できない
- [ ] ファイルタイプが制限される
- [ ] サーバー側でファイルサイズがチェックされる

## データモデル

### Project
```typescript
{
  id: string              // プロジェクト ID
  userId: string          // オーナーのユーザー ID
  userName: string        // オーナーのユーザー名
  slug: string            // URL スラッグ（ユーザー内で一意）
  title: string           // プロジェクト名
  description: string     // 説明
  sourceCode: string      // .scs ソースコード
  isPublic: boolean       // 公開/非公開
  createdAt: number       // 作成日時（Unix タイムスタンプ）
  updatedAt: number       // 更新日時
  managers: string[]      // 編集権限を持つユーザー ID リスト
}
```

### ProjectUpload
```typescript
{
  id: string              // アップロード ID
  projectId: string       // プロジェクト ID
  fileName: string        // ファイル名
  mimeType: string        // MIME タイプ
  size: number            // サイズ（バイト）
  data: string            // Base64 エンコードされたデータ
  createdAt: number       // アップロード日時
}
```

## セキュリティ

### 実装済み
- ✅ Auth0 JWT 検証（Edge Functions）
- ✅ 編集権限チェック（managers リスト）
- ✅ ファイルサイズ制限（5KB、サーバー側で強制）
- ✅ ファイルタイプ制限（MIME タイプチェック）
- ✅ Web Worker サンドボックス実行
- ✅ 実行タイムアウト（5秒）
- ✅ スラッグ一意性チェック

### 推奨事項
- HTTPS のみ許可（Vercel デフォルト）
- CSP ヘッダーの設定
- Rate limiting（Vercel Edge Middleware で実装可能）

## 将来の拡張案

### 短期
- プロジェクト削除機能
- プロジェクト一覧（ユーザーダッシュボード）
- プロジェクト検索

### 中期
- コラボレーション（複数ユーザーでの編集）
- バージョン管理（Git 風）
- コメント機能
- いいね・スター機能

### 長期
- 公開ギャラリー
- コミュニティ機能
- リアルタイムコラボレーション（WebSocket）
- より高度な .scs 機能（関数定義、配列、オブジェクト）
- デバッガー（ブレークポイント、ステップ実行）

## デプロイ一行手順

```bash
# 1. Vercel にデプロイ（初回）
vercel

# 2. Vercel KV を Dashboard で追加、環境変数を設定

# 3. 本番デプロイ
vercel --prod
```

## トラブルシューティング

### Auth0 ログインができない
- `VITE_AUTH0_DOMAIN` と `VITE_AUTH0_CLIENT_ID` が正しく設定されているか確認
- Auth0 Dashboard で Allowed Callback URLs が正しく設定されているか確認
- ブラウザのコンソールでエラーを確認

### API が 401 エラーを返す
- Auth0 のアクセストークンが正しく取得されているか確認
- `AUTH0_CLIENT_SECRET` が Vercel に設定されているか確認
- Auth0 Dashboard で API (Audience) が正しく設定されているか確認

### KV ストレージエラー
- Vercel Marketplace Storage (KV) が正しくプロジェクトに追加されているか確認
- 環境変数が自動設定されているか確認
- 注: 2025年6月9日以降は Vercel Marketplace から KV ストレージを追加

### ビルドエラー
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScript のチェック
npm run type-check
```

## ライセンス

MIT License

## サポート

質問や問題がある場合は、[GitHub Issues](https://github.com/yourusername/scratchscript/issues) で報告してください。

---

**作成日**: 2025年
**バージョン**: 1.0.0
