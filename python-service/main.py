"""
Royal Class Events - Intelligence Microservice
FastAPI service for event demand prediction and pricing optimization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from models.demand import DemandPredictor
from models.pricing import PricingOptimizer

# Initialize FastAPI app
app = FastAPI(
    title="Royal Class Events Intelligence API",
    description="AI-powered demand prediction and dynamic pricing",
    version="1.0.0"
)

# CORS configuration (allow Next.js app to call this service)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
demand_predictor = DemandPredictor()
pricing_optimizer = PricingOptimizer()


# Request/Response Models
class DemandRequest(BaseModel):
    category: str = Field(..., description="Event category (e.g., tech, gala)")
    location: str = Field(..., description="City name")
    start_date: str = Field(..., description="ISO format date")
    capacity: int = Field(..., gt=0, description="Maximum attendees")
    ticket_type: str = Field(default="free", description="free or paid")


class RevenueRequest(BaseModel):
    demand_score: float = Field(..., ge=0, le=100)
    capacity: int = Field(..., gt=0)
    ticket_price: float = Field(..., ge=0)
    ticket_type: str = Field(default="paid")


class PriceSuggestionRequest(BaseModel):
    category: str
    location: str
    demand_score: float = Field(..., ge=0, le=100)
    capacity: int = Field(..., gt=0)


class DynamicPriceRequest(BaseModel):
    base_price: float = Field(..., gt=0)
    min_price: float = Field(..., gt=0)
    max_price: float = Field(..., gt=0)
    registrations: int = Field(..., ge=0)
    capacity: int = Field(..., gt=0)
    days_until_event: int = Field(..., ge=0)


# API Endpoints
@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "Royal Class Events Intelligence API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": [
            "/predict-demand",
            "/forecast-revenue",
            "/suggest-price",
            "/calculate-dynamic-price"
        ]
    }


@app.post("/predict-demand")
def predict_demand(request: DemandRequest):
    """
    Predict event demand score based on event details
    
    Returns demand score (0-100), confidence level, and contributing factors
    """
    try:
        result = demand_predictor.predict_demand(
            category=request.category,
            location=request.location,
            start_date=request.start_date,
            capacity=request.capacity,
            ticket_type=request.ticket_type
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/forecast-revenue")
def forecast_revenue(request: RevenueRequest):
    """
    Forecast revenue based on demand prediction
    
    Returns expected sales and revenue estimates (min, expected, max)
    """
    try:
        result = demand_predictor.forecast_revenue(
            demand_score=request.demand_score,
            capacity=request.capacity,
            ticket_price=request.ticket_price,
            ticket_type=request.ticket_type
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/suggest-price")
def suggest_price(request: PriceSuggestionRequest):
    """
    Suggest optimal base price for an event
    
    Returns suggested price and recommended price range
    """
    try:
        result = pricing_optimizer.suggest_base_price(
            category=request.category,
            location=request.location,
            demand_score=request.demand_score,
            capacity=request.capacity
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calculate-dynamic-price")
def calculate_dynamic_price(request: DynamicPriceRequest):
    """
    Calculate dynamic price based on current event metrics
    
    Returns new price, percentage change, and pricing strategy
    """
    try:
        result = pricing_optimizer.calculate_dynamic_price(
            base_price=request.base_price,
            min_price=request.min_price,
            max_price=request.max_price,
            registrations=request.registrations,
            capacity=request.capacity,
            days_until_event=request.days_until_event
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run the server
if __name__ == "__main__":
    import uvicorn
    print(">> Starting Royal Class Events Intelligence Service...")
    print(">> Endpoints available at http://localhost:8000")
    print(">> API docs at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
