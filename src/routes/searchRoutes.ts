import { Router, Request, Response } from 'express';
import { AdminService } from '../services/adminService';

const router = Router();
const adminService = new AdminService();

// 著者名検索 (仕様書: GET /search/author)
// ✅ 修正: req.body → req.query に変更
router.get('/author', async (req: Request, res: Response) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({ message: '検索キーワードは必須です' });
        }

        const result = await adminService.searchAuthor(keyword as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// 出版社名検索 (仕様書: GET /search/publisher)
// ✅ 修正: req.body → req.query に変更
router.get('/publisher', async (req: Request, res: Response) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({ message: '検索キーワードは必須です' });
        }

        const result = await adminService.searchPublisher(keyword as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;