import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const authService = new AuthService();
const prisma = new PrismaClient();

// Authentication middleware wrapper
const authMiddleware = (req: any, res: any, next: any) => authenticateJWT(req, res, next);

// ===== USER REGISTRATION =====
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({
                message: 'Email, name, and password are required'
            });
        }

        const user = await authService.registerUser(email, name, password);

        res.status(201).json({
            message: 'User registered successfully',
            user
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(400).json({
            message: error.message || 'Registration failed'
        });
    }
});

// ===== USER LOGIN =====
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const result = await authService.loginUser(email, password);

        res.status(200).json({
            message: 'Login successful',
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
        res.status(401).json({
            message: error.message || 'Login failed'
        });
    }
});

// ===== TOKEN REFRESH =====
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                message: 'Refresh token is required'
            });
        }

        const payload = authService.verifyRefreshToken(refreshToken);
        if (!payload) {
            return res.status(401).json({
                message: 'Invalid refresh token'
            });
        }

        const user = await authService.findUserById(payload.userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const accessToken = authService.generateAccessToken({
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        });

        res.status(200).json({ accessToken });
    } catch (error: any) {
        console.error('Refresh error:', error);
        res.status(500).json({
            message: error.message || 'Token refresh failed'
        });
    }
});

// ===== GET USER RENTAL HISTORY (Protected) =====
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
        res.status(500).json({
            message: error.message || 'Failed to retrieve rental history'
        });
    }
});

// ===== UPDATE USER PROFILE (Protected) =====
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                message: 'Name is required'
            });
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
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        res.status(500).json({
            message: error.message || 'Profile update failed'
        });
    }
});

export default router;