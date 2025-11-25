import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const authService = new AuthService();
const prisma = new PrismaClient();

// 認証ミドルウェア
const authMiddleware = (req: any, res: any, next: any) => authenticateJWT(req, res, next);

// ユーザー登録
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ message: 'Email, name, and password are required' });
        }

        await authService.registerUser(email, name, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// ユーザーログイン
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await authService.loginUser(email, password);
        res.status(200).json({
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                isAdmin: result.user.isAdmin
            },
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
});

// ユーザー借り出し記録取得
router.get('/rental-history', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const rentalLogs = await prisma.rentalLog.findMany({
            where: { userId },
            include: { book: true },
            orderBy: { checkoutDate: 'desc' }
        });

        res.status(200).json({
            history: rentalLogs.map(log => ({
                id: log.id,
                book: {
                    isbn: String(log.book.isbn),
                    title: log.book.title
                },
                checkoutDate: log.checkoutDate,
                dueDate: log.dueDate,
                returnedDate: log.returnedDate
            }))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ユーザー名変更
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name is required' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { name }
        });

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;