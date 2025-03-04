from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
from train import retrain_model
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join('models', 'default.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    model_version = data['model_version']

    model_path_with_version = os.path.join('models', f'{model_version}.pkl')
    model_path = MODEL_PATH

    if os.path.exists(model_path_with_version):
        model_path = model_path_with_version

    print(f'Using model: {model_path}')

    try:
        model = pickle.load(open(model_path, 'rb'))

        features_dict = {
            'transaction_freq': [data['transaction_freq']],
            'avg_transaction_amount': [data['avg_transaction_amount']],
            'time_since_last_transaction': [data['time_since_last_transaction']],
            'mcc_diversity': [data['mcc_diversity']],
            'mean_hour': [data['mean_hour']],
            'std_hour': [data['std_hour']],
            'mean_day_of_week': [data['mean_day_of_week']],
            'std_day_of_week': [data['std_day_of_week']],
            'mean_month': [data['mean_month']],
            'std_month': [data['std_month']],
            'preferred_channel': [data['preferred_channel_encoded']]
        }

        features = pd.DataFrame(features_dict)

        probability = model.predict_proba(features)[0][1]

        return jsonify({'churn_probability': float(probability)})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


@app.route('/retrain', methods=['POST'])
def retrain():
    try:
        df = pd.read_csv(request.files['file'])
        df_old = pd.read_csv('data/train.csv')
        df_old['TRDATETIME'] = pd.to_datetime(df_old['TRDATETIME'], format='%d%b%y:%H:%M:%S').dt.strftime('%Y-%m-%dT%H:%M:%S')

        df = df[1:]  
        df_combined = pd.concat([df_old, df], ignore_index=True)

        version, model_path, metrics = retrain_model(df_combined)

        return jsonify({
            'success': True,
            'metrics': metrics,
            'model_path': model_path,
            'version': version
        })
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
