import json
import pytest
from server.app import app


@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def test_predict(client):
    response = client.post('/predict', json={
        'model_version': 'v20250209234339',
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
        'preferred_channel_encoded': 1
    })
    data = json.loads(response.data)
    assert response.status_code == 200
    assert 'churn_probability' in data


def test_retrain(client):
    # Assuming you have a valid CSV file for retraining
    with open('tests/train.csv', 'rb') as f:
        response = client.post('/retrain', data={
            'file': f
        })
    data = json.loads(response.data)
    assert response.status_code == 200
    assert data['success'] is True
    assert 'model_path' in data
    assert 'metrics' in data
