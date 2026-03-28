import os
from newsapi import NewsApiClient
from dotenv import load_dotenv

load_dotenv()

class NewsService:
    def __init__(self):
        self.api_key = os.environ.get("NEWS_API_KEY")
        if not self.api_key:
            # Fallback or mock for demonstration
            self.api_key = "MOCK_KEY"
        self.newsapi = NewsApiClient(api_key=self.api_key)

    def get_geopolitical_news(self, query="wars OR sanctions OR central bank OR FII flow"):
        try:
            return self.newsapi.get_everything(q=query, language='en', sort_by='publishedAt')
        except Exception as e:
            print(f"Error fetching news: {e}")
            return {"articles": []}

news_service = NewsService()
