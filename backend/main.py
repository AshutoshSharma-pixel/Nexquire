from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from backend.routers import auth, onboarding, portfolio, ai_services, market_news, market_data, portfolio_xray

app = FastAPI(title="Nexquire API", description="India's first age-aware, market-aware, and geopolitically intelligent investment advisor")

# Register Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(portfolio.router, prefix="/api/portfolio/legacy", tags=["portfolio"])
app.include_router(portfolio_xray.router, prefix="/api/portfolio", tags=["xray"])
app.include_router(ai_services.router, prefix="/api/ai", tags=["ai"])
app.include_router(market_news.router, prefix="/api/news", tags=["news"])
app.include_router(market_data.router, prefix="/api/market", tags=["market"])
# app.include_router(ai_services.chat_router)
# app.include_router(ai_services.tax_router)
# app.include_router(ai_services.broker_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Nexquire API — Invest with Intelligence"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/market-pulse")
async def market_pulse():
    from backend.services.nse_service import nse_service
    return nse_service.get_market_pulse()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
