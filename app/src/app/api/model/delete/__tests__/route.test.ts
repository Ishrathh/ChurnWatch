// Mock next/server
jest.mock('next/server', () => ({
    NextResponse: {
        json: (data: any, init?: { status?: number }) => ({
            status: init?.status || 200,
            json: () => Promise.resolve(data)
        })
    },
    NextRequest: jest.fn().mockImplementation((url: string, init?: any) => ({
        json: () => Promise.resolve(init?.body ? JSON.parse(init.body) : {})
    }))
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => {
    const mockModelVersion = {
        findUnique: jest.fn(),
        delete: jest.fn()
    };

    return {
        PrismaClient: jest.fn(() => ({
            modelVersion: mockModelVersion,
            $connect: jest.fn(),
            $disconnect: jest.fn()
        }))
    };
});

// Mock fetch
global.fetch = jest.fn();

import { POST } from '../route';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

describe('Model Delete API Route', () => {
    let prisma: any;

    const mockModel = {
        id: '1',
        version: 'test_model',
        path: 'models/test_model.pkl',
        metrics: {},
        trainedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        prisma = new PrismaClient();
    });

    it('should return 400 if modelId is not provided', async () => {
        const request = new NextRequest('http://localhost:3000/api/model/delete', {
            method: 'POST',
            body: JSON.stringify({})
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Model ID is required');
    });

    it('should return 404 if model is not found', async () => {
        prisma.modelVersion.findUnique.mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/model/delete', {
            method: 'POST',
            body: JSON.stringify({ modelId: '1' })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Model not found');
    });

    it('should return 500 if Flask server fails to delete model', async () => {
        prisma.modelVersion.findUnique.mockResolvedValue(mockModel);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: 'Flask server error' }),
        });

        const request = new NextRequest('http://localhost:3000/api/model/delete', {
            method: 'POST',
            body: JSON.stringify({ modelId: '1' })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Flask server error');
    });

    it('should successfully delete a model', async () => {
        prisma.modelVersion.findUnique.mockResolvedValue(mockModel);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: 'Model deleted successfully' }),
        });
        prisma.modelVersion.delete.mockResolvedValue(mockModel);

        const request = new NextRequest('http://localhost:3000/api/model/delete', {
            method: 'POST',
            body: JSON.stringify({ modelId: '1' })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Model deleted successfully');
        expect(prisma.modelVersion.delete).toHaveBeenCalledWith({
            where: { id: '1' },
        });
    });
}); 