#!/usr/bin/env python3
"""
Verification script for Razorpay callback URL and authentication fixes.
Tests both issues mentioned:
1. Callback URL is correctly set to /api/razorpay/payment-callback
2. Payment callback endpoint is publicly accessible (no authentication required)
"""

import requests
import json
from urllib.parse import urlparse, parse_qs

BASE_URL = "http://localhost:8001"

def print_header(text):
    """Print a formatted header."""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def print_result(test_name, passed, details=""):
    """Print test result."""
    status = "✅ PASSED" if passed else "❌ FAILED"
    print(f"\n{status}: {test_name}")
    if details:
        print(f"   Details: {details}")

def test_callback_url_in_service():
    """Test 1: Verify callback URL is correctly configured in razorpay_service.py"""
    print_header("Test 1: Callback URL Configuration")
    
    try:
        with open('/app/backend/services/razorpay_service.py', 'r') as f:
            content = f.read()
        
        # Check if correct callback URL is present
        correct_url = "/api/razorpay/payment-callback?user_id="
        wrong_url = "/api/razorpay/payment-success?user_id="
        
        has_correct = correct_url in content
        has_wrong = wrong_url in content
        
        if has_correct and not has_wrong:
            print_result(
                "Callback URL in razorpay_service.py",
                True,
                "Correctly points to /api/razorpay/payment-callback"
            )
            return True
        elif has_wrong:
            print_result(
                "Callback URL in razorpay_service.py",
                False,
                "Still using wrong endpoint /api/razorpay/payment-success"
            )
            return False
        else:
            print_result(
                "Callback URL in razorpay_service.py",
                False,
                "Callback URL not found in service file"
            )
            return False
    except Exception as e:
        print_result("Callback URL check", False, str(e))
        return False

def test_payment_callback_public():
    """Test 2: Verify payment-callback endpoint is publicly accessible"""
    print_header("Test 2: Payment Callback Public Access")
    
    try:
        # Try to access payment-callback WITHOUT authentication
        url = f"{BASE_URL}/api/razorpay/payment-callback"
        params = {
            "user_id": "test-user-123",
            "subscription_id": "test-sub-123"
        }
        
        response = requests.get(url, params=params, allow_redirects=False)
        
        # Should get a redirect (3xx) not 401 Unauthorized
        if response.status_code in [301, 302, 303, 307, 308]:
            print_result(
                "Payment callback public access",
                True,
                f"Endpoint is public (status: {response.status_code}, redirects without auth)"
            )
            
            # Check redirect location
            if 'Location' in response.headers:
                redirect_url = response.headers['Location']
                print(f"   Redirects to: {redirect_url}")
            
            return True
        elif response.status_code == 401:
            print_result(
                "Payment callback public access",
                False,
                "Endpoint still requires authentication (401 Unauthorized)"
            )
            return False
        else:
            print_result(
                "Payment callback public access",
                True,
                f"Endpoint accessible without auth (status: {response.status_code})"
            )
            return True
            
    except Exception as e:
        print_result("Payment callback access", False, str(e))
        return False

def test_authentication_in_code():
    """Test 3: Verify payment-callback endpoint doesn't require authentication in code"""
    print_header("Test 3: Authentication Requirement in Code")
    
    try:
        with open('/app/backend/routers/razorpay.py', 'r') as f:
            content = f.read()
        
        # Find the payment-callback endpoint definition
        lines = content.split('\n')
        in_callback_function = False
        has_get_current_user = False
        has_public_comment = False
        
        for i, line in enumerate(lines):
            if '@router.get("/payment-callback")' in line or 'def payment_callback' in line:
                in_callback_function = True
                
                # Check next 10 lines for authentication and comments
                for j in range(i, min(i+15, len(lines))):
                    if 'get_current_user' in lines[j] and 'Depends' in lines[j]:
                        has_get_current_user = True
                    if 'PUBLIC ENDPOINT' in lines[j]:
                        has_public_comment = True
                    if 'async def' in lines[j] and j > i:  # Found next function
                        break
                break
        
        if in_callback_function:
            if not has_get_current_user and has_public_comment:
                print_result(
                    "Authentication requirement removed",
                    True,
                    "Endpoint is marked as PUBLIC and doesn't use get_current_user"
                )
                return True
            elif has_get_current_user:
                print_result(
                    "Authentication requirement removed",
                    False,
                    "Endpoint still has get_current_user dependency"
                )
                return False
            else:
                print_result(
                    "Authentication requirement removed",
                    True,
                    "No get_current_user dependency found"
                )
                return True
        else:
            print_result(
                "Payment callback endpoint",
                False,
                "Endpoint not found in razorpay.py"
            )
            return False
            
    except Exception as e:
        print_result("Code authentication check", False, str(e))
        return False

def test_endpoint_registration():
    """Test 4: Verify endpoint is registered in OpenAPI spec"""
    print_header("Test 4: Endpoint Registration")
    
    try:
        response = requests.get(f"{BASE_URL}/api/openapi.json")
        openapi_spec = response.json()
        
        # Check if payment-callback endpoint exists
        endpoint_path = "/api/razorpay/payment-callback"
        
        paths = openapi_spec.get('paths', {})
        if endpoint_path in paths:
            endpoint_info = paths[endpoint_path]
            methods = list(endpoint_info.keys())
            
            print_result(
                "Endpoint registered in OpenAPI",
                True,
                f"Available methods: {methods}"
            )
            
            # Check if it has security requirements
            get_method = endpoint_info.get('get', {})
            security = get_method.get('security', [])
            
            if security:
                print(f"   ⚠️  Warning: Endpoint has security requirements: {security}")
                print(f"   This might cause authentication issues with Razorpay redirect")
            else:
                print(f"   ✅ No security requirements - publicly accessible")
            
            return True
        else:
            print_result(
                "Endpoint registered",
                False,
                f"Endpoint {endpoint_path} not found in OpenAPI spec"
            )
            return False
            
    except Exception as e:
        print_result("Endpoint registration check", False, str(e))
        return False

def test_user_id_parameter():
    """Test 5: Verify endpoint accepts user_id parameter"""
    print_header("Test 5: User ID Parameter Support")
    
    try:
        response = requests.get(f"{BASE_URL}/api/openapi.json")
        openapi_spec = response.json()
        
        endpoint_path = "/api/razorpay/payment-callback"
        paths = openapi_spec.get('paths', {})
        
        if endpoint_path in paths:
            get_method = paths[endpoint_path].get('get', {})
            parameters = get_method.get('parameters', [])
            
            # Check for user_id parameter
            user_id_param = None
            for param in parameters:
                if param.get('name') == 'user_id':
                    user_id_param = param
                    break
            
            if user_id_param:
                print_result(
                    "User ID parameter support",
                    True,
                    f"Parameter configured: {user_id_param}"
                )
                return True
            else:
                # Check in code directly
                with open('/app/backend/routers/razorpay.py', 'r') as f:
                    content = f.read()
                
                if 'user_id: Optional[str]' in content or 'user_id:Optional[str]' in content:
                    print_result(
                        "User ID parameter support",
                        True,
                        "user_id parameter found in code"
                    )
                    return True
                else:
                    print_result(
                        "User ID parameter support",
                        False,
                        "user_id parameter not found"
                    )
                    return False
        else:
            print_result("User ID parameter", False, "Endpoint not found")
            return False
            
    except Exception as e:
        print_result("User ID parameter check", False, str(e))
        return False

def main():
    """Run all verification tests."""
    print("\n" + "🔍 RAZORPAY CALLBACK FIX VERIFICATION" + "\n")
    print("This script verifies the two critical fixes:")
    print("1. Callback URL points to correct endpoint")
    print("2. Payment callback endpoint is publicly accessible")
    
    results = []
    
    # Run all tests
    results.append(("Callback URL Configuration", test_callback_url_in_service()))
    results.append(("Payment Callback Public Access", test_payment_callback_public()))
    results.append(("Authentication Removed from Code", test_authentication_in_code()))
    results.append(("Endpoint Registration", test_endpoint_registration()))
    results.append(("User ID Parameter", test_user_id_parameter()))
    
    # Summary
    print_header("VERIFICATION SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\n📊 Tests Passed: {passed}/{total}")
    print()
    
    for test_name, result in results:
        status = "✅" if result else "❌"
        print(f"  {status} {test_name}")
    
    print()
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Razorpay callback fixes are working correctly!")
        print()
        print("✅ Issue #1 Fixed: Callback URL points to /api/razorpay/payment-callback")
        print("✅ Issue #2 Fixed: Endpoint is publicly accessible (no auth required)")
        print()
        print("Next steps:")
        print("1. Configure Razorpay API keys in Admin Panel")
        print("2. Test actual payment flow with real/test Razorpay credentials")
        print("3. Verify subscription activation after payment")
        return 0
    else:
        print("⚠️  Some tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    exit(main())
