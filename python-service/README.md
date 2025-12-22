# Royal Class Events - Python Intelligence Service

## 🧠 Overview
This Python microservice provides AI-powered intelligence for the Royal Class Events platform:
- **Demand Prediction**: Predict event success probability
- **Revenue Forecasting**: Estimate ticket sales and revenue
- **Price Optimization**: Suggest optimal pricing
- **Dynamic Pricing**: Real-time price adjustments

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Service
```bash
python main.py
```

The service will start on `http://localhost:8000`

### 3. Test the API
Visit `http://localhost:8000/docs` for interactive API documentation

## 📡 API Endpoints

### POST /predict-demand
Predict demand score for an event

**Request:**
```json
{
  "category": "tech",
  "location": "Dhaka",
  "start_date": "2025-12-25T18:00:00Z",
  "capacity": 100,
  "ticket_type": "paid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "demand_score": 85,
    "confidence": 0.75,
    "factors": {...}
  }
}
```

### POST /forecast-revenue
Forecast revenue based on demand

**Request:**
```json
{
  "demand_score": 85,
  "capacity": 100,
  "ticket_price": 500,
  "ticket_type": "paid"
}
```

### POST /suggest-price
Get optimal pricing suggestion

**Request:**
```json
{
  "category": "tech",
  "location": "Dhaka",
  "demand_score": 85,
  "capacity": 100
}
```

### POST /calculate-dynamic-price
Calculate dynamic price adjustment

**Request:**
```json
{
  "base_price": 500,
  "min_price": 350,
  "max_price": 750,
  "registrations": 45,
  "capacity": 100,
  "days_until_event": 5
}
```

## 🏗️ Architecture

```
python-service/
├── main.py              # FastAPI application
├── models/
│   ├── demand.py        # Demand prediction logic
│   └── pricing.py       # Pricing optimization
└── requirements.txt     # Dependencies
```

## 🔧 Integration with Convex

The Next.js app calls this service via Convex Actions:

1. User creates event in Next.js
2. Convex Action calls `http://localhost:8000/predict-demand`
3. Python service returns demand score
4. Convex stores result in database
5. UI shows prediction to organizer

## 🧪 Testing

Test endpoints with curl:

```bash
# Health check
curl http://localhost:8000/

# Predict demand
curl -X POST http://localhost:8000/predict-demand \
  -H "Content-Type: application/json" \
  -d '{"category":"tech","location":"Dhaka","start_date":"2025-12-25T18:00:00Z","capacity":100,"ticket_type":"paid"}'
```

## 📊 Prediction Logic

### Demand Score Calculation
- **Base Score**: Category popularity (0-100)
- **Location Multiplier**: City-specific adjustment
- **Timing Bonus**: Weekends preferred
- **Capacity Factor**: Smaller events easier to fill
- **Pricing Factor**: Free events score higher

### Dynamic Pricing Strategy
- **Surge Pricing**: >70% sold + >7 days → +15%
- **Scarcity Pricing**: >50% sold + ≤3 days → +10%
- **Early Bird**: <10% sold + ≤7 days → -15%
- **Flash Sale**: <20% sold + ≤2 days → -25%

## 🌐 Deployment Options

### Local (Development)
```bash
python main.py
```

### Google Cloud Run (Production)
```bash
gcloud run deploy royal-events-intelligence \
  --source . \
  --platform managed \
  --region asia-south1
```

## 📝 Notes

- Service runs on port 8000 by default
- CORS enabled for localhost:3000 (Next.js)
- All prices in BDT (Bangladeshi Taka)
- Can be extended with ML models later
