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

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers', { method: 'GET' });
    const data = await res.json();

    setCustomers(data.customers);
  };

  const fetchModels = async () => {
    const res = await fetch('/api/model', { method: 'GET' });
    const data = await res.json();

    console.log(data.models);

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
    try {
      toast.info('Model retraining in progress...');
      const res = await fetch('/api/retrain', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);

      fetchCustomers();
      fetchModels();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during model retraining:', error);
        toast.error(error.message);
      } else {
        console.error('An unknown error occurred');
        toast.error('An unknown error occurred');
      }
    }
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

  return (
    <section className="p-8">
      <h1 className="flex justify-center w-full text-2xl tracking-tight font-bold mb-8">ChurnWatch Prediction Dashboard</h1>

      <div className='flex justify-between gap-8'>
        <Card className="mb-8 w-full">
          <CardHeader>
            <CardTitle>Dataset Management</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="max-w-sm hover:bg-primary-foreground"
            />
            <Button disabled={!file} onClick={handleUpload}>Upload CSV</Button>
            <Button className='bg-red-800' onClick={handleReset}>Reset All Data</Button>
          </CardContent>
        </Card>

        <Card className="mb-8 w-full">
          <CardHeader>
            <CardTitle>Model Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className='border border-gray-300 rounded-md p-4 grid grid-cols-2'>
              <p className='text-sm text-gray-600'>Current Model: {selModel.length > 0 ? selModel[0].version : 'Default'}</p>
              <p className='text-sm text-gray-600'>Trained: {selModel.length > 0 ? new Date(selModel[0].trainedAt).toLocaleDateString('en-US', {
                minute: 'numeric',
                hour12: true,
                hour: '2-digit'
              }) : 'At launch'}</p>
              <p className='text-sm text-gray-600'>
                Accuracy: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.accuracy * 100).toFixed(2) + '%' : '72.50%'}
              </p>
              <p className='text-sm text-gray-600'>
                Precision: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.precision * 100).toFixed(2) + '%' : '77.20%'}
              </p>
              <p className='text-sm text-gray-600'>
                Recall: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.recall * 100).toFixed(2) + '%' : '73.36%'}
              </p>
              <p className='text-sm text-gray-600'>
                F1 Score: {selModel.length > 0 && selModel[0].metrics ? (selModel[0].metrics.f1 * 100).toFixed(2) + '%' : '75.23%'}
              </p>
            </div>
            <div className='flex gap-4'>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Model'></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='default' key='default-model'>Default</SelectItem>
                  {models.map((model) => (
                    <SelectItem value={model.version} key={model.id}>{model.version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleRetrain}>Retrain Model</Button>
              <Button className='bg-red-800'>Delete Model</Button>
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
              <TableRow className='[&_*]:text-center'>
                <TableHead>Customer ID</TableHead>
                <TableHead>Churn Probability</TableHead>
                <TableHead>Last Predicted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {customers === null && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center p-2">Loading...</TableCell>
                </TableRow>
              )}
              {customers && customers.length > 0 ? customers.map((customer) => (
                <TableRow key={customer.cl_id}>
                  <TableCell>{customer.cl_id}</TableCell>

                  <TableCell className='text-center'>
                    {customer.churn_probability !== null
                      ? `${(customer.churn_probability * 100).toFixed(1)}%`
                      : 'Not predicted'}
                  </TableCell>
                  <TableCell className='text-center'>
                    {customer.last_predicted
                      ? new Date(customer.last_predicted).toLocaleDateString('en-US', {
                        minute: 'numeric',
                        hour12: true,
                        hour: '2-digit'
                      })
                      : 'Never'}
                  </TableCell>

                  <TableCell className='flex justify-center items-center gap-2'>
                    {customer.churn_probability !== 1 && (
                      <Button
                        onClick={async () => await handlePredict(customer.cl_id)}
                      >
                        {customer.churn_probability !== null ? 'Re-predict' : 'Predict'}
                      </Button>
                    )}

                    {customer.churn_probability === null
                      ? null
                      : customer.churn_probability > 0 && customer.churn_probability !== 1
                        ?
                        <Button
                          className='bg-red-500'
                          onClick={async () => await handleChurn(customer.cl_id, true)}
                        >
                          Mark as churned
                        </Button>
                        : customer.churn_probability === 1
                          ?
                          <Button
                            className='bg-green-500'
                            onClick={async () => await handleChurn(customer.cl_id, false)}
                          >
                            Mark as unchurned
                          </Button>
                          : null
                    }
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center p-2">No customers found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}