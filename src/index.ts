import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import adminRoutes from './routes/adminRoutes';

// Environment variables
import dotenv from 'dotenv';
dotenv.config();

// Prisma Client initialization
const prisma = new PrismaClient();

// Express app initialization
const app = express();
const PORT = process.env.PORT || 3000;

// CORS設定 - 最初に設定する（middlewareより前）
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Type');
    res.header('Access-Control-Max-Age', '86400');

    // OPTIONSプリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Middleware - Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静的ファイル配信
app.use(express.static(path.join(__dirname, '../')));

// Health check route
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Route definitions
app.use('/user', userRoutes);
app.use('/book', bookRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Server startup
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API available at: http://localhost:${PORT}/user/login`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('\n📍 Server shutting down gracefully...');
    server.close(() => {
        console.log('✓ HTTP server closed');
    });

    try {
        await prisma.$disconnect();
        console.log('✓ Prisma disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
});

export default app;