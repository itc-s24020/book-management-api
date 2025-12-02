import { Router, Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { authenticateJWT, authorizeAdmin } from '../middleware/authMiddleware';

const router = Router();
const adminService = new AdminService();

// 中間件：認証と管理者権限確認
router.use((req: any, res: any, next: any) => authenticateJWT(req, res, next));
router.use((req: any, res: any, next: any) => authorizeAdmin(req, res, next));

// --- 著者管理 ---

// 著者登録 (仕様書: POST /admin/author)
router.post('/author', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: '著者名は必須です' });
        }

        const author = await adminService.createAuthor(name);
        res.status(200).json(author);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 著者更新 (仕様書: PUT /admin/author)
router.put('/author', async (req: Request, res: Response) => {
    try {
        const { id, name } = req.body;

        if (!id || !name) {
            return res.status(400).json({ message: '著者IDと名前は必須です' });
        }

        const author = await adminService.updateAuthor(id, name);
        res.status(200).json(author);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 著者削除 (仕様書: DELETE /admin/author)
router.delete('/author', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: '著者IDは必須です' });
        }

        await adminService.deleteAuthor(id);
        res.status(200).json({ message: '削除しました' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// --- 出版社管理 ---

// 出版社登録 (仕様書: POST /admin/publisher)
router.post('/publisher', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: '出版社名は必須です' });
        }

        const publisher = await adminService.createPublisher(name);
        res.status(200).json(publisher);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 出版社更新 (仕様書: PUT /admin/publisher)
router.put('/publisher', async (req: Request, res: Response) => {
    try {
        const { id, name } = req.body;

        if (!id || !name) {
            return res.status(400).json({ message: '出版社IDと名前は必須です' });
        }

        const publisher = await adminService.updatePublisher(id, name);
        res.status(200).json(publisher);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 出版社削除 (仕様書: DELETE /admin/publisher)
router.delete('/publisher', async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: '出版社IDは必須です' });
        }

        await adminService.deletePublisher(id);
        res.status(200).json({ message: '削除しました' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// --- 書籍管理 ---

// 書籍登録 (仕様書: POST /admin/book)
router.post('/book', async (req: Request, res: Response) => {
    try {
        const { isbn, title, author_id, publisher_id, publication_year, publication_month } = req.body;

        if (!isbn || !title || !author_id || !publisher_id || !publication_year || !publication_month) {
            return res.status(400).json({ message: 'すべての項目は必須です' });
        }

        await adminService.createBook(
            BigInt(isbn),
            title,
            author_id,
            publisher_id,
            publication_year,
            publication_month
        );

        res.status(200).json({ message: '登録しました' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 書籍更新 (仕様書: PUT /admin/book)
router.put('/book', async (req: Request, res: Response) => {
    try {
        const { isbn, title, author_id, publisher_id, publication_year, publication_month } = req.body;

        if (!isbn || !title || !author_id || !publisher_id || !publication_year || !publication_month) {
            return res.status(400).json({ message: 'すべての項目は必須です' });
        }

        await adminService.updateBook(
            BigInt(isbn),
            title,
            author_id,
            publisher_id,
            publication_year,
            publication_month
        );

        res.status(200).json({ message: '登録しました' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 書籍削除 (仕様書: DELETE /admin/book)
router.delete('/book', async (req: Request, res: Response) => {
    try {
        const { isbn } = req.body;

        if (!isbn) {
            return res.status(400).json({ message: 'ISBNは必須です' });
        }

        await adminService.deleteBook(BigInt(isbn));
        res.status(200).json({ message: '削除しました' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;