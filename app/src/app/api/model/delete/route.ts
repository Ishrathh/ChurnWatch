'use server'

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';


const prisma = new PrismaClient();
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
    try {
        const { modelId } = await request.json();

        if (!modelId) {
            return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
        }

        // Check if the model exists
        const model = await prisma.modelVersion.findUnique({
            where: { id: modelId }
        });

        if (!model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 });
        }

        // Delete the model file from Flask server
        const flaskResponse = await fetch(`${FLASK_URL}/model/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model_version: model.version })
        });

        if (!flaskResponse.ok) {
            const error = await flaskResponse.json();
            throw new Error(error.error || 'Failed to delete model file');
        }

        // Delete the model from database
        await prisma.modelVersion.delete({
            where: { id: modelId }
        });

        return NextResponse.json({ message: 'Model deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete model:' + error + ' ' + error.stack);
        return NextResponse.json({ error: error.message || 'Failed to delete model' }, { status: 500 });
    }
} 