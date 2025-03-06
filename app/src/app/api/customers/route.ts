'use server'
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const customers = await prisma.customer.findMany();
        return NextResponse.json({ customers })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to fetch customers:', errorMessage);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { cl_id, churn } = await req.json();

        if (churn === true) {
            await prisma.customer.update({
                where: { cl_id },
                data: {
                    churn_probability: 1,
                    last_predicted: new Date()
                }
            })
            await prisma.transaction.updateMany({
                where: { cl_id },
                data: {
                    target_flag: true
                }
            })
        } else {
            await prisma.customer.update({
                where: { cl_id },
                data: {
                    churn_probability: null,
                    last_predicted: null
                }
            })
            await prisma.transaction.updateMany({
                where: { cl_id },
                data: {
                    target_flag: false
                }
            })
        }

        revalidatePath('/');
        return NextResponse.json({
            message: `Customer ${churn ? 'churned' : 'unchurned'} successfully`
        }, {
            status: 200
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to churn customer:', errorMessage);
        return NextResponse.json({ error: 'Failed to churn customer' }, { status: 500 });
    }
}