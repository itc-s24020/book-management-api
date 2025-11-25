import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface AuthPayload {
    userId: string;
    email: string;
    isAdmin: boolean;
}

export class AuthService {
    private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    private jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

    async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password);
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await argon2.verify(hash, password);
    }

    generateAccessToken(payload: AuthPayload): string {
        return jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
    }

    generateRefreshToken(payload: AuthPayload): string {
        return jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: '7d' });
    }

    verifyAccessToken(token: string): AuthPayload | null {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as AuthPayload;
            return decoded;
        } catch {
            return null;
        }
    }

    verifyRefreshToken(token: string): AuthPayload | null {
        try {
            const decoded = jwt.verify(token, this.jwtRefreshSecret) as AuthPayload;
            return decoded;
        } catch {
            return null;
        }
    }

    async registerUser(email: string, name: string, password: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('メールアドレスが既に登録されています');
        }

        const hashedPassword = await this.hashPassword(password);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword }
        });

        return user;
    }

    async loginUser(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        const isPasswordValid = await this.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        const payload: AuthPayload = {
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        };

        return {
            user,
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload)
        };
    }

    async findUserById(userId: string) {
        return await prisma.user.findUnique({ where: { id: userId } });
    }
}