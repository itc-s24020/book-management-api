# 📚 書籍管理 API (book-management-api)

## ⚙️ 技術スタックとバージョン情報

| 項目 | 詳細 |
| :--- | :--- |
| **言語** | **TypeScript** |
| **Webフレームワーク** | **Express** (v5.1.0) |
| **ORM/データベースアクセス** | **Prisma** (v6.19.0) |
| **データベース** | **MariaDB** |
| **認証方式** | **JWT** |
| **パスワードハッシュ** | **argon2** |

---
book-management-api/
├── prisma/
│   ├── schema.prisma       # Prismaスキーマ定義
│   ├── seed.ts             # 初期データ投入スクリプト
│   ├── author.csv          # 著者データ
│   ├── publisher.csv       # 出版社データ
│   └── book.csv            # 書籍データ
├── src/
│   ├── middleware/
│   │   └── authMiddleware.ts    # JWT認証ミドルウェア
│   ├── routes/
│   │   ├── userRoutes.ts        # ユーザー関連ルート
│   │   ├── bookRoutes.ts        # 書籍関連ルート
│   │   ├── adminRoutes.ts       # 管理者関連ルート
│   │   └── searchRoutes.ts      # 検索関連ルート
│   ├── services/
│   │   ├── authService.ts       # 認証サービス
│   │   ├── bookService.ts       # 書籍サービス
│   │   └── adminService.ts      # 管理者サービス
│   ├── prismaClient.ts          # Prismaクライアント
│   └── index.ts                 # アプリケーションエントリーポイント
├── .env                         # 環境変数(Git管理外)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

## 🔑 テストアカウント情報

シードデータ (`prisma/seed.ts`) 実行後、以下のテストアカウントが利用可能です。

| 種別 | メールアドレス | パスワード |
| :--- | :--- | :--- |
| **管理者** | `admin@example.com` | `admin123` |
| **一般ユーザー1** | `user1@example.com` | `user123` |
| **一般ユーザー2** | `user2@example.com` | `user123` |

---

## 🧪 テスト方法

### ⚠️ 注意点

* **`curl`コマンド**を使用すると一部のエンドポイントでエラーが発生する可能があります。

### 💻 推奨ツール

**`test_HTML.html`** ファイルをブラウザで開いて使用してください。

#### テスト可能な主要機能 (GUI)

1.  **ユーザー登録**
2.  **ログイン** (クイックログインボタン付き)
3.  **著者・出版社検索**
4.  **書籍一覧取得**
