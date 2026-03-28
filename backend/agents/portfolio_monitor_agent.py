from crewai import Agent, Task, Crew, Process
from langchain_anthropic import ChatAnthropic
from backend.services.firebase_service import get_portfolio
import os

class PortfolioMonitorAgent:
    def __init__(self):
        self.llm = "anthropic/claude-3-5-sonnet-20240620"
        self.agent = Agent(
            role='Portfolio Auditor',
            goal='Monitor user portfolios for underperformance or fundamental changes in underlying funds.',
            backstory="""You are a meticulous auditor of mutual funds. 
            You watch for fund manager changes, AUM crossing critical limits (like ₹50,000 Cr for small caps), 
            and underperformance relative to category benchmarks over 6-12 months.""",
            verbose=True,
            llm=self.llm
        )

    def monitor_portfolio(self, user_id: str):
        portfolio = get_portfolio(user_id)
        # Mocking an observation for the demo
        observation = "Nippon India Small Cap Fund manager changed 2 months ago. AUM is rising fast."
        
        task = Task(
            description=f"""
            Audit this user's portfolio and recent fund observations:
            User ID: {user_id}
            Observations: {observation}
            
            Identify any 'Rebalancing Alerts'. 
            Does the user need to switch funds? 
            Deliver a clear 'Action Required' or 'No Action Needed' summary.
            """,
            agent=self.agent,
            expected_output="A portfolio monitoring report."
        )

        crew = Crew(agents=[self.agent], tasks=[task])
        return str(crew.kickoff())

portfolio_monitor_agent = PortfolioMonitorAgent()
