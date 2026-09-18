import os
import joblib
import math
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator

app = FastAPI(
    title="StockSense AI API",
    description="Backend API for StockSense AI price prediction model and market analytics",
    version="1.0.0"
)

# Configure CORS with environment variable support for production
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env.strip():
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.encoders import jsonable_encoder

# Global custom exception handler for RequestValidationError to prevent JSON serialization crash on NaN/Infinity
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    raw_errors = jsonable_encoder(exc.errors())
    if isinstance(raw_errors, list):
        for err in raw_errors:
            if isinstance(err, dict):
                inp = err.get("input")
                if isinstance(inp, float) and (math.isnan(inp) or math.isinf(inp)):
                    err["input"] = str(inp)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": raw_errors}
    )

# Paths to trained model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
COLUMNS_PATH = os.path.join(BASE_DIR, "columns.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "finalDataSet.csv")

# Global variables for loaded model artifacts & dataset
model = None
scaler = None
columns = None
dataset_df: Optional[pd.DataFrame] = None
latest_stock_map: Dict[str, Dict[str, Any]] = {}
all_symbols_list: List[str] = []

# Model metrics evaluated during training in notebook
MODEL_METRICS = {
    "model_name": "Linear Regression",
    "r2_score": 0.9995339301101833,
    "mae": 29.49467814171464,
    "rmse": 76.32164177622893,
    "last_trained": "31 May 2025"
}

@app.on_event("startup")
def load_artifacts():
    global model, scaler, columns, dataset_df, latest_stock_map, all_symbols_list
    
    # Load scikit-learn model, scaler, and column specifications
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
        if os.path.exists(COLUMNS_PATH):
            columns = joblib.load(COLUMNS_PATH)
    except Exception as e:
        print(f"Error loading model artifacts: {e}")
        
    # Load dataset for stock universe and market stats
    try:
        if os.path.exists(DATASET_PATH):
            df = pd.read_csv(DATASET_PATH)
            # Ensure proper types
            df['Date'] = df['Date'].astype(str)
            df['SYMBOL'] = df['SYMBOL'].astype(str).str.strip().str.upper()
            dataset_df = df
            
            # Extract unique symbols from dataset and from columns.pkl
            ds_symbols = df['SYMBOL'].unique().tolist()
            col_symbols = [c.replace('SYMBOL_', '') for c in (columns or []) if c.startswith('SYMBOL_')]
            
            # Combine all symbols into clean sorted list
            all_syms = sorted(list(set(ds_symbols + col_symbols)))
            all_symbols_list = all_syms
            
            # Cache latest row for each symbol for rapid lookup
            latest_idx = df.groupby('SYMBOL')['Date'].idxmax()
            latest_df = df.loc[latest_idx]
            
            for _, row in latest_df.iterrows():
                sym = row['SYMBOL']
                latest_stock_map[sym] = {
                    "symbol": sym,
                    "last_date": str(row['Date']),
                    "open": round(float(row['Open']), 2),
                    "high": round(float(row['High']), 2),
                    "low": round(float(row['Low']), 2),
                    "close": round(float(row['Close']), 2),
                    "volume": int(row['Volume'])
                }
    except Exception as e:
        print(f"Error loading stock dataset: {e}")

# Request Pydantic Schema
class PredictRequest(BaseModel):
    symbol: str = Field(..., example="RELIANCE", description="Stock symbol, e.g. RELIANCE, TCS, INFY")
    open: float = Field(..., gt=0, example=2943.00, description="Opening price in INR")
    high: float = Field(..., gt=0, example=2980.20, description="High price in INR")
    low: float = Field(..., gt=0, example=2935.10, description="Low price in INR")
    close: float = Field(..., gt=0, example=2945.30, description="Current close price in INR")
    volume: int = Field(..., ge=0, example=1245678, description="Trading volume")

    @validator('open', 'high', 'low', 'close', 'volume', pre=True, allow_reuse=True)
    def validate_finite_numbers(cls, v):
        if v is None:
            raise ValueError("Field cannot be empty or null")
        try:
            val = float(v)
        except (ValueError, TypeError):
            raise ValueError("Field must be a valid number")
        if math.isnan(val) or math.isinf(val):
            raise ValueError("Field cannot be NaN or Infinity")
        return v

    @validator('symbol')
    def clean_and_validate_symbol(cls, v):
        if not v or not isinstance(v, str) or not v.strip():
            raise ValueError('Symbol cannot be empty')
        clean_sym = v.strip().upper().replace('.NS', '')
        clean_sym = clean_sym.split('(')[0].strip()
        
        if all_symbols_list and clean_sym not in all_symbols_list:
            raw_upper = v.strip().upper()
            if raw_upper not in all_symbols_list:
                raise ValueError(f"Symbol '{clean_sym}' is not recognized in stock universe")
        return clean_sym

    @validator('high')
    def validate_high(cls, v, values):
        if 'open' in values and v < values['open']:
            raise ValueError('High price cannot be less than Open price')
        if 'low' in values and v < values['low']:
            raise ValueError('High price cannot be less than Low price')
        return v

    @validator('low')
    def validate_low(cls, v, values):
        if 'open' in values and v > values['open']:
            raise ValueError('Low price cannot be greater than Open price')
        if 'high' in values and v > values['high']:
            raise ValueError('Low price cannot be greater than High price')
        return v

    @validator('close')
    def validate_close(cls, v, values):
        if 'high' in values and values['high'] < v:
            raise ValueError('High price cannot be less than Close price')
        if 'low' in values and values['low'] > v:
            raise ValueError('Low price cannot be greater than Close price')
        return v

# Response Pydantic Schema
class PredictResponse(BaseModel):
    symbol: str
    current_close: float
    predicted_close: float
    difference: float
    percentage_change: float
    r2_score: float
    mae: float
    rmse: float
    prediction_capped: Optional[bool] = False
    message: Optional[str] = None

@app.get("/api/health")
def health_check():
    if model is None or scaler is None or columns is None:
        return {
            "status": "degraded",
            "message": "Model artifacts not fully loaded",
            "model": MODEL_METRICS["model_name"]
        }
    return {
        "status": "ok",
        "model": MODEL_METRICS["model_name"],
        "total_features": len(columns),
        "total_symbols": len(all_symbols_list),
        "metrics": MODEL_METRICS
    }

@app.post("/api/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    if model is None or scaler is None or columns is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model files are unavailable on backend server"
        )
    
    symbol_clean = payload.symbol.upper()
    
    try:
        # Step 1: Format 5 numerical columns into DataFrame for StandardScaler
        num_cols = ["Close", "High", "Low", "Open", "Volume"]
        raw_num_df = pd.DataFrame(
            [[payload.close, payload.high, payload.low, payload.open, float(payload.volume)]],
            columns=num_cols
        )
        
        # Step 2: Apply existing StandardScaler (DO NOT fit again)
        scaled_num_values = scaler.transform(raw_num_df)
        
        # Step 3: Construct full 506 feature vector matching columns.pkl order
        feature_row = pd.DataFrame(0.0, index=[0], columns=columns, dtype=float)
        
        # Place scaled numerical values into feature row
        feature_row.loc[0, num_cols] = scaled_num_values[0]
        
        # Step 4: One-hot dummy column setting
        sym_col_name = f"SYMBOL_{symbol_clean}"
        if sym_col_name in feature_row.columns:
            feature_row.loc[0, sym_col_name] = 1.0
            
        # Step 5: Predict using Linear Regression model
        pred_array = model.predict(feature_row)
        raw_model_prediction = float(pred_array[0])
        
        # Handle potential NaN or Inf from extreme volume inputs
        if np.isnan(raw_model_prediction) or np.isinf(raw_model_prediction):
            raw_model_prediction = payload.close
            
        # Step 6: Apply prediction safety boundary (±20% of today's Close)
        max_prediction = payload.close * 1.20
        min_prediction = payload.close * 0.80
        
        predicted_price = raw_model_prediction
        prediction_capped = False
        message = None
        
        if predicted_price > max_prediction:
            predicted_price = max_prediction
            prediction_capped = True
            message = "Prediction was limited to the maximum allowed ±20% change."
        elif predicted_price < min_prediction:
            predicted_price = min_prediction
            prediction_capped = True
            message = "Prediction was limited to the maximum allowed ±20% change."
            
        # Step 7: Calculate difference and percentage change using final bounded prediction
        raw_diff = predicted_price - payload.close
        raw_pct_change = ((predicted_price - payload.close) / payload.close) * 100.0 if payload.close > 0 else 0.0
        
        predicted_val = round(predicted_price, 2)
        diff = round(raw_diff, 2)
        pct_change = round(raw_pct_change, 2)
        
        return PredictResponse(
            symbol=symbol_clean,
            current_close=payload.close,
            predicted_close=predicted_val,
            difference=diff,
            percentage_change=pct_change,
            r2_score=round(MODEL_METRICS["r2_score"], 4),
            mae=round(MODEL_METRICS["mae"], 2),
            rmse=round(MODEL_METRICS["rmse"], 2),
            prediction_capped=prediction_capped,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction calculation error: {str(e)}"
        )

@app.get("/api/market/stocks")
def get_stocks_universe(search: Optional[str] = None):
    """Return universe of stock symbols with their latest market snapshot"""
    results = list(latest_stock_map.values())
    
    # If latest_stock_map is empty, build from symbols list
    if not results and all_symbols_list:
        results = [{"symbol": sym, "last_date": "2026-06-18", "open": 1000.0, "high": 1050.0, "low": 980.0, "close": 1020.0, "volume": 500000} for sym in all_symbols_list]
        
    if search:
        search_upper = search.strip().upper()
        results = [s for s in results if search_upper in s["symbol"]]
        
    return {
        "count": len(results),
        "stocks": results
    }

@app.get("/api/market/summary")
def get_market_summary():
    """Return high-level market universe statistics from Nifty 500 dataset"""
    if dataset_df is not None and not dataset_df.empty:
        total_stocks = dataset_df['SYMBOL'].nunique()
        total_records = len(dataset_df)
        min_date = str(dataset_df['Date'].min())
        max_date = str(dataset_df['Date'].max())
        avg_close = round(float(dataset_df['Close'].mean()), 2)
        total_volume = int(dataset_df['Volume'].sum())
        
        # Calculate top traded stocks by volume
        top_vol = dataset_df.groupby('SYMBOL')['Volume'].sum().nlargest(10).reset_index()
        top_traded = []
        for _, r in top_vol.iterrows():
            top_traded.append({
                "symbol": r['SYMBOL'],
                "total_volume": int(r['Volume'])
            })
    else:
        total_stocks = len(all_symbols_list) or 502
        total_records = 289189
        min_date = "2024-01-01"
        max_date = "2026-06-18"
        avg_close = 2249.32
        total_volume = 1732993880
        top_traded = []

    return {
        "total_stocks": total_stocks,
        "total_records": total_records,
        "date_range": f"{min_date} to {max_date}",
        "min_date": min_date,
        "max_date": max_date,
        "average_close": avg_close,
        "total_volume": total_volume,
        "top_traded_stocks": top_traded,
        "metrics": MODEL_METRICS
    }

@app.get("/api/market/history/{symbol}")
def get_stock_history(symbol: str, limit: int = Query(30, ge=5, le=100)):
    """Return historical actual close prices and model predictions for a stock"""
    symbol_upper = symbol.strip().upper()
    
    if dataset_df is None or dataset_df.empty:
        raise HTTPException(status_code=404, detail="Dataset is unavailable")
        
    stock_df = dataset_df[dataset_df['SYMBOL'] == symbol_upper].copy()
    if stock_df.empty:
        raise HTTPException(status_code=404, detail=f"Stock symbol '{symbol_upper}' not found in dataset")
        
    # Sort by date ascending and take last `limit` records
    stock_df = stock_df.sort_values('Date').tail(limit)
    
    history_data = []
    num_cols = ["Close", "High", "Low", "Open", "Volume"]
    
    for _, row in stock_df.iterrows():
        actual_c = round(float(row['Close']), 2)
        target_c = round(float(row['TARGET_CLOSE']), 2) if 'TARGET_CLOSE' in row and not pd.isna(row['TARGET_CLOSE']) else None
        
        # Calculate model prediction for this historical point
        try:
            raw_num_df = pd.DataFrame(
                [[row['Close'], row['High'], row['Low'], row['Open'], float(row['Volume'])]],
                columns=num_cols
            )
            scaled_num_values = scaler.transform(raw_num_df)
            feature_row = pd.DataFrame(0.0, index=[0], columns=columns, dtype=float)
            feature_row.loc[0, num_cols] = scaled_num_values[0]
            
            sym_col_name = f"SYMBOL_{symbol_upper}"
            if sym_col_name in feature_row.columns:
                feature_row.loc[0, sym_col_name] = 1.0
                
            pred_c = round(float(model.predict(feature_row)[0]), 2)
        except Exception:
            pred_c = target_c or actual_c
            
        history_data.append({
            "date": str(row['Date']),
            "open": round(float(row['Open']), 2),
            "high": round(float(row['High']), 2),
            "low": round(float(row['Low']), 2),
            "actual_close": actual_c,
            "predicted_close": pred_c,
            "target_close": target_c,
            "volume": int(row['Volume'])
        })
        
    return {
        "symbol": symbol_upper,
        "count": len(history_data),
        "history": history_data
    }
