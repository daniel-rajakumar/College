import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(storage_state="state.json")
    page = context.new_page()
    page.goto("https://www.instagram.com/isoramapo/")

    print("Selector found")
    page.wait_for_timeout(1000)
    print("Timeout done")

    page.get_by_role("link", name="Photo by International Student Org. in Ramapo College of New Jersey with @jenn.").click()

    page.wait_for_timeout(1000)
    page.keyboard.press("ArrowRight")

    # for i in range(10):
    #     page.wait_for_timeout(1000)
    #     page.keyboard.press("ArrowRight")



    # context.close()
    # browser.close()

    page.wait_for_timeout(500000)
with sync_playwright() as playwright:
    run(playwright)
