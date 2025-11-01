#!/usr/bin/env python3
"""
Debug OAuth errors on production site by capturing browser console logs
"""
import json
from playwright.sync_api import sync_playwright

def debug_oauth_production():
    """Navigate to production, capture console logs, and attempt login"""

    console_logs = []
    console_errors = []
    network_errors = []

    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        )
        page = context.new_page()

        # Capture console messages
        def handle_console(msg):
            log_entry = {
                'type': msg.type,
                'text': msg.text,
                'location': msg.location
            }
            console_logs.append(log_entry)

            # Print important logs immediately
            if msg.type in ['error', 'warning'] or '[AUTH]' in msg.text:
                print(f"[CONSOLE {msg.type.upper()}] {msg.text}")
                if msg.type == 'error':
                    console_errors.append(log_entry)

        page.on('console', handle_console)

        # Capture network errors
        def handle_request_failed(request):
            error = {
                'url': request.url,
                'method': request.method,
                'failure': request.failure
            }
            network_errors.append(error)
            print(f"[NETWORK ERROR] {request.method} {request.url} - {request.failure}")

        page.on('requestfailed', handle_request_failed)

        # Navigate to production site
        print("\n" + "="*80)
        print("NAVIGATING TO PRODUCTION SITE: https://soulseedbaby.com")
        print("="*80 + "\n")

        try:
            page.goto('https://soulseedbaby.com', wait_until='networkidle', timeout=30000)
            print("✅ Page loaded successfully\n")

            # Wait a bit for any async initialization
            page.wait_for_timeout(2000)

            # Take initial screenshot
            page.screenshot(path='/tmp/production_initial.png', full_page=True)
            print("📸 Initial screenshot saved: /tmp/production_initial.png\n")

            # Check if Google OAuth is loaded
            print("Checking for Google OAuth initialization...")

            # Look for login button
            login_buttons = page.locator('button:has-text("Login"), button:has-text("Sign in"), [role="button"]:has-text("Google")').all()
            print(f"Found {len(login_buttons)} potential login button(s)\n")

            if login_buttons:
                print("Attempting to trigger login flow...\n")

                # Click the first login button
                login_buttons[0].click()

                # Wait for OAuth popup or error
                page.wait_for_timeout(3000)

                # Take screenshot after click
                page.screenshot(path='/tmp/production_after_login_click.png', full_page=True)
                print("📸 Post-login-click screenshot: /tmp/production_after_login_click.png\n")
            else:
                print("⚠️ No login button found - checking for auto-login or OAuth initialization\n")

            # Check for OAuth errors in the page
            print("Checking page for OAuth error elements...")
            error_elements = page.locator('[class*="error"], [class*="Error"], .toast, [role="alert"]').all()
            for elem in error_elements:
                text = elem.text_content()
                if text and text.strip():
                    print(f"❌ Error element found: {text}\n")

            # Wait a bit more to capture any delayed console logs
            page.wait_for_timeout(2000)

        except Exception as e:
            print(f"❌ Error navigating to production: {e}\n")
            page.screenshot(path='/tmp/production_error.png', full_page=True)

        finally:
            browser.close()

    # Print summary
    print("\n" + "="*80)
    print("DEBUGGING SUMMARY")
    print("="*80 + "\n")

    print(f"Total console logs: {len(console_logs)}")
    print(f"Console errors: {len(console_errors)}")
    print(f"Network errors: {len(network_errors)}\n")

    if console_errors:
        print("="*80)
        print("CONSOLE ERRORS DETAILS:")
        print("="*80)
        for i, error in enumerate(console_errors, 1):
            print(f"\n{i}. {error['text']}")
            if error.get('location'):
                print(f"   Location: {error['location']}")

    if network_errors:
        print("\n" + "="*80)
        print("NETWORK ERRORS DETAILS:")
        print("="*80)
        for i, error in enumerate(network_errors, 1):
            print(f"\n{i}. {error['method']} {error['url']}")
            print(f"   Failure: {error['failure']}")

    # Look for AUTH-related logs
    auth_logs = [log for log in console_logs if '[AUTH]' in log['text']]
    if auth_logs:
        print("\n" + "="*80)
        print("AUTH-RELATED LOGS:")
        print("="*80)
        for log in auth_logs:
            print(f"[{log['type'].upper()}] {log['text']}")

    # Save full logs to file
    with open('/tmp/production_console_logs.json', 'w') as f:
        json.dump({
            'console_logs': console_logs,
            'console_errors': console_errors,
            'network_errors': network_errors,
            'auth_logs': auth_logs
        }, f, indent=2)

    print("\n📝 Full logs saved to: /tmp/production_console_logs.json")
    print("\n" + "="*80)

if __name__ == '__main__':
    debug_oauth_production()
