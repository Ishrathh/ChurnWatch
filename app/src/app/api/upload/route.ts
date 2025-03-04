import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { updateCustomerFeatures } from '@/lib/features';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const results: any[] = [];
    const stream = Readable.fromWeb(file.stream() as any);

    try {
        await new Promise((resolve, reject) => {
            stream
                .pipe(csv.default())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        // Validate CSV columns
        const requiredColumns = ['PERIOD', 'cl_id', 'MCC', 'channel_type', 'currency',
            'TRDATETIME', 'amount', 'trx_category', 'target_sum'];
        if (results.length === 0 || !requiredColumns.every(col => col in results[0])) {
            return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 });
        }

        const customerIds = new Set<number>(results.map(row => parseInt(row.cl_id)));

        // Upsert customers and transactions
        for (const row of results) {
            await prisma.customer.upsert({
                where: { cl_id: parseInt(row.cl_id) },
                create: {
                    cl_id: parseInt(row.cl_id),
                    transactions: {
                        create: {
                            PERIOD: new Date(row.PERIOD),
                            MCC: parseInt(row.MCC),
                            channel_type: row.channel_type,
                            currency: parseInt(row.currency),
                            TRDATETIME: new Date(row.TRDATETIME),
                            amount: parseFloat(row.amount),
                            trx_category: row.trx_category,
                            target_sum: parseFloat(row.target_sum)
                        }
                    }
                },
                update: {
                    transactions: {
                        create: {
                            PERIOD: new Date(row.PERIOD),
                            MCC: parseInt(row.MCC),
                            channel_type: row.channel_type,
                            currency: parseInt(row.currency),
                            TRDATETIME: new Date(row.TRDATETIME),
                            amount: parseFloat(row.amount),
                            trx_category: row.trx_category,
                            target_sum: parseFloat(row.target_sum)
                        }
                    }
                }
            });
        }

        await Promise.all(Array.from(customerIds).map(cl_id => updateCustomerFeatures(cl_id)));

        return NextResponse.json({ message: 'Data uploaded successfully', count: results.length }, { status: 200 });

    } catch (error: any) {
        console.error('Upload error:' + error + error.stack);
        return NextResponse.json(
            { error: 'Failed to process CSV' },
            { status: 500 }
        );
    }
}