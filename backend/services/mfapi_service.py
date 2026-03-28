import httpx
from typing import List, Dict, Optional

class MFAPIService:
    BASE_URL = "https://api.mfapi.in/mf"

    async def get_all_funds(self):
        async with httpx.AsyncClient() as client:
            response = await client.get(self.BASE_URL)
            return response.json()

    async def get_fund_details(self, scheme_code: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.BASE_URL}/{scheme_code}")
            return response.json()

    async def get_latest_nav(self, scheme_code: str):
        data = await self.get_fund_details(scheme_code)
        if data and "data" in data and len(data["data"]) > 0:
            return float(data["data"][0]["nav"])
        return None

mfapi_service = MFAPIService()
