import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';

export async function POST() {
    try {
        // Get all transactions from database
        const transactions = await prisma.transaction.findMany();

        // Convert to CSV
        const csvData = [
            ['PERIOD', 'cl_id', 'MCC', 'channel_type', 'currency',
                'TRDATETIME', 'amount', 'trx_category', 'target_sum', 'target_flag'],
            ...transactions.map(t => [
                t.PERIOD.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }),
                t.cl_id,
                t.MCC,
                t.channel_type,
                t.currency,
                t.TRDATETIME.toISOString().split('.')[0], // Remove TZ details
                t.amount,
                t.trx_category,
                t.target_sum,
                t.target_flag === true ? 1 : 0
            ])
        ].map(row => row.join(',')).join('\n');

        // Send to Flask for retraining
        const formData = new FormData();
        formData.append('file', new Blob([csvData]), 'training_data.csv');

        const response = await fetch(`${FLASK_URL}/retrain`, {
            method: 'POST',
            body: formData
        });

        console.log(JSON.stringify(response));

        if (!response.ok) throw new Error('Retraining failed');

        const result = await response.json();
        const { version, model_path, metrics } = result;

        await prisma.modelVersion.create({
            data: {
                version,
                path: model_path,
                metrics
            }
        })

        return NextResponse.json({ message: 'Model trained successfully!', result }, { status: 200 });

    } catch (error: any) {
        console.error('Retraining error:' + error + error.stack);
        return NextResponse.json(
            { error: 'Retraining failed' },
            { status: 500 }
        );
    }
}