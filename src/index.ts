import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import adminRoutes from './routes/adminRoutes';
import dotenv from 'dotenv';

dotenv.config();

console.log('📋 Environment Check:');
console.log('PORT:', process.env.PORT || 3000);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');

// Prisma Client initialization
let prisma: PrismaClient;
try {
    prisma = new PrismaClient();
    console.log('✓ Prisma client initialized');
} catch (error) {
    console.error('✗ Prisma initialization error:', error);
    process.exit(1);
}

// Express app initialization
const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Content-Type');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`\n📨 ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Health check API
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Root API endpoint - API info
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'Book Management API',
        version: '1.0.0',
        description: 'REST API for book management system',
        endpoints: {
            health: '/api/health',
            user: {
                register: 'POST /user/register',
                login: 'POST /user/login',
                refresh: 'POST /user/refresh',
                profile: 'PUT /user/profile',
                history: 'GET /user/rental-history'
            },
            book: {
                list: 'GET /book/list?page=1&pageSize=10',
                detail: 'GET /book/detail/:isbn',
                rental: 'POST /book/rental',
                return: 'POST /book/return'
            },
            admin: {
                author: 'POST/PUT/DELETE /admin/author',
                publisher: 'POST/PUT/DELETE /admin/publisher',
                book: 'POST/PUT/DELETE /admin/book'
            }
        }
    });
});

// API routes
app.use('/user', userRoutes);
app.use('/book', bookRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Error:', {
        message: err.message,
        stack: err.stack,
        url: req.path,
        method: req.method
    });

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Server startup
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n📚 API Endpoints:');
    console.log('  User: POST /user/register, /user/login, /user/refresh');
    console.log('  Book: GET /book/list, /book/detail/:isbn');
    console.log('  Book: POST /book/rental, /book/return');
    console.log('  Admin: POST/PUT/DELETE /admin/author, /admin/publisher, /admin/book\n');
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

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
});

export default app;