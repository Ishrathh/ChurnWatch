import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const { cl_id, model_version } = await request.json();

    const customer = await prisma.customer.findUnique({
      where: { cl_id },
      include: { transactions: true }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const model = await prisma.modelVersion.findUnique({
      where: { version: model_version }
    });

    const response = await fetch(`${FLASK_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...customer,
        preferred_channel_encoded: customer?.preferred_channel,
        model_version: model?.version || 0
      })
    });

    if (!response.ok) throw new Error('Prediction failed');

    const prediction = await response.json();

    await prisma.customer.update({
      where: { cl_id },
      data: {
        churn_probability: prediction.churn_probability,
        last_predicted: new Date()
      }
    });

    return NextResponse.json(prediction);

  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    );
  }
}