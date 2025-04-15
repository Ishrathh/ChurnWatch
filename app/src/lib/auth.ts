import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name?: string) {
    const hashedPassword = await hashPassword(password);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        // Don't include password in the returned user object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
    }
}

export async function getUserByEmail(email: string) {
    try {
        return await prisma.user.findUnique({
            where: { email }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Simple token generation for demo purposes
export async function generateAuthToken(userId: number): Promise<string> {
    const token = Buffer.from(JSON.stringify({ id: userId, timestamp: Date.now() })).toString('base64');

    // Set the token as a cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });

    return token;
}

export async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value;
}

export async function clearAuthToken() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
}

export async function getCurrentUser() {
    const token = await getAuthToken();

    if (!token) return null;

    try {
        const decodedToken = token ? JSON.parse(Buffer.from(token, 'base64').toString()) : null;

        if (!decodedToken.id) return null;

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id }
        });

        if (!user) return null;

        // Don't include password in the returned user object
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}