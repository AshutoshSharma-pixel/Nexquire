from crewai import Agent, Task, Crew, Process
from langchain_anthropic import ChatAnthropic
from backend.models.user import UserOnboarding, InvestmentBlueprint
import os

class ProfilingAgent:
    def __init__(self):
        # We use Gemini 2.0 Flash for unprecedented speed and reasoning 🚀
        # CrewAI will use the GOOGLE_API_KEY from environment
        self.llm = "google/gemini-2.0-flash-exp"
        self.agent = Agent(
            role='Wealth Profiling Specialist',
            goal='Generate a personalized investment blueprint based on user age, goals, and risk profile.',
            backstory="""You are a senior investment advisor at Nexquire. 
            You specialize in creating long-term wealth strategies for retail investors in India. 
            You understand the nuances of the Indian market and age-aware allocation.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )

    def get_allocation_split(self, age: int):
        if 18 <= age <= 23:
            return {"Small Cap": 70, "Mid Cap": 30, "Large Cap": 0, "Debt": 0, "Gold": 0}
        elif 24 <= age <= 28:
            return {"Small Cap": 40, "Mid Cap": 40, "Large Cap": 20, "Debt": 0, "Gold": 0}
        elif 29 <= age <= 35:
            return {"Small Cap": 30, "Mid Cap": 40, "Large Cap": 30, "Debt": 0, "Gold": 0}
        elif 36 <= age <= 45:
            return {"Small Cap": 20, "Mid Cap": 30, "Large Cap": 40, "Debt": 10, "Gold": 0}
        else:
            return {"Small Cap": 10, "Mid Cap": 20, "Large Cap": 50, "Debt": 15, "Gold": 5}

    def generate_blueprint(self, onboarding_data: UserOnboarding) -> InvestmentBlueprint:
        allocation = self.get_allocation_split(onboarding_data.age)
        
        task = Task(
            description=f"""
            Analyze the following user profile and provide a professional, plain-English summary of their investment strategy.
            User Profile:
            - Age: {onboarding_data.age}
            - Goal: {onboarding_data.goal}
            - Knowledge Level: {onboarding_data.knowledge_level}
            - Risk Score: {onboarding_data.risk_score}
            - Suggested Allocation: {allocation}
            
            Deliver a clear reasoning for why this split is suitable for their age and goal. 
            Avoid heavy jargon. Explain things like a helpful friend who is also a world-class advisor.
            """,
            agent=self.agent,
            expected_output="A concise investment strategy summary with reasoning."
        )

        # Fallback logic for missing/placeholder API key
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key or api_key == "your_key_here":
            print("[WARNING] GOOGLE_API_KEY is not set. Using rule-based fallback blueprint.")
            return InvestmentBlueprint(
                allocation_split=allocation,
                recommendation_reasoning=f"Based on your age ({onboarding_data.age}) and {onboarding_data.goal} goal, we suggest a high-conviction conviction split. AI-driven qualitative analysis is currently in standby mode (API key pending), but your mathematical foundation is optimized for {risk_category.lower()} growth.",
                risk_category=risk_category
            )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            process=Process.sequential
        )

        result = crew.kickoff()
        
        # Determine risk category
        risk_category = "Aggressive" if onboarding_data.risk_score > 7 else "Moderate" if onboarding_data.risk_score > 4 else "Conservative"

        return InvestmentBlueprint(
            allocation_split=allocation,
            recommendation_reasoning=str(result),
            risk_category=risk_category
        )

profiling_agent = ProfilingAgent()
