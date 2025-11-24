# Course Sales SaaS - プロトタイプ

講師が自分の「オンラインスクール」を開設し、コースを作成・販売できるWebアプリケーションのプロトタイプです。

## 技術スタック

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **UI Components:** Shadcn/UI
- **Backend/Database:** Supabase (PostgreSQL, Auth, RLS)
- **Payment:** Stripe (Standard Checkout)
- **Hosting:** Vercel

## 主要機能

### フェーズ0: 初期セットアップ ✅
- [x] Next.jsプロジェクト構築
- [x] Supabase連携設定
- [x] Shadcn/UI導入
- [x] データベース設計完了
  - profiles, courses, sections, lessons, enrollments テーブル
  - `is_published` (公開/非公開) フラグ
  - `is_selling` (販売する/しない) フラグ
- [x] Row Level Security (RLS) ポリシー設計

### フェーズ1: 認証と講師ダッシュボード (予定)
- [ ] ログイン/サインアップ画面 (Google/Email)
- [ ] 講師用コース管理画面
- [ ] コース作成・編集機能
- [ ] 販売設定トグルスイッチ

### フェーズ2: カリキュラムとコンテンツ (予定)
- [ ] 章とレッスンの編集UI
- [ ] コース詳細ページ (LP)
- [ ] 条件分岐による購入ボタン表示

### フェーズ3: 生徒管理と招待機能 (予定)
- [ ] 手動招待機能 (メールアドレスで権限付与)
- [ ] 学習プレイヤー (動画・テキスト表示)
- [ ] 進捗管理

### フェーズ4: Stripe決済 (予定)
- [ ] Stripe Checkout統合
- [ ] Webhook連携 (自動enrollments追加)

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/nakia73/DevinTest.git
cd DevinTest
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとanon keyを取得

### 4. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、Supabaseの認証情報を設定:

```bash
cp .env.local.example .env.local
```

`.env.local`を編集:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. データベースのセットアップ

Supabaseのダッシュボードで、SQL Editorを開き、以下のマイグレーションファイルを実行:

```bash
supabase/migrations/001_initial_schema.sql
```

このマイグレーションファイルは以下を作成します:
- 全テーブル (profiles, courses, sections, lessons, enrollments, lesson_progress)
- Row Level Security (RLS) ポリシー
- インデックス
- トリガー (自動プロフィール作成、updated_at更新)

### 6. Supabase Authの設定

Supabaseダッシュボード > Authentication > Providers で以下を有効化:
- Email (デフォルトで有効)
- Google OAuth (オプション)

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## データベーススキーマ

詳細なデータベーススキーマは `supabase/schema.md` を参照してください。

### 主要テーブル

#### courses
- `is_published`: コースの公開状態 (true = 生徒から見える)
- `is_selling`: 購入ボタンの表示制御 (true = Stripeボタン表示)

#### enrollments
- `enrollment_type`: 'purchase' (Stripe決済) または 'invitation' (講師による招待)
- ユーザーとコースの組み合わせはユニーク制約

### セキュリティ (RLS)

- **公開情報**: コース概要、レッスンタイトルは誰でも閲覧可能
- **機密情報**: 動画URL、レッスン本文は enrollments テーブルにレコードがあるユーザーのみアクセス可能
- **講師権限**: 自分のコースのみ編集・削除可能

## プロジェクト構造

```
DevinTest/
├── app/                    # Next.js App Router
│   ├── globals.css        # グローバルスタイル (Tailwind CSS)
│   └── ...                # ページとレイアウト (今後追加)
├── components/
│   └── ui/                # Shadcn/UI コンポーネント
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       └── switch.tsx
├── lib/
│   ├── utils.ts           # ユーティリティ関数
│   └── supabase/          # Supabase クライアント
│       ├── client.ts      # ブラウザ用クライアント
│       ├── server.ts      # サーバー用クライアント
│       └── middleware.ts  # ミドルウェア用クライアント
├── supabase/
│   ├── schema.md          # データベーススキーマドキュメント
│   └── migrations/
│       └── 001_initial_schema.sql  # 初期マイグレーション
├── middleware.ts          # Next.js ミドルウェア (認証)
└── .env.local            # 環境変数 (gitignore済み)
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# Lint実行
npm run lint
```

## デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)でアカウント作成
2. GitHubリポジトリを接続
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (Phase 4で) `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - (Phase 4で) `STRIPE_SECRET_KEY`
   - (Phase 4で) `STRIPE_WEBHOOK_SECRET`
4. デプロイ

## ワークフロー例

### 購入フロー (is_selling = true)
1. 生徒がコース詳細ページ (LP) を閲覧
2. 「購入する」ボタンをクリック (is_selling = true の場合のみ表示)
3. Stripe Checkoutにリダイレクト
4. 決済完了後、Webhookが enrollments レコードを作成 (type='purchase')
5. 生徒が学習プレイヤーにアクセス可能に

### 招待フロー (is_selling = false または true)
1. 講師がコース管理画面へ
2. 「受講生を招待」フォームに生徒のメールアドレスを入力
3. システムが enrollments レコードを作成 (type='invitation')
4. 生徒が学習プレイヤーにアクセス可能に (決済不要)

## ライセンス

MIT

## 作成者

AI Sosaku Club (mezamashi.totty@gmail.com)
GitHub: @nakia73

## Devin Session

このプロジェクトは Devin AI によって構築されました。
セッション: https://app.devin.ai/sessions/3f1f66314089474fb70f15ae083d345b
