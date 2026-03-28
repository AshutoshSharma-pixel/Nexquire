from crewai import Agent, Task, Crew, Process
from langchain_anthropic import ChatAnthropic
import os

class PoliticalSignalAgent:
    def __init__(self):
        self.llm = "anthropic/claude-3-5-sonnet-20240620"
        self.agent = Agent(
            role='Political Signal Analyst',
            goal='Detect market-moving signals from statements of key global and Indian political/corporate figures.',
            backstory="""You are an expert in political economy. You monitor handles like @PMOIndia, @FinMinIndia, @RBI, @FederalReserve, 
            and statements from major promoters like Ambani/Adani. You distinguish between noise and real policy shifts.""",
            verbose=True,
            llm=self.llm
        )

    def analyze_signals(self, statements: list):
        context = "\n".join(statements)
        
        task = Task(
            description=f"""
            Analyze these recent political/corporate statements:
            {context}
            
            Identify any 'signals' that indicate a policy shift, tariff change, or interest rate movement.
            Deliver an alert with:
            - type: "political"
            - severity: "🔴 Act Now" | "🟡 Watch" | "🟢 Opportunity" | "ℹ️ FYI"
            - title: The signal detected
            - body: Impact on Indian retail investors
            - recommended_action: What to do
            """,
            agent=self.agent,
            expected_output="A summary of the political signal and its impact."
        )

        crew = Crew(agents=[self.agent], tasks=[task])
        return str(crew.kickoff())

political_signal_agent = PoliticalSignalAgent()
