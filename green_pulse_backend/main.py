from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sqlite3
import pandas as pd
import numpy as np
import os
from interactive_gru_predictor import load_model_and_scaler, predict_future_usage, suggest_param_adjustment
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

DB_PATH = os.path.join(os.path.dirname(__file__), 'gru_predictions.sqlite')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to fetch building history from DB
def get_building_history(building_id: int, seq_length: int = 24) -> pd.DataFrame:
    with sqlite3.connect(DB_PATH) as conn:
        df = pd.read_sql_query(
            f"SELECT * FROM energy_data WHERE building_id = ? ORDER BY timestamp ASC", conn, params=(building_id,)
        )
    if len(df) < seq_length:
        raise ValueError(f"Not enough data for building {building_id} (need at least {seq_length} rows)")
    return df

@app.get("/building/{building_id}")
def get_building_data(building_id: int):
    """Get all actual and predicted data for a building."""
    with sqlite3.connect(DB_PATH) as conn:
        df = pd.read_sql_query(
            f"SELECT * FROM energy_data WHERE building_id = ? ORDER BY timestamp ASC", conn, params=(building_id,)
        )
    # Replace NaN and infinite values with None for JSON serialization
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.astype(object).where(pd.notnull(df), None)
    return df.to_dict(orient="records")

class PredictRequest(BaseModel):
    building_id: int
    user_params: Dict[str, Any]
    predict_hours: int = 24  # Default to 24 hours
    seq_length: int = 24

@app.post("/predict_future_usage")
def predict_future_usage_route(req: PredictRequest):
    model, scaler, le = load_model_and_scaler(MODEL_DIR)
    df = get_building_history(req.building_id, req.seq_length)
    features = [
        'building_id', 'meter', 'site_id', 'primary_use', 'square_feet',
        'year_built', 'floor_count', 'air_temperature', 'cloud_coverage',
        'dew_temperature', 'sea_level_pressure', 'wind_speed',
        'hour', 'day_of_week', 'month'
    ]
    # Ensure 'primary_use' is integer-encoded
    if df['primary_use'].dtype == object:
        df['primary_use'] = le.transform(df['primary_use'])
    pred_df = predict_future_usage(
        model, scaler, le,
        df,
        features,
        req.user_params,
        predict_hours=req.predict_hours,
        seq_length=req.seq_length
    )
    return pred_df.to_dict(orient="records")

class SuggestRequest(BaseModel):
    building_id: int
    user_params: Dict[str, Any]
    target_usage: float
    param_candidates: Optional[List[str]] = None
    seq_length: int = 24

@app.post("/suggest_param_adjustment")
def suggest_param_adjustment_route(req: SuggestRequest):
    model, scaler, le = load_model_and_scaler(MODEL_DIR)
    df = get_building_history(req.building_id, req.seq_length)
    features = [
        'building_id', 'meter', 'site_id', 'primary_use', 'square_feet',
        'year_built', 'floor_count', 'air_temperature', 'cloud_coverage',
        'dew_temperature', 'sea_level_pressure', 'wind_speed',
        'hour', 'day_of_week', 'month'
    ]
    # Ensure 'primary_use' is integer-encoded
    if df['primary_use'].dtype == object:
        df['primary_use'] = le.transform(df['primary_use'])
    # If param_candidates is not provided, suggest a broader set of parameters
    default_params = [
        'air_temperature', 'cloud_coverage', 'dew_temperature', 'sea_level_pressure',
        'wind_speed', 'square_feet', 'year_built', 'floor_count', 'meter', 'site_id',
        'primary_use', 'hour', 'day_of_week', 'month'
    ]
    param_candidates = req.param_candidates if req.param_candidates is not None else default_params
    adjustments = suggest_param_adjustment(
        model, scaler, le,
        df,
        features,
        req.user_params,
        req.target_usage,
        param_candidates=param_candidates,
        seq_length=req.seq_length
    )
    return adjustments
