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
            return res.status(400).json({ message: 'メール、名前、パスワードは必須です' });
        }

        const user = await authService.registerUser(email, name, password);

        res.status(201).json({
            message: '登録成功しました',
            user
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(400).json({ message: error.message || '登録に失敗しました' });
    }
});

// ユーザーログイン
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'メールアドレスとパスワードは必須です' });
        }

        const result = await authService.loginUser(email, password);

        res.status(200).json({
            message: 'ログイン成功',
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
        console.error('Login error:', error);
        res.status(401).json({ message: error.message || 'ログインに失敗しました' });
    }
});

// トークンリフレッシュ
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh tokenが必須です' });
        }

        const payload = authService.verifyRefreshToken(refreshToken);
        if (!payload) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = await authService.findUserById(payload.userId);
        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        const accessToken = authService.generateAccessToken({
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        });

        res.status(200).json({ accessToken });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: error.message || 'トークンリフレッシュに失敗しました' });
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
        console.error('Rental history error:', error);
        res.status(500).json({ message: error.message || '履歴取得に失敗しました' });
    }
});

// ユーザー名変更
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: '名前は必須です' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() },
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true
            }
        });

        res.status(200).json({
            message: 'プロフィール更新完了',
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: error.message || 'プロフィール更新に失敗しました' });
    }
});

export default router;