from fastapi import APIRouter
import httpx
import xml.etree.ElementTree as ET
import time
from typing import List, Dict

router = APIRouter()

# RSS feeds from top Indian financial news sources
RSS_FEEDS = [
    {
        "source": "Economic Times",
        "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    },
    {
        "source": "Moneycontrol",
        "url": "https://www.moneycontrol.com/rss/marketreports.xml",
    },
    {
        "source": "LiveMint",
        "url": "https://www.livemint.com/rss/markets",
    },
    {
        "source": "NDTV Profit",
        "url": "https://feeds.feedburner.com/ndtvprofit-latest",
    },
    {
        "source": "Business Standard",
        "url": "https://www.business-standard.com/rss/markets-106.rss",
    },
]

# Simple cache
_news_cache: Dict = {}
NEWS_CACHE_TTL = 120  # 2 minutes


def _parse_feed(xml_text: str, source: str) -> List[Dict]:
    items = []
    try:
        root = ET.fromstring(xml_text)
        channel = root.find("channel")
        if channel is None:
            channel = root
        for item in channel.findall("item")[:5]:
            title = item.findtext("title", "").strip()
            link = item.findtext("link", "").strip()
            pub_date = item.findtext("pubDate", "").strip()
            if title and link:
                items.append({
                    "title": title,
                    "link": link,
                    "pubDate": pub_date,
                    "source": source,
                })
    except Exception:
        pass
    return items


@router.get("/live")
async def get_live_news():
    cached = _news_cache.get("live_news")
    if cached and (time.time() - cached["ts"]) < NEWS_CACHE_TTL:
        return cached["data"]

    all_news = []
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        for feed in RSS_FEEDS:
            try:
                response = await client.get(
                    feed["url"],
                    headers={"User-Agent": "Mozilla/5.0 (Nexquire/1.0)"}
                )
                if response.status_code == 200:
                    items = _parse_feed(response.text, feed["source"])
                    all_news.extend(items)
            except Exception:
                continue

    result = {"articles": all_news, "count": len(all_news), "cached_at": int(time.time())}
    _news_cache["live_news"] = {"data": result, "ts": time.time()}
    return result
