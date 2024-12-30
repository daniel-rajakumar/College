import re
from playwright.sync_api import Playwright, sync_playwright, expect

def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False, slow_mo=500)
    context = browser.new_context(storage_state="state.json")
    page = context.new_page()
    page.goto("https://www.instagram.com/")
    page.get_by_label("Phone number, username, or").click()
    page.get_by_label("Phone number, username, or").fill("MrdotDani")
    page.get_by_label("Password").click()
    page.get_by_label("Password").fill("NuM%RtR*7Efdcm%qHS")
    page.get_by_role("button", name="Log in", exact=True).click()
    page.wait_for_timeout(5000)
    # Save storage state into the file.
    storage = context.storage_state(path="state.json")
    # ---------------------
    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
