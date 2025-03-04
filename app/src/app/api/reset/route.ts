'use server'
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST() {
    try {
        await prisma.transaction.deleteMany();
        await prisma.customer.deleteMany();
        await prisma.modelVersion.deleteMany();

        return NextResponse.json({ message: 'Data reset successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error resetting data: ' + error);
        return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
    }
}