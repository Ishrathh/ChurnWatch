import { NextResponse } from 'next/server';
import { clearAuthToken } from '@/lib/auth';

export async function POST() {
    try {
        await clearAuthToken();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        );
    }
}