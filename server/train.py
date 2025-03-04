import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import StackingClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from datetime import datetime


def feature_engineering(df):
    df['TRDATETIME'] = pd.to_datetime(
        df['TRDATETIME'])

    transaction_freq = df.groupby(
        'cl_id').size().reset_index(name='transaction_freq')

    # Avg tx amount per customer
    avg_transaction_amount = df.groupby(
        'cl_id')['amount'].mean().reset_index(name='avg_transaction_amount')

    # Days since last transaction
    last_transaction = df.groupby(
        'cl_id')['TRDATETIME'].max().reset_index(name='last_transaction')

    last_transaction['time_since_last_transaction'] = (
        pd.to_datetime('now') - last_transaction['last_transaction']).dt.days

    # Unique MCC codes per customer
    mcc_diversity = df.groupby(
        'cl_id')['MCC'].nunique().reset_index(name='mcc_diversity')

    # Preferred channel per customer (most frequent channel)
    channel_preference = df.groupby(
        ['cl_id', 'channel_type']).size().reset_index(name='channel_count')

    channel_preference = channel_preference.loc[channel_preference.groupby(
        'cl_id')['channel_count'].idxmax()].reset_index(drop=True)

    channel_preference = channel_preference[['cl_id', 'channel_type']].rename(
        columns={'channel_type': 'preferred_channel'})

    # Tx time: Hour of the day, day of the week, month
    df['transaction_hour'] = df['TRDATETIME'].dt.hour
    df['transaction_day_of_week'] = df['TRDATETIME'].dt.dayofweek
    df['transaction_month'] = df['TRDATETIME'].dt.month

    # Aggregate time-based features per customer
    time_features = df.groupby('cl_id').agg({
        # Mean and standard deviation of transaction hour
        'transaction_hour': ['mean', 'std'],
        # Mean and standard deviation of day of week
        'transaction_day_of_week': ['mean', 'std'],
        # Mean and standard deviation of transaction month
        'transaction_month': ['mean', 'std']
    }).reset_index()

    time_features.columns = ['cl_id', 'mean_hour', 'std_hour',
                             'mean_day_of_week', 'std_day_of_week', 'mean_month', 'std_month']

    # Merge all features
    features = transaction_freq.merge(avg_transaction_amount, on='cl_id') \
        .merge(last_transaction[['cl_id', 'time_since_last_transaction']], on='cl_id') \
        .merge(mcc_diversity, on='cl_id') \
        .merge(channel_preference, on='cl_id') \
        .merge(time_features, on='cl_id')

    # Add target columns if needed
    targets = df[['cl_id', 'target_flag', 'target_sum']].drop_duplicates()
    features = features.merge(targets, on='cl_id', how='left')

    features.dropna(inplace=True)

    return features


def retrain_model(df):
    features = feature_engineering(df)
    X = features.drop(columns=['cl_id', 'target_flag', 'target_sum'])
    y = features['target_flag']

    # Preprocessing
    numerical_features = ['transaction_freq', 'avg_transaction_amount',
                          'time_since_last_transaction', 'mcc_diversity',
                          'mean_hour', 'std_hour', 'mean_day_of_week',
                          'std_day_of_week', 'mean_month', 'std_month']
    categorical_features = ['preferred_channel']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(), categorical_features)
        ])

    # Model training
    base_models = [
        ('Random Forest', RandomForestClassifier(random_state=42)),
        ('Gradient Boosting', GradientBoostingClassifier(random_state=42)),
        ('Logistic Regression', LogisticRegression(max_iter=1000, random_state=42)),
        ('Neural Network', MLPClassifier(hidden_layer_sizes=(64, 32),
                                         max_iter=1000, random_state=42))
    ]

    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', StackingClassifier(
            estimators=base_models,
            final_estimator=LogisticRegression(),
            stack_method='predict_proba'
        ))
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
        'roc_auc': roc_auc_score(y_test, y_proba)
    }

    # Save model
    version = f"v{datetime.now().strftime('%Y%m%d%H%M%S')}"
    model_path = f"models/{version}.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)

    print('Model retrained successfully!')
    print(f'Model saved at: {model_path}')
    print(f'Model metrics: {metrics}')

    return version, model_path, metrics
