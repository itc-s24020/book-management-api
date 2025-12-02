import { Router, Request, Response } from 'express';
import { BookService } from '../services/bookService';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const bookService = new BookService();

// 認証ミドルウェア
const authMiddleware = (req: any, res: any, next: any) => authenticateJWT(req, res, next);

// ===== 書籍一覧取得 (GET /book/list?page=1) =====
router.get('/list', async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1') || 1;
        const pageSize = 5; // 1ページあたり5件

        if (page < 1) {
            return res.status(400).json({ message: 'ページ番号は1以上である必要があります' });
        }

        const result = await bookService.getBookList(page, pageSize);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ===== 書籍詳細取得 (GET /book/detail/:isbn) =====
router.get('/detail/:isbn', async (req: Request, res: Response) => {
    try {
        const isbn = BigInt(req.params.isbn);
        const book = await bookService.getBookDetail(isbn);
        res.status(200).json(book);
    } catch (error: any) {
        res.status(404).json({ message: '書籍が見つかりません' });
    }
});

// ===== 書籍貸出 (POST /book/rental) =====
router.post('/rental', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { book_id } = req.body;

        if (!book_id) {
            return res.status(400).json({ message: '書籍IDは必須です' });
        }

        const rental = await bookService.rentalBook(userId, BigInt(book_id));
        res.status(200).json(rental);
    } catch (error: any) {
        if (error.message === '書籍が存在しません') {
            return res.status(404).json({ message: '書籍が存在しません' });
        }
        if (error.message === '既に貸出中です') {
            return res.status(409).json({ message: '既に貸出中です' });
        }
        res.status(400).json({ message: error.message });
    }
});

// ===== 書籍返却 (PUT /book/return) =====
router.put('/return', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: '貸出IDは必須です' });
        }

        const result = await bookService.returnBook(id, userId);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === '存在しない貸出記録です') {
            return res.status(404).json({ message: '存在しない貸出記録です' });
        }
        if (error.message === '他のユーザの貸出書籍です') {
            return res.status(403).json({ message: '他のユーザの貸出書籍です' });
        }
        res.status(400).json({ message: error.message });
    }
});

export default router;
