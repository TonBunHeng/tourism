import re
import requests
from typing import List, Dict, Any

class WebSearchService:
    """
    Live Google / Web Search Service for Cambodia Tourism.
    Fetches real-time search snippets from the web when local database lacks exact coverage.
    """
    def search_google_web(self, query: str, max_results: int = 4) -> List[Dict[str, Any]]:
        """Perform a live web search for the given query."""
        if not query or not query.strip():
            return []

        q = query.strip()
        # Keep query natural; only augment if specific to Cambodia but ambiguous
        lowered = q.lower()
        is_cambodia_topic = any(w in lowered for w in ["cambodia", "khmer", "phnom penh", "angkor", "siem reap", "កម្ពុជា", "ខ្មែរ"])
        search_query = q
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        results = []

        # 1. Try DuckDuckGo Instant Search / HTML API
        try:
            url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(search_query)}"
            res = requests.get(url, headers=headers, timeout=4)
            if res.status_code == 200:
                html = res.text
                
                # Regex match for result snippets
                snippets = re.findall(r'<a class="result__snippet[^">]*>(.*?)</a>', html, re.DOTALL)
                titles = re.findall(r'<a class="result__a"[^">]*>(.*?)</a>', html, re.DOTALL)
                urls = re.findall(r'<a class="result__url"[^">]*>(.*?)</a>', html, re.DOTALL)
                for i in range(min(len(titles), len(snippets))):
                    clean_title = re.sub(r'<[^>]+>', '', titles[i]).strip()
                    clean_snippet = re.sub(r'<[^>]+>', '', snippets[i]).strip()
                    clean_url = urls[i].strip() if i < len(urls) else ""
                    full_url = f"https://{clean_url}" if clean_url and not clean_url.startswith("http") else clean_url

                    if clean_title and clean_snippet:
                        res_obj = {
                            "name": clean_title,
                            "title": clean_title,
                            "description": clean_snippet,
                            "snippet": clean_snippet,
                            "location": "Live Google / Web Search",
                            "source_type": "google_web",
                            "category": "Google Search",
                            "url": full_url,
                            "website_links": [{"title": clean_title, "url": full_url}] if full_url else [],
                            "picture_links": []
                        }
                        results.append(res_obj)

                    if len(results) >= max_results:
                        break
        except Exception as e:
            print(f"[WebSearchService] Search error: {e}")

        # 2. Fallback Wikipedia API if DuckDuckGo returned no snippets
        if not results:
            try:
                wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={requests.utils.quote(query)}&format=json"
                res = requests.get(wiki_url, headers=headers, timeout=4)
                if res.status_code == 200:
                    data = res.json()
                    search_list = data.get("query", {}).get("search", [])
                    for item in search_list[:max_results]:
                        clean_title = item.get("title", "")
                        clean_snippet = re.sub(r'<[^>]+>', '', item.get("snippet", "")).strip()
                        wiki_page_url = f"https://en.wikipedia.org/wiki/{requests.utils.quote(clean_title.replace(' ', '_'))}"
                        results.append({
                            "name": clean_title,
                            "title": clean_title,
                            "description": clean_snippet,
                            "snippet": clean_snippet,
                            "location": "Wikipedia Google Search Index",
                            "source_type": "google_web",
                            "category": "Google Search",
                            "url": wiki_page_url,
                            "website_links": [{"title": clean_title, "url": wiki_page_url}],
                            "picture_links": []
                        })
            except Exception as e:
                print(f"[WebSearchService] Wiki fallback error: {e}")

        return results

    def search_outside_knowledge(self, query: str, max_results: int = 4) -> Dict[str, Any]:
        """
        Search outside the local storage when information is missing:
        - Retrieves descriptive text
        - Extracts website links (links only)
        - Extracts picture links (image URL links only)
        - Returns a structured dictionary ready for auto-storing in storage
        """
        clean_q = query.strip()
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        website_links: List[Dict[str, str]] = []
        picture_links: List[Dict[str, str]] = []
        text_snippets: List[str] = []
        discovered_title = clean_q

        # 1. Search Wikipedia for rich summary and image link
        try:
            wiki_search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={requests.utils.quote(clean_q)}&format=json"
            wiki_res = requests.get(wiki_search_url, headers=headers, timeout=4)
            if wiki_res.status_code == 200:
                wiki_data = wiki_res.json()
                search_entries = wiki_data.get("query", {}).get("search", [])
                if search_entries:
                    best_title = search_entries[0].get("title", "")
                    if best_title:
                        discovered_title = best_title
                        # Fetch page extract and image
                        page_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={requests.utils.quote(best_title)}&prop=pageimages|extracts|info&inprop=url&pithumbsize=800&explaintext=1&exintro=1&format=json"
                        p_res = requests.get(page_url, headers=headers, timeout=4)
                        if p_res.status_code == 200:
                            p_data = p_res.json()
                            pages = p_data.get("query", {}).get("pages", {})
                            for pid, page in pages.items():
                                extract = page.get("extract", "").strip()
                                full_page_url = page.get("fullurl") or f"https://en.wikipedia.org/wiki/{requests.utils.quote(best_title.replace(' ', '_'))}"
                                thumb_url = page.get("thumbnail", {}).get("source")

                                if extract:
                                    text_snippets.append(extract)
                                if full_page_url:
                                    website_links.append({
                                        "title": f"{best_title} - Wikipedia",
                                        "url": full_page_url
                                    })
                                if thumb_url:
                                    picture_links.append({
                                        "caption": f"Picture of {best_title}",
                                        "image_url": thumb_url
                                    })
        except Exception as e:
            print(f"[WebSearchService] Wikipedia enrichment note: {e}")

        # 2. Search Web (DuckDuckGo / Google index)
        try:
            web_results = self.search_google_web(query, max_results=max_results)
            for r in web_results:
                snippet = r.get("snippet") or r.get("description", "")
                if snippet and snippet not in text_snippets:
                    text_snippets.append(snippet)
                for wlink in r.get("website_links", []):
                    if wlink.get("url") and not any(l["url"] == wlink["url"] for l in website_links):
                        website_links.append(wlink)
        except Exception as e:
            print(f"[WebSearchService] Web search outside note: {e}")

        # Formulate consolidated description
        combined_text = "\n\n".join(text_snippets[:3]).strip()
        if not combined_text:
            return {}

        # Keywords / Tags
        tags = [w.lower() for w in re.findall(r'\b\w{3,}\b', clean_q)]

        return {
            "name": discovered_title,
            "title": discovered_title,
            "description": combined_text,
            "website_links": website_links[:4],  # Link only
            "picture_links": picture_links[:4],  # Link only
            "tags": list(set(tags)),
            "source": "outside_search"
        }

web_search_service = WebSearchService()
