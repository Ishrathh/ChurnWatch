import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401 }
            );
        }

        return NextResponse.json({
            authenticated: true,
            user
        });
    } catch (error) {
        console.error('User fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to get user' },
            { status: 500 }
        );
    }
}