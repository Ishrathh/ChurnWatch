import pandas as pd
from sklearn.ensemble import StackingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import json
from datetime import datetime
from sklearn.pipeline import Pipeline
import numpy as np
from features import FeatureService


class ModelTrainer:
    def __init__(self):
        self.base_models = [
            ('Random Forest', RandomForestClassifier(random_state=42)),
            ('Gradient Boosting', GradientBoostingClassifier(random_state=42)),
            ('Logistic Regression', LogisticRegression(
                max_iter=1000, random_state=42)),
            ('Neural Network', MLPClassifier(hidden_layer_sizes=(
                64, 32), max_iter=1000, random_state=42))
        ]
        self.meta_model = LogisticRegression()
        self.feature_service = FeatureService()

    def train(self, df):
        # Feature engineering
        features = self.feature_service.create_features(df)
        X = features.drop(columns=['cl_id', 'target_flag', 'target_sum'])
        y = features['target_flag']

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42)

        # Create and save preprocessor
        preprocessor = self.feature_service.get_preprocessor(X)

        # Train ensemble model
        ensemble = StackingClassifier(
            estimators=self.base_models,
            final_estimator=self.meta_model,
            stack_method='predict_proba'
        )

        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', ensemble)
        ])

        pipeline.fit(X_train, y_train)

        # Evaluate
        y_pred = pipeline.predict(X_test)
        y_proba = pipeline.predict_proba(X_test)[:, 1]

        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred),
            'roc_auc': roc_auc_score(y_test, y_proba)
        }

        # Save model
        version = f"v{datetime.now().strftime('%Y%m%d%H%M%S')}"
        model_path = f"models/{version}.joblib"
        joblib.dump(pipeline, model_path)

        return version, model_path, metrics
