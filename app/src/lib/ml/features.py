import pandas as pd
from datetime import datetime
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib
import numpy as np


class FeatureService:
    def __init__(self):
        self.preprocessor = None

    def create_features(self, df):
        df['TRDATETIME'] = pd.to_datetime(
            df['TRDATETIME'], format='%d%b%y:%H:%M:%S')

        # Transaction frequency
        transaction_freq = df.groupby(
            'cl_id').size().reset_index(name='transaction_freq')

        # Average transaction amount
        avg_transaction_amount = df.groupby(
            'cl_id')['amount'].mean().reset_index(name='avg_transaction_amount')

        # Days since last transaction
        last_transaction = df.groupby(
            'cl_id')['TRDATETIME'].max().reset_index(name='last_transaction')
        last_transaction['time_since_last_transaction'] = (
            pd.to_datetime('now') - last_transaction['last_transaction']).dt.days

        # MCC diversity
        mcc_diversity = df.groupby(
            'cl_id')['MCC'].nunique().reset_index(name='mcc_diversity')

        # Preferred channel
        channel_preference = df.groupby(
            ['cl_id', 'channel_type']).size().reset_index(name='channel_count')
        channel_preference = channel_preference.loc[channel_preference.groupby('cl_id')[
            'channel_count'].idxmax()]
        channel_preference = channel_preference[['cl_id', 'channel_type']].rename(
            columns={'channel_type': 'preferred_channel'})

        # Time features
        df['transaction_hour'] = df['TRDATETIME'].dt.hour
        df['transaction_day_of_week'] = df['TRDATETIME'].dt.dayofweek
        df['transaction_month'] = df['TRDATETIME'].dt.month

        time_features = df.groupby('cl_id').agg({
            'transaction_hour': ['mean', 'std'],
            'transaction_day_of_week': ['mean', 'std'],
            'transaction_month': ['mean', 'std']
        }).reset_index()

        time_features.columns = ['cl_id', 'mean_hour', 'std_hour',
                                 'mean_day_of_week', 'std_day_of_week',
                                 'mean_month', 'std_month']

        # Merge all features
        features = transaction_freq.merge(avg_transaction_amount, on='cl_id') \
            .merge(last_transaction[['cl_id', 'time_since_last_transaction']], on='cl_id') \
            .merge(mcc_diversity, on='cl_id') \
            .merge(channel_preference, on='cl_id') \
            .merge(time_features, on='cl_id')

        return features

    def get_preprocessor(self, features):
        numerical_features = ['transaction_freq', 'avg_transaction_amount',
                              'time_since_last_transaction', 'mcc_diversity',
                              'mean_hour', 'std_hour', 'mean_day_of_week',
                              'std_day_of_week', 'mean_month', 'std_month']
        categorical_features = ['preferred_channel']

        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_features),
                ('cat', OneHotEncoder(), categorical_features)
            ])

        self.preprocessor.fit(
            features[numerical_features + categorical_features])
        return self.preprocessor
