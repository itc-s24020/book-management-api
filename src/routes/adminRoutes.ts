import { Router, Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { authenticateJWT, authorizeAdmin } from '../middleware/authMiddleware';

const router = Router();
const adminService = new AdminService();

// 中間件：認証と管理者権限確認
router.use((req: any, res: any, next: any) => authenticateJWT(req, res, next));
router.use((req: any, res: any, next: any) => authorizeAdmin(req, res, next));

// --- 著者管理 ---

// 著者登録
router.post('/author', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Author name is required' });
        }

        const author = await adminService.createAuthor(name);
        res.status(201).json(author);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 著者更新
router.put('/author/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Author name is required' });
        }

        const author = await adminService.updateAuthor(id, name);
        res.status(200).json(author);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 著者削除
router.delete('/author/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await adminService.deleteAuthor(id);
        res.status(200).json({ message: 'Author deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 著者名検索
router.get('/author/search', async (req: Request, res: Response) => {
    try {
        const keyword = req.query.keyword as string;

        if (!keyword) {
            return res.status(400).json({ message: 'Keyword is required' });
        }

        const result = await adminService.searchAuthor(keyword);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- 出版社管理 ---

// 出版社登録
router.post('/publisher', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Publisher name is required' });
        }

        const publisher = await adminService.createPublisher(name);
        res.status(201).json(publisher);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 出版社更新
router.put('/publisher/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Publisher name is required' });
        }

        const publisher = await adminService.updatePublisher(id, name);
        res.status(200).json(publisher);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 出版社削除
router.delete('/publisher/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await adminService.deletePublisher(id);
        res.status(200).json({ message: 'Publisher deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 出版社名検索
router.get('/publisher/search', async (req: Request, res: Response) => {
    try {
        const keyword = req.query.keyword as string;

        if (!keyword) {
            return res.status(400).json({ message: 'Keyword is required' });
        }

        const result = await adminService.searchPublisher(keyword);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- 書籍管理 ---

// 書籍登録
router.post('/book', async (req: Request, res: Response) => {
    try {
        const { isbn, title, authorId, publisherId, publicationYear, publicationMonth } = req.body;

        if (!isbn || !title || !authorId || !publisherId || !publicationYear || !publicationMonth) {
            return res.status(400).json({ message: 'All book fields are required' });
        }

        await adminService.createBook(
            BigInt(isbn),
            title,
            authorId,
            publisherId,
            publicationYear,
            publicationMonth
        );

        res.status(201).json({ message: 'Book registered successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 書籍更新
router.put('/book/:isbn', async (req: Request, res: Response) => {
    try {
        const isbn = BigInt(req.params.isbn);
        const { title, authorId, publisherId, publicationYear, publicationMonth } = req.body;

        if (!title || !authorId || !publisherId || !publicationYear || !publicationMonth) {
            return res.status(400).json({ message: 'All book fields are required' });
        }

        await adminService.updateBook(
            isbn,
            title,
            authorId,
            publisherId,
            publicationYear,
            publicationMonth
        );

        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// 書籍削除
router.delete('/book/:isbn', async (req: Request, res: Response) => {
    try {
        const isbn = BigInt(req.params.isbn);
        await adminService.deleteBook(isbn);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;