from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserOnboarding(BaseModel):
    age: int
    income: float
    monthly_investable: float
    goal: str
    knowledge_level: str
    risk_score: int
    broker_preference: Optional[str] = None

class UserProfile(UserOnboarding):
    id: str
    email: str
    created_at: datetime = Field(default_factory=datetime.now)

class InvestmentBlueprint(BaseModel):
    allocation_split: dict
    recommendation_reasoning: str
    risk_category: str
