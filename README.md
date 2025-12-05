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

## 📂 プロジェクトのファイル構成

### `book-management-api/`

| ファイル/ディレクトリ | 役割 |
| :--- | :--- |
| `.env` | **環境変数**（DB接続情報、JWT Secretなど。Git管理外） |
| `.gitignore` | Git管理対象外ファイル定義 |
| `package.json` | 依存関係、実行スクリプト定義 |
| `tsconfig.json` | TypeScriptコンパイラ設定 |
| `README.md` | プロジェクト概要、ドキュメント |

### 📁 `prisma/` ディレクトリ

| ファイル | 役割 |
| :--- | :--- |
| `schema.prisma` | **Prismaスキーマ定義** (データベースモデル) |
| `seed.ts` | **初期データ投入スクリプト** |
| `author.csv` | 著者データのシードデータ |
| `publisher.csv` | 出版社データのシードデータ |
| `book.csv` | 書籍データのシードデータ |

### 📁 `src/` ディレクトリ (主要ロジック)

| ファイル/ディレクトリ | 役割 |
| :--- | :--- |
| `index.ts` | **アプリケーションエントリーポイント** (Expressサーバー起動) |
| `prismaClient.ts` | Prismaクライアントのシングルトンインスタンス |
| `middleware/authMiddleware.ts` | **JWT認証ミドルウェア** |
| `routes/userRoutes.ts` | ユーザー登録、ログインなどの**ユーザー関連ルート** |
| `routes/bookRoutes.ts` | 書籍のCRUD操作などの**書籍関連ルート** |
| `routes/adminRoutes.ts` | 管理者専用機能の**管理者関連ルート** |
| `routes/searchRoutes.ts` | 著者・出版社・書籍検索の**検索関連ルート** |
| `services/authService.ts` | 認証、トークン生成などの**認証サービス** |
| `services/bookService.ts` | 書籍データ操作などの**書籍サービス** |
| `services/adminService.ts` | 管理者機能の**管理者サービス** |

---

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
