import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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
        try {
            return await argon2.hash(password);
        } catch (error) {
            console.error('Password hash error:', error);
            throw new Error('Failed to hash password');
        }
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, password);
        } catch (error) {
            console.error('Password verify error:', error);
            return false;
        }
    }

    generateAccessToken(payload: AuthPayload): string {
        return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
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
        // Email validation
        if (!email || !email.includes('@')) {
            throw new Error('Please provide a valid email address');
        }

        // Name validation
        if (!name || name.trim().length === 0) {
            throw new Error('Please provide a name');
        }

        // Password validation
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            throw new Error('This email address is already registered');
        }

        try {
            const hashedPassword = await this.hashPassword(password);
            const userId = uuidv4();

            const user = await prisma.user.create({
                data: {
                    id: userId,
                    email: email.toLowerCase(),
                    name: name.trim(),
                    password: hashedPassword,
                    isAdmin: false
                }
            });

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error('User registration failed');
        }
    }

    async loginUser(email: string, password: string) {
        // Validation
        if (!email || !password) {
            throw new Error('Please provide both email and password');
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user || user.isDeleted) {
                throw new Error('Invalid email or password');
            }

            const isPasswordValid = await this.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            const payload: AuthPayload = {
                userId: user.id,
                email: user.email,
                isAdmin: user.isAdmin
            };

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isAdmin: user.isAdmin
                },
                accessToken: this.generateAccessToken(payload),
                refreshToken: this.generateRefreshToken(payload)
            };
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Login failed');
        }
    }

    async findUserById(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                isAdmin: true,
                createdAt: true
            }
        });
    }
}