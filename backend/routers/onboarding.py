from fastapi import APIRouter, Depends, HTTPException
from backend.models.user import UserOnboarding, InvestmentBlueprint
from backend.agents.profiling_agent import profiling_agent
from backend.services.firebase_service import save_user_profile

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

@router.post("/blueprint", response_model=InvestmentBlueprint)
async def get_investment_blueprint(data: UserOnboarding, user_id: str):
    print(f"[ONBOARDING] Generating blueprint for user: {user_id}")
    try:
        blueprint = profiling_agent.generate_blueprint(data)
        
        profile_data = data.dict()
        profile_data["risk_score"] = data.risk_score
        save_user_profile(user_id, profile_data)
        
        return blueprint
    except Exception as e:
        print(f"[ERROR] Blueprint generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Strategic analysis failed: {str(e)}")
