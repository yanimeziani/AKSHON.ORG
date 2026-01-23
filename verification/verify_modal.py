from playwright.sync_api import sync_playwright, expect
import time

def verify_modal(page):
    print("Navigating to home page...")
    page.goto("http://localhost:3000")

    # Wait for hydration
    time.sleep(2)

    print("Clicking 'Get Edge' button...")
    # There are multiple buttons, let's target the one in Navbar
    get_edge_btn = page.get_by_role("button", name="Get Edge").first
    get_edge_btn.click()

    print("Waiting for modal...")
    # The modal has text "Acquire Access" or similar
    # Inside GetEdgeJourney: "Acquire Access"
    modal_heading = page.get_by_role("heading", name="Acquire Access")
    expect(modal_heading).to_be_visible(timeout=10000)

    print("Taking screenshot...")
    page.screenshot(path="verification/modal_open.png")
    print("Done.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_modal(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
