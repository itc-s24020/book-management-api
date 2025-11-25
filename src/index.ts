// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// 環境変数の読み込み（Node.js環境では通常自動で読み込まれますが、明示的にインポートする場合もあります）
// import 'dotenv/config';

// Prisma Client のインスタンスを作成
const prisma = new PrismaClient();

// Express アプリケーションの初期化
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // JSON形式のボディを解析

// --- ルーティングの定義（簡略版、本来は src/routes に分割） ---

// ヘルスチェック用ルート
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'Book Management API', version: '1.0.0' });
});

// ユーザー登録（認証なし）
// 本来は src/controllers/userController.ts に実装
app.post('/user/register', async (req: Request, res: Response) => {
    // ダミー実装: 実際のパスワードハッシュ化とDB挿入ロジックが必要
    const { email, name, password } = req.body;
    console.log(`User registration attempt for: ${email}`);

    // 例: ここにPrismaを使ったユーザー作成ロジックが入ります
    // await prisma.user.create({...});

    res.status(201).json({}); // 成功時は空のレスポンスを返すことが多い
});

// 書籍一覧取得（認証なし）
// 本来は src/routes/bookRoutes.ts と src/controllers/bookController.ts に実装
app.get('/book/list{/:page}', async (req: Request, res: Response) => {
    const page = parseInt(req.params.page || '1');
    const limit = 10;

    try {
        const totalCount = await prisma.book.count({ where: { isDeleted: false } });
        const books = await prisma.book.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: { isDeleted: false },
            select: {
                isbn: true,
                title: true,
                publicationYear: true,
                publicationMonth: true,
                author: { select: { name: true } }
            }
        });

        const lastPage = Math.ceil(totalCount / limit);

        res.status(200).json({
            current: page,
            last_page: lastPage,
            books: books.map(book => ({
                isbn: String(book.isbn), // BigIntを文字列に変換
                title: book.title,
                author: book.author,
                publication_year_month: `${book.publicationYear}-${String(book.publicationMonth).padStart(2, '0')}`
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred fetching books." });
    }
});

// --- エラーハンドリングミドルウェア ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// サーバー起動
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// データベース接続の切断処理
process.on('SIGINT', async () => {
    console.log('Server shutting down...');
    server.close(() => {
        prisma.$disconnect();
        console.log('Prisma disconnected. Server closed.');
        process.exit(0);
    });
});