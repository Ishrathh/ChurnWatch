'use server'

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const models = await prisma.modelVersion.findMany();
        return NextResponse.json({ models })
    } catch (error: any) {
        console.error('Failed to fetch customers:' + error + ' ' + error.stack);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}