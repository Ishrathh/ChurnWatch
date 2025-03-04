import { PrismaClient, Transaction } from '@prisma/client';
import { maxBy } from 'lodash';

const prisma = new PrismaClient();

export async function updateCustomerFeatures(cl_id: number) {
    // Get all transactions for the customer
    const transactions = await prisma.transaction.findMany({
        where: { cl_id },
        orderBy: { TRDATETIME: 'desc' }
    });

    const df = transactions.map(t => ({
        id: t.id,
        PERIOD: t.PERIOD,
        cl_id: t.cl_id,
        MCC: t.MCC,
        channel_type: t.channel_type,
        currency: t.currency,
        TRDATETIME: t.TRDATETIME,
        amount: t.amount,
        trx_category: t.trx_category,
        target_sum: t.target_sum,
        createdAt: t.createdAt,
    }));

    df.sort((a, b) => new Date(b.TRDATETIME).getTime() - new Date(a.TRDATETIME).getTime());

    const lastTransactionDate = maxBy(df, (t: Transaction) => t.TRDATETIME)?.TRDATETIME;
    const features = {
        transaction_freq: df.length,
        avg_transaction_amount: df.reduce((sum, t) => sum + t.amount, 0) / df.length,
        time_since_last_transaction: lastTransactionDate
            ? Math.floor((new Date().getTime() - new Date(lastTransactionDate).getTime()) / (1000 * 3600 * 24))
            : 0,
        mcc_diversity: new Set(df.map(t => t.MCC)).size,
        preferred_channel: mode(df.map(t => t.channel_type)),
        mean_hour: df.reduce((sum, t) => sum + new Date(t.TRDATETIME).getHours(), 0) / df.length,
        std_hour: std(df.map(t => new Date(t.TRDATETIME).getHours())),
        mean_day_of_week: df.reduce((sum, t) => sum + new Date(t.TRDATETIME).getDay(), 0) / df.length,
        std_day_of_week: std(df.map(t => new Date(t.TRDATETIME).getDay())),
        mean_month: df.reduce((sum, t) => sum + new Date(t.TRDATETIME).getMonth(), 0) / df.length,
        std_month: std(df.map(t => new Date(t.TRDATETIME).getMonth()))
    };

    // Update customer record
    await prisma.customer.update({
        where: { cl_id },
        data: features
    });
}

function mode(arr: any[]) {
    return arr.sort((a, b) =>
        arr.filter(v => v === a).length -
        arr.filter(v => v === b).length
    ).pop();
}
function std(values: number[]): number {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
}