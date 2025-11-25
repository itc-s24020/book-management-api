import { Router, Request, Response } from 'express';
import { BookService } from '../services/bookService';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const bookService = new BookService();

// 認証ミドルウェア
const authMiddleware = (req: any, res: any, next: any) => authenticateJWT(req, res, next);

// 書籍一覧取得
router.get('/list', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;

        if (page < 1) {
            return res.status(400).json({ message: 'Page must be greater than 0' });
        }

        const result = await bookService.getBookList(page, pageSize);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// 書籍詳細取得
router.get('/detail/:isbn', async (req: Request, res: Response) => {
    try {
        const isbn = BigInt(req.params.isbn);
        const book = await bookService.getBookDetail(isbn);
        res.status(200).json(book);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
});

// 書籍貸出
router.post('/rental', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { bookIsbn } = req.body;

        if (!bookIsbn) {
            return res.status(400).json({ message: 'Book ISBN is required' });
        }

        const rental = await bookService.rentalBook(userId, BigInt(bookIsbn));
        res.status(201).json(rental);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 書籍返却
router.post('/return', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { rentalId } = req.body;

        if (!rentalId) {
            return res.status(400).json({ message: 'Rental ID is required' });
        }

        const result = await bookService.returnBook(rentalId, userId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;