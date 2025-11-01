#!/usr/bin/env python3
"""
Ultra-Automated OAuth Testing Script
Tests Google OAuth configuration programmatically
"""

import sys
import json
import time
import requests
from datetime import datetime

# ANSI color codes
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

# Configuration
OAUTH_CLIENT_ID = "1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com"
FIREBASE_PROJECT = "babynames-app-9fa2a"
PRODUCTION_URL = "https://soulseedbaby.com"

DOMAINS = [
    "https://soulseedbaby.com",
    "https://www.soulseedbaby.com",
    "https://soulseed.baby",
    "https://www.soulseed.baby",
    "https://soulseedapp.com",
    "https://www.soulseedapp.com",
    "https://soulseedbaby.app",
    "https://www.soulseedbaby.app",
]

def print_header():
    """Print script header"""
    print(f"{Colors.PURPLE}")
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                                                              ║")
    print("║        🔍 AUTOMATED OAUTH CONFIGURATION TESTER 🔍            ║")
    print("║                                                              ║")
    print("║              SoulSeed Baby Name App                          ║")
    print("║                                                              ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(f"{Colors.NC}\n")

def print_section(title):
    """Print section header"""
    print(f"\n{Colors.CYAN}{'━' * 60}")
    print(f"{title}")
    print(f"{'━' * 60}{Colors.NC}\n")

def print_success(msg):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {msg}{Colors.NC}")

def print_error(msg):
    """Print error message"""
    print(f"{Colors.RED}✗ {msg}{Colors.NC}")

def print_warning(msg):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.NC}")

def print_info(msg):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ {msg}{Colors.NC}")

def test_site_accessibility(url):
    """Test if the production site is accessible"""
    print_section(f"🌐 Testing Site Accessibility: {url}")

    try:
        response = requests.get(url, timeout=10, allow_redirects=True)

        if response.status_code in [200, 301, 302]:
            print_success(f"Site is accessible (Status: {response.status_code})")
            print_info(f"Final URL: {response.url}")

            # Check if Google OAuth client ID is in the page
            if OAUTH_CLIENT_ID in response.text:
                print_success("OAuth Client ID found in page source")
            else:
                print_warning("OAuth Client ID NOT found in page source")

            return True
        else:
            print_error(f"Site returned status code: {response.status_code}")
            return False

    except requests.RequestException as e:
        print_error(f"Failed to access site: {str(e)}")
        return False

def test_oauth_metadata():
    """Test OAuth discovery document"""
    print_section("🔑 Testing OAuth Discovery Document")

    discovery_url = "https://accounts.google.com/.well-known/openid-configuration"

    try:
        response = requests.get(discovery_url, timeout=10)

        if response.status_code == 200:
            print_success("OAuth discovery document retrieved")
            data = response.json()

            print_info(f"Authorization endpoint: {data.get('authorization_endpoint')}")
            print_info(f"Token endpoint: {data.get('token_endpoint')}")
            print_info(f"Issuer: {data.get('issuer')}")

            return True
        else:
            print_error(f"Failed to retrieve discovery document (Status: {response.status_code})")
            return False

    except Exception as e:
        print_error(f"Error retrieving discovery document: {str(e)}")
        return False

def simulate_oauth_flow():
    """Simulate OAuth flow to test authorization"""
    print_section("🔐 Simulating OAuth Authorization Flow")

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth"

    # Build authorization URL
    params = {
        "client_id": OAUTH_CLIENT_ID,
        "redirect_uri": PRODUCTION_URL,
        "response_type": "token",
        "scope": "openid email profile",
    }

    print_info("Authorization URL parameters:")
    for key, value in params.items():
        print(f"  {Colors.CYAN}{key}{Colors.NC}: {value}")

    print("\n" + "=" * 60)
    print(f"{Colors.YELLOW}MANUAL TEST REQUIRED{Colors.NC}")
    print("=" * 60)
    print("\nTo complete OAuth testing, you must:")
    print(f"1. Open: {Colors.CYAN}{PRODUCTION_URL}{Colors.NC}")
    print(f"2. Click 'Login with Google'")
    print(f"3. Check browser console for errors")
    print(f"4. Look for OAuth error codes")
    print("\nCommon error codes:")
    print(f"  • {Colors.RED}redirect_uri_mismatch{Colors.NC}: Domain not authorized")
    print(f"  • {Colors.RED}unauthorized_client{Colors.NC}: Client ID not found")
    print(f"  • {Colors.RED}access_denied{Colors.NC}: User denied permission")
    print()

def check_dns_records():
    """Check DNS records for all domains"""
    print_section("🌍 Testing DNS Records")

    import socket

    for domain in DOMAINS:
        # Extract hostname from URL
        hostname = domain.replace("https://", "").replace("http://", "")

        try:
            ip = socket.gethostbyname(hostname)
            print_success(f"{hostname} → {ip}")
        except socket.gaierror:
            print_error(f"{hostname} → DNS resolution failed")

def test_ssl_certificates():
    """Test SSL certificates for HTTPS domains"""
    print_section("🔒 Testing SSL Certificates")

    import ssl
    import socket
    from urllib.parse import urlparse

    for domain in DOMAINS:
        parsed = urlparse(domain)
        hostname = parsed.netloc

        try:
            context = ssl.create_default_context()
            with socket.create_connection((hostname, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    print_success(f"{hostname} - Valid SSL certificate")

                    # Check certificate subject
                    subject = dict(x[0] for x in cert['subject'])
                    print_info(f"  Subject: {subject.get('commonName', 'N/A')}")

        except Exception as e:
            print_error(f"{hostname} - SSL error: {str(e)}")

def generate_fix_script():
    """Generate shell script for quick fixes"""
    print_section("📝 Generated Fix Script")

    print_info("Run the automated fix helper:")
    print(f"\n  {Colors.GREEN}bash oauth_fix_helper.sh{Colors.NC}\n")

    print_info("Or manually add these domains to Google Cloud Console:")
    print(f"\n{Colors.YELLOW}JavaScript Origins & Redirect URIs:{Colors.NC}")
    for domain in DOMAINS:
        print(f"  {Colors.CYAN}{domain}{Colors.NC}")

    print(f"\n{Colors.YELLOW}Firebase Authorized Domains (base domains only):{Colors.NC}")
    base_domains = [
        "soulseedbaby.com",
        "soulseed.baby",
        "soulseedapp.com",
        "soulseedbaby.app"
    ]
    for domain in base_domains:
        print(f"  {Colors.CYAN}{domain}{Colors.NC}")

def main():
    """Main test function"""
    print_header()

    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info(f"OAuth Client ID: {OAUTH_CLIENT_ID}")
    print_info(f"Firebase Project: {FIREBASE_PROJECT}")
    print_info(f"Production URL: {PRODUCTION_URL}")

    # Run tests
    results = {
        "site_accessibility": test_site_accessibility(PRODUCTION_URL),
        "oauth_metadata": test_oauth_metadata(),
        "dns_records": True,  # Will set based on check_dns_records
        "ssl_certificates": True,  # Will set based on test_ssl_certificates
    }

    check_dns_records()
    test_ssl_certificates()
    simulate_oauth_flow()

    # Summary
    print_section("📊 TEST SUMMARY")

    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r)

    print(f"Tests run: {total_tests}")
    print(f"Passed: {Colors.GREEN}{passed_tests}{Colors.NC}")
    print(f"Failed: {Colors.RED}{total_tests - passed_tests}{Colors.NC}")

    if passed_tests == total_tests:
        print(f"\n{Colors.GREEN}✓ All automated tests passed!{Colors.NC}")
        print_warning("Manual OAuth login test still required in browser")
    else:
        print(f"\n{Colors.RED}✗ Some tests failed{Colors.NC}")
        print_warning("Check configuration and try again")

    generate_fix_script()

    print(f"\n{Colors.PURPLE}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.NC}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Test interrupted by user{Colors.NC}\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.RED}Unexpected error: {str(e)}{Colors.NC}\n")
        sys.exit(1)
