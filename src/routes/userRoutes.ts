import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { prisma } from '../prismaClient';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const authService = new AuthService();

// Authentication middleware wrapper
const authMiddleware = (req: any, res: any, next: any) => authenticateJWT(req, res, next);

// ===== USER REGISTRATION =====
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        console.log('📝 Registration attempt:', { email, name });

        if (!email || !name || !password) {
            return res.status(400).json({
                reason: 'メールアドレス、名前、パスワードは必須です'
            });
        }

        await authService.registerUser(email, name, password);

        // ✅ 修正: 仕様書では何も返さないが、HTMLツールのために最低限のJSONを返す
        res.status(200).json({
            message: '登録が完了しました'
        });
    } catch (error: any) {
        console.error('❌ Register error:', error);
        res.status(400).json({
            reason: error.message || '登録に失敗しました'
        });
    }
});

// ===== USER LOGIN =====
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        console.log('📨 Login attempt:', { email });

        if (!email || !password) {
            return res.status(401).json({
                message: 'メールアドレスとパスワードは必須です'
            });
        }

        const result = await authService.loginUser(email, password);

        console.log('✅ Login successful:', email);

        // 仕様書通り: JWTの場合は access_token と refresh_token を返す
        res.status(200).json({
            access_token: result.accessToken,
            refresh_token: result.refreshToken
        });
    } catch (error: any) {
        console.error('❌ Login error:', error);
        res.status(401).json({
            message: error.message || 'ログインに失敗しました'
        });
    }
});

// ===== RENTAL HISTORY (仕様書: GET /user/history) =====
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        console.log('📚 Fetching rental history for user:', userId);

        const rentalLogs = await prisma.rentalLog.findMany({
            where: { userId },
            include: { book: true },
            orderBy: { checkoutDate: 'desc' }
        });

        res.status(200).json({
            history: rentalLogs.map(log => ({
                id: log.id,
                book: {
                    isbn: Number(log.book.isbn),
                    name: log.book.title
                },
                checkout_date: log.checkoutDate,
                due_date: log.dueDate,
                returned_date: log.returnedDate
            }))
        });
    } catch (error: any) {
        console.error('❌ Rental history error:', error);
        res.status(500).json({
            message: error.message || '貸出履歴の取得に失敗しました'
        });
    }
});

// ===== UPDATE USER NAME (仕様書: PUT /user/change) =====
router.put('/change', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { name } = req.body;

        console.log('✏️ Updating user name:', { userId, name });

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                reason: '名前は必須です'
            });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() }
        });

        console.log('✅ User name updated successfully');

        res.status(200).json({
            message: '更新しました'
        });
    } catch (error: any) {
        console.error('❌ Profile update error:', error);
        res.status(400).json({
            reason: error.message || '更新に失敗しました'
        });
    }
});

export default router;