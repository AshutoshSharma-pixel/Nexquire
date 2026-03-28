from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from backend.routers import auth, onboarding, portfolio, ai_services

app = FastAPI(title="Nexquire API", description="India's first age-aware, market-aware, and geopolitically intelligent investment advisor")

# Register Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(ai_services.router, prefix="/api/ai", tags=["ai"])
# app.include_router(ai_services.chat_router)
# app.include_router(ai_services.tax_router)
# app.include_router(ai_services.broker_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
