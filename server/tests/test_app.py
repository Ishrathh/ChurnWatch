import json
import pytest
from server.app import app
import io
import pandas as pd
from datetime import datetime, timedelta


@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def test_predict(client):
    response = client.post('/predict', json={
        'model_version': 0,  # For default model
        'transaction_freq': 5,
        'avg_transaction_amount': 100,
        'time_since_last_transaction': 10,
        'mcc_diversity': 3,
        'mean_hour': 12,
        'std_hour': 1,
        'mean_day_of_week': 3,
        'std_day_of_week': 1,
        'mean_month': 6,
        'std_month': 1,
        'preferred_channel_encoded': 'type1'
    })
    data = json.loads(response.data)
    assert response.status_code == 200
    assert 'churn_probability' in data


def test_retrain(client):
    # Sample transaction data
    data = {
        'PERIOD': ['22/01/01', '22/01/01', '22/01/02', '22/01/02', '22/01/03'],
        'cl_id': ['C001', 'C001', 'C002', 'C002', 'C003'],
        'MCC': ['5411', '5411', '5812', '5812', '5912'],
        'channel_type': ['ONLINE', 'ONLINE', 'POS', 'POS', 'ATM'],
        'currency': ['USD', 'USD', 'USD', 'USD', 'USD'],
        'TRDATETIME': [
            (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%dT%H:%M:%S'),
            (datetime.now() - timedelta(days=25)).strftime('%Y-%m-%dT%H:%M:%S'),
            (datetime.now() - timedelta(days=20)).strftime('%Y-%m-%dT%H:%M:%S'),
            (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%dT%H:%M:%S'),
            (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%dT%H:%M:%S')
        ],
        'amount': [100.50, 75.25, 200.00, 150.75, 50.00],
        'trx_category': ['GROCERY', 'GROCERY', 'RESTAURANT', 'RESTAURANT', 'PHARMACY'],
        'target_sum': [175.75, 175.75, 350.75, 350.75, 50.00],
        'target_flag': [0, 0, 1, 1, 0]
    }

    df = pd.DataFrame(data)
    csv_data = df.to_csv(index=False)
    csv_file = io.BytesIO(csv_data.encode('utf-8'))

    response = client.post('/retrain', data={
        'file': (csv_file, 'training_data.csv')
    })

    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['success'] is True
    assert 'model_path' in data
    assert 'metrics' in data
    assert 'version' in data
