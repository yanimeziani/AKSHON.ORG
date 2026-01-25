from playwright.sync_api import sync_playwright

def run(playwright):
    print("Launching browser...")
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 1280, "height": 720})
    print("Navigating to http://localhost:3000...")
    page.goto("http://localhost:3000")

    print("Clicking 'Get Edge' button...")
    # Wait for the "Get Edge" button and click it
    page.get_by_role("button", name="Get Edge").click()

    print("Waiting for modal...")
    # Wait for the modal to appear.
    # It contains text "Acquire Access"
    locator = page.get_by_text("Acquire Access")
    locator.wait_for(state="visible")
    print("Modal text found and visible.")

    # Wait a bit for opacity transition
    page.wait_for_timeout(1000)

    print("Taking screenshot...")
    # Take a screenshot
    page.screenshot(path="verification/get_edge_modal_2.png")

    browser.close()
    print("Done.")

with sync_playwright() as playwright:
    run(playwright)
