'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Customer } from '@prisma/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Dashboard() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [models, setModels] = useState<ModelVersion[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('default');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRetraining, setIsRetraining] = useState(false);

    const fetchCustomers = async () => {
        const res = await fetch('/api/customers', { method: 'GET' });
        const data = await res.json();
        setCustomers(data.customers);
    };

    const fetchModels = async () => {
        const res = await fetch('/api/model', { method: 'GET' });
        const data = await res.json();
        setModels(data.models);
    }

    useEffect(() => { fetchCustomers(); fetchModels(); }, []);

    const handlePredict = async (customerId: number) => {
        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                body: JSON.stringify({ cl_id: customerId, model_version: selectedModel }),
            });

            if (!response.ok) throw new Error('Failed to predict churn');
            await fetchCustomers();
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during prediction: ' + error);
                toast.error(error.message);
            } else {
                console.error('An unknown error occurred');
                toast.error('An unknown error occurred');
            }
        }
    };

    const handleReset = async () => {
        try {
            const response = await fetch('/api/reset', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to reset data');
            const data = await response.json();
            fetchCustomers();
            toast.success(data.message);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during reset: ' + error);
                toast.error(error.message);
            } else {
                console.error('An unknown error occurred');
                toast.error('An unknown error occurred');
            }
        }
    }

    const handleChurn = async (cl_id: number, churn: boolean) => {
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                body: JSON.stringify({ cl_id, churn })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            toast.success(data.message);
            fetchCustomers();
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during customer churn:', error);
                toast.error(error.message);
            } else {
                console.error('An unknown error occurred');
                toast.error('An unknown error occurred');
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message);
            setFile(null);
            fetchCustomers();
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error uploading file:', error);
                toast.error(error.message);
            } else {
                console.error('An unknown error occurred');
                toast.error('An unknown error occurred');
            }
        }
    };

    const handleRetrain = async () => {

        setIsRetraining(true);
        new Promise((resolve, reject) => {
            toast.promise(
                fetch('/api/retrain', { method: 'POST' })
                    .then(async (res) => {
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        return data;
                    }),
                {
                    loading: 'Model retraining in progress...',
                    success: (data) => {
                        fetchCustomers();
                        fetchModels();
                        return data.message;
                    },
                    error: (error) => error.message || 'Failed to retrain model',
                }
            );
            setIsRetraining(false);
        });
    };

    const handleDeleteModel = async (modelId: string) => {
        if (selectedModel === 'default') {
            toast.error('Cannot delete the default model');
            return;
        }

        setIsDeleting(true);

        new Promise((resolve, reject) => {
            toast.promise(
                fetch('/api/model/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ modelId }),
                }).then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);
                    return data;
                }),
                {
                    loading: 'Deleting model...',
                    success: (data) => {
                        setSelectedModel('default');
                        fetchModels();
                        return data.message;
                    },
                    error: (error) => error.message || 'Failed to delete model',
                }
            );
            setIsDeleting(false);
        });
    };

    interface ExtendedMetrics {
        accuracy: number;
        precision: number;
        recall: number;
        f1: number;
    }

    interface ModelVersion {
        id: string;
        path: string;
        version: string;
        trainedAt: Date;
        metrics: ExtendedMetrics;
    }

    const selModel: ModelVersion[] = models.filter((model) => model.version === selectedModel);
    const currentModel = selModel.length > 0 ? selModel[0] : null;

    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Dataset Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="max-w-sm"
                            />
                            <Button disabled={!file} onClick={handleUpload}>Upload CSV</Button>
                            <Button variant="destructive" onClick={handleReset}>Reset All Data</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Model Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Current Model: {selModel.length > 0 ? selModel[0].version : 'Default'}</p>
                            <p className="text-sm text-gray-600">Trained: {selModel.length > 0 ? new Date(selModel[0].trainedAt).toLocaleDateString() : 'At launch'}</p>
                            <p className="text-sm text-gray-600">
                                Accuracy: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.accuracy * 100).toFixed(2) + '%' : '72.50%'}
                            </p>
                            <p className="text-sm text-gray-600">
                                Precision: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.precision * 100).toFixed(2) + '%' : '77.20%'}
                            </p>
                            <p className="text-sm text-gray-600">
                                Recall: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.recall * 100).toFixed(2) + '%' : '73.36%'}
                            </p>
                            <p className="text-sm text-gray-600">
                                F1 Score: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.f1 * 100).toFixed(2) + '%' : '75.23%'}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    {models.map((model) => (
                                        <SelectItem value={model.version} key={model.id}>{model.version}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleRetrain} disabled={isRetraining}>Retrain Model</Button>

                            {selectedModel !== 'default' && currentModel && (
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteModel(currentModel.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Model'}
                                </Button>
                            )}

                            {selectedModel === 'default' && (
                                <Button variant="destructive" disabled>
                                    Delete Model
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Churn Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer ID</TableHead>
                                <TableHead>Churn Probability</TableHead>
                                <TableHead>Last Predicted</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers === null && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                </TableRow>
                            )}
                            {customers && customers.length > 0 ? customers.map((customer) => (
                                <TableRow key={customer.cl_id}>
                                    <TableCell>{customer.cl_id}</TableCell>
                                    <TableCell>
                                        {customer.churn_probability !== null
                                            ? `${(customer.churn_probability * 100).toFixed(1)}%`
                                            : 'Not predicted'}
                                    </TableCell>
                                    <TableCell>
                                        {customer.last_predicted
                                            ? new Date(customer.last_predicted).toLocaleDateString('en-GB', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })
                                            : 'Never'}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        {customer.churn_probability !== 1 && (
                                            <Button
                                                onClick={() => handlePredict(customer.cl_id)}
                                            >
                                                {customer.churn_probability !== null ? 'Re-predict' : 'Predict'}
                                            </Button>
                                        )}
                                        {customer.churn_probability !== null && (
                                            customer.churn_probability > 0 && customer.churn_probability !== 1 ? (
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleChurn(customer.cl_id, true)}
                                                >
                                                    Mark as churned
                                                </Button>
                                            ) : customer.churn_probability === 1 ? (
                                                <Button
                                                    variant="default"
                                                    onClick={() => handleChurn(customer.cl_id, false)}
                                                >
                                                    Mark as unchurned
                                                </Button>
                                            ) : null
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No customers found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 