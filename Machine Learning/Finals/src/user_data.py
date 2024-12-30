import json
import httpx
from urllib.parse import quote
import jmespath

def parse_post(data):
    result = jmespath.search("""{
        src: display_url,
        is_video: is_video,
        views: video_view_count,
        likes: edge_media_preview_like.count,
        comments_count: edge_media_to_comment.count,
        timestamp: taken_at_timestamp
        captions: edge_media_to_caption.edges[].node.text
    }""", data)
    return result
    # return data

    
def scrape_user_posts(user_id: str, session: httpx.Client, page_size=12, max_pages: int = None):
    base_url = "https://www.instagram.com/graphql/query/?query_hash=e769aa130647d2354c40ea6a439bfc08&variables="
    variables = {
        "id": user_id,
        "first": page_size,
        "after": None,
    }
    _page_number = 1
    while True:
        resp = session.get(base_url + quote(json.dumps(variables)))
        data = resp.json()
        posts = data["data"]["user"]["edge_owner_to_timeline_media"]
        for post in posts["edges"]:
            yield parse_post(post["node"])  # note: we're using parse_post function from previous chapter
        page_info = posts["page_info"]
        if _page_number == 1:
            print(f"scraping total {posts['count']} posts of {user_id}")
        else:
            print(f"scraping page {_page_number}")
        if not page_info["has_next_page"]:
            break
        if variables["after"] == page_info["end_cursor"]:
            break
        variables["after"] = page_info["end_cursor"]
        _page_number += 1     
        if max_pages and _page_number > max_pages:
            break


accounts = {
#   "iso": 8741519213,
#   "csc": 59553251858,
#   "uaa": 3910690947,
#   "sac": 10494367845,
#   "fasa": 377046387,
#   "enactus": 2153684478,
#   "bsu": 1539694207,
#   "bio": 24730311201,
#   "chem": 66030994967,
#   "ivcf": 8565841648,
#   "sga": 649170238,
}

# Example run:
if __name__ == "__main__":
    # for key, val in accounts.items():
    with httpx.Client(timeout=httpx.Timeout(20.0)) as session:
    #   posts = list(scrape_user_posts(f"{val}", session, max_pages=3))
        posts = list(scrape_user_posts("8565841648", session, max_pages=3))
        print(json.dumps(posts, indent=2, ensure_ascii=False))
    #   with open(f"../data/result_{key}.json", "w", encoding="utf-8") as f:
        with open(f"result_uaa.json", "w", encoding="utf-8") as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)