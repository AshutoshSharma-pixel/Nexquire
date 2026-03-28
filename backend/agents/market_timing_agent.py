from crewai import Agent, Task, Crew, Process
from langchain_anthropic import ChatAnthropic
from backend.services.nse_service import nse_service
import os

class MarketTimingAgent:
    def __init__(self):
        self.llm = "anthropic/claude-3-5-sonnet-20240620"
        self.agent = Agent(
            role='Market Timing Analyst',
            goal='Determine the best way to deploy capital based on market valuations and sentiment.',
            backstory="""You are a pro at market psychology and valuations. You look at Nifty PE and FII/DII flows. 
            You prevent retail investors from panic-selling at the bottom or over-buying at the top.""",
            verbose=True,
            llm=self.llm
        )

    def get_market_recommendation(self):
        pe = nse_service.get_nifty_pe()
        flows = nse_service.get_fii_dii_flow()
        
        task = Task(
            description=f"""
            Analyze current market conditions:
            - Nifty 50 PE: {pe}
            - FII/DII Flow: {flows}
            
            Based on historical data:
            - PE < 18: Aggressive Lump sum
            - PE 18-22: Moderate deployment
            - PE 22-26: SIP/STP preferred
            - PE > 26: High caution, park in Liquid/Debt
            
            Deliver a clear 'Recommended Action' (Lump sum vs SIP vs STP) with a 2-sentence 'Why' for a retail investor.
            """,
            agent=self.agent,
            expected_output="A market timing recommendation with reasoning."
        )

        crew = Crew(agents=[self.agent], tasks=[task])
        return str(crew.kickoff())

market_timing_agent = MarketTimingAgent()
