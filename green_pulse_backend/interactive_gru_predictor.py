"""
interactive_gru_predictor.py

1. Functionality 1: Given a building's history and user-adjusted parameters, predict energy usage for the next N hours.
2. Functionality 2: Given a target energy usage (y) at a future time, suggest which input parameters to adjust to achieve y (using simple sensitivity analysis).

Usage:
    Import and use the functions in this script for interactive prediction and parameter adjustment.

Example usage:
    from interactive_gru_predictor import load_model_and_scaler, predict_future_usage, suggest_param_adjustment
    import pandas as pd

    # Load model, scaler, and label encoder
    model, scaler, le = load_model_and_scaler('lstm_model')

    # Prepare a DataFrame 'building_history_df' with at least seq_length rows, including all model features and a 'timestamp' column
    # Example: building_history_df = pd.read_csv('building_1_history.csv', parse_dates=['timestamp'])

    features = [
        'building_id', 'meter', 'site_id', 'primary_use', 'square_feet',
        'year_built', 'floor_count', 'air_temperature', 'cloud_coverage',
        'dew_temperature', 'sea_level_pressure', 'wind_speed',
        'hour', 'day_of_week', 'month'
    ]

    # User parameters to override (dict of feature_name: value)
    user_params = {'air_temperature': 25.0, 'cloud_coverage': 3}

    # Predict future usage for next 6 hours
    pred_df = predict_future_usage(
        model, scaler, le,
        building_history_df,  # DataFrame with at least seq_length rows
        features,
        user_params,
        predict_hours=6,
        seq_length=24
    )
    print(pred_df)

    # Suggest parameter adjustment to achieve a target usage
    target_usage = 100.0
    adjustments = suggest_param_adjustment(
        model, scaler, le,
        building_history_df,  # DataFrame with at least seq_length rows
        features,
        user_params,
        target_usage,
        param_candidates=['air_temperature', 'cloud_coverage'],
        seq_length=24
    )
    print(adjustments)
"""
import numpy as np
import pandas as pd
import joblib
import os
from tensorflow import keras

def load_model_and_scaler(model_dir):
    model = keras.models.load_model(os.path.join(model_dir, 'gru_model2.h5'), compile=False)
    scaler = joblib.load(os.path.join(model_dir, 'scaler2.joblib'))
    le = joblib.load(os.path.join(model_dir, 'le.joblib'))
    return model, scaler, le

def prepare_features(df, features, scaler, le):
    df = df.copy()
    df['primary_use'] = le.transform(df['primary_use'])
    df[features] = scaler.transform(df[features])
    return df

def predict_future_usage(model, scaler, le, building_history_df, features, user_params, predict_hours=6, seq_length=24):
    """
    Predict future energy usage for a building given its history and user-adjusted parameters.
    - building_history_df: DataFrame with at least seq_length rows, most recent last.
    - user_params: dict of {feature_name: value} to override in the prediction window.
    - predict_hours: number of future hours to predict.
    Returns: DataFrame with predicted values and timestamps.
    """
    df = building_history_df.copy()
    # Only update dynamic features from user_params, keep others static from DB
    dynamic_features = ['air_temperature', 'cloud_coverage', 'dew_temperature', 'sea_level_pressure', 'wind_speed', 'floor_count']
    seq = df.iloc[-seq_length:][features].copy()
    preds = []
    timestamps = []
    last_timestamp = df.iloc[-1]['timestamp']
    if isinstance(last_timestamp, str):
        last_timestamp = pd.to_datetime(last_timestamp)
    for i in range(predict_hours):
        # Override only dynamic params for this step
        for k in dynamic_features:
            if k in user_params:
                seq.iloc[-1, seq.columns.get_loc(k)] = user_params[k]
        X = scaler.transform(seq)
        X = np.expand_dims(X, axis=0)
        y_pred_log = model.predict(X, verbose=0).flatten()[0]
        y_pred = np.expm1(y_pred_log)
        preds.append(y_pred)
        # Prepare next input sequence
        next_row = seq.iloc[-1].copy()
        # Update time features for next hour
        next_timestamp = last_timestamp + pd.Timedelta(hours=1)
        next_row['hour'] = next_timestamp.hour
        next_row['day_of_week'] = next_timestamp.dayofweek
        next_row['month'] = next_timestamp.month
        # Keep user dynamic params for next step
        for k in dynamic_features:
            if k in user_params:
                next_row[k] = user_params[k]
        seq = pd.concat([seq.iloc[1:], pd.DataFrame([next_row], columns=seq.columns)], ignore_index=True)
        timestamps.append(next_timestamp)
        last_timestamp = next_timestamp
    return pd.DataFrame({'timestamp': timestamps, 'predicted_meter_reading': preds})

def suggest_param_adjustment(model, scaler, le, building_history_df, features, user_params, target_usage, param_candidates=None, seq_length=24, tol=0.01, max_iter=20):
    """
    Suggest parameter adjustment to achieve target energy usage at next time step.
    - param_candidates: list of feature names to adjust (e.g., ['air_temperature', 'cloud_coverage'])
    Returns: dict of {feature_name: new_value}
    """
    # Only suggest for dynamic features
    dynamic_features = ['air_temperature', 'cloud_coverage', 'dew_temperature', 'sea_level_pressure', 'wind_speed', 'floor_count']
    if param_candidates is None:
        param_candidates = dynamic_features
    df = building_history_df.copy()
    seq = df.iloc[-seq_length:][features].copy()
    # Initial prediction
    X = scaler.transform(seq)
    X = np.expand_dims(X, axis=0)
    y_pred_log = model.predict(X, verbose=0).flatten()[0]
    y_pred = np.expm1(y_pred_log)
    # Search for values of dynamic params to reach target
    adjustments = {}
    for param in param_candidates:
        best_val = seq.iloc[-1, seq.columns.get_loc(param)]
        best_diff = abs(y_pred - target_usage)
        # Try a range of plausible values for each param
        test_range = np.linspace(seq.iloc[-1, seq.columns.get_loc(param)] * 0.5, seq.iloc[-1, seq.columns.get_loc(param)] * 1.5, 10)
        for val in test_range:
            test_seq = seq.copy()
            test_seq.iloc[-1, test_seq.columns.get_loc(param)] = val
            X_test = scaler.transform(test_seq)
            X_test = np.expand_dims(X_test, axis=0)
            y_test_log = model.predict(X_test, verbose=0).flatten()[0]
            y_test = np.expm1(y_test_log)
            diff = abs(y_test - target_usage)
            if diff < best_diff:
                best_diff = diff
                best_val = val
        adjustments[param] = float(best_val)
    return adjustments

def main():
    # Example: load model, scaler, and label encoder
    model, scaler, le = load_model_and_scaler('model')

    # Example: create a dummy building history DataFrame with at least seq_length rows
    # In practice, load your real data here
    seq_length = 24
    features = [
        'building_id', 'meter', 'site_id', 'primary_use', 'square_feet',
        'year_built', 'floor_count', 'air_temperature', 'cloud_coverage',
        'dew_temperature', 'sea_level_pressure', 'wind_speed',
        'hour', 'day_of_week', 'month'
    ]
    # Dummy data for demonstration (replace with real data)
    building_history_df = pd.DataFrame({
        'building_id': [1]*seq_length,
        'meter': [0]*seq_length,
        'site_id': [0]*seq_length,
        'primary_use': ['Education']*seq_length,
        'square_feet': [10000]*seq_length,
        'year_built': [2000]*seq_length,
        'floor_count': [2]*seq_length,
        'air_temperature': np.linspace(20, 25, seq_length),
        'cloud_coverage': [2]*seq_length,
        'dew_temperature': np.linspace(10, 15, seq_length),
        'sea_level_pressure': [1013]*seq_length,
        'wind_speed': [3]*seq_length,
        'hour': list(range(seq_length)),
        'day_of_week': [1]*seq_length,
        'month': [1]*seq_length,
        'timestamp': pd.date_range('2025-01-01', periods=seq_length, freq='H')
    })

    user_params = {'air_temperature': 23.0, 'cloud_coverage': 3}

    # Encode 'primary_use' using the label encoder before scaling
    building_history_df['primary_use'] = le.transform(building_history_df['primary_use'])

    # Predict future usage for next 6 hours
    pred_df = predict_future_usage(
        model, scaler, le,
        building_history_df,
        features,
        user_params,
        predict_hours=6,
        seq_length=seq_length
    )
    print('Predicted future usage:')
    print(pred_df)

    # Suggest parameter adjustment to achieve a target usage
    target_usage = 100.0
    adjustments = suggest_param_adjustment(
        model, scaler, le,
        building_history_df,
        features,
        user_params,
        target_usage,
        param_candidates=['air_temperature', 'cloud_coverage'],
        seq_length=seq_length
    )
    print('Suggested parameter adjustments:')
    print(adjustments)

if __name__ == "__main__":
    main()
