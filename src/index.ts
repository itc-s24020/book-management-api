import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import adminRoutes from './routes/adminRoutes';
import searchRoutes from './routes/searchRoutes';
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

// ===== BODY PARSER MIDDLEWARE (必ず最初に来るべき) =====
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===== CORS MIDDLEWARE =====
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

// ===== REQUEST LOGGING MIDDLEWARE =====
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`\n📨 ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// ===== HEALTH CHECK API =====
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

// ===== ROOT API ENDPOINT =====
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
                history: 'GET /user/history',
                change: 'PUT /user/change'
            },
            book: {
                list: 'GET /book/list/:page',
                detail: 'GET /book/detail/:isbn',
                rental: 'POST /book/rental',
                return: 'PUT /book/return'
            },
            admin: {
                author: 'POST/PUT/DELETE /admin/author',
                publisher: 'POST/PUT/DELETE /admin/publisher',
                book: 'POST/PUT/DELETE /admin/book'
            },
            search: {
                author: 'GET /search/author',
                publisher: 'GET /search/publisher'
            }
        }
    });
});

// ===== API ROUTES (ここでルート登録) =====
app.use('/user', userRoutes);
app.use('/book', bookRoutes);
app.use('/admin', adminRoutes);
app.use('/search', searchRoutes);

// ===== 404 HANDLER =====
app.use((req: Request, res: Response) => {
    console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ message: 'Route not found' });
});

// ===== GLOBAL ERROR HANDLER =====
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

// ===== SERVER STARTUP =====
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n📚 API Endpoints:');
    console.log('  User: POST /user/register, /user/login');
    console.log('  User: GET /user/history, PUT /user/change');
    console.log('  Book: GET /book/list/:page, /book/detail/:isbn');
    console.log('  Book: POST /book/rental, PUT /book/return');
    console.log('  Admin: POST/PUT/DELETE /admin/author, /admin/publisher, /admin/book');
    console.log('  Search: GET /search/author, /search/publisher\n');
});

// ===== GRACEFUL SHUTDOWN =====
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