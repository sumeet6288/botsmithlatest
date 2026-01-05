#!/usr/bin/env python3
"""
Verify the TWO EXACT issues mentioned by user:
1. No callback URL is being sent to Razorpay during subscription creation
2. The payment-callback endpoint requires authentication but Razorpay won't have the user's token
"""

import re

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80 + "\n")

def check_issue_1():
    """
    Issue #1: No callback URL is being sent to Razorpay during subscription creation
    """
    print_section("ISSUE #1: Callback URL Being Sent to Razorpay")
    
    print("Checking: /app/backend/services/razorpay_service.py")
    print("Function: create_subscription()\n")
    
    with open('/app/backend/services/razorpay_service.py', 'r') as f:
        content = f.read()
    
    # Find the create_subscription method
    method_match = re.search(r'async def create_subscription.*?(?=\n    async def|\Z)', content, re.DOTALL)
    
    if not method_match:
        print("❌ FAILED: Could not find create_subscription method")
        return False
    
    method_code = method_match.group(0)
    
    # Check if callback_url is added to data dictionary
    has_callback_url = 'data["callback_url"]' in method_code or "data['callback_url']" in method_code
    has_callback_method = 'data["callback_method"]' in method_code or "data['callback_method']" in method_code
    
    # Check if callback is conditional on user_id
    has_user_id_check = 'if user_id:' in method_code
    
    # Check if data is sent to Razorpay with json=data
    sends_data = 'json=data' in method_code
    
    print("Verification Steps:")
    print(f"  1. callback_url added to data dict: {'✅ YES' if has_callback_url else '❌ NO'}")
    print(f"  2. callback_method specified: {'✅ YES' if has_callback_method else '❌ NO'}")
    print(f"  3. Conditional on user_id: {'✅ YES' if has_user_id_check else '❌ NO'}")
    print(f"  4. Data sent to Razorpay API: {'✅ YES' if sends_data else '❌ NO'}")
    
    # Extract the actual callback URL line
    callback_match = re.search(r'callback_url = f"([^"]+)"', method_code)
    if callback_match:
        callback_url = callback_match.group(1)
        print(f"\n  📍 Callback URL Template: {callback_url}")
    
    # Extract the data structure being sent
    print("\n  📦 Data Structure Being Sent to Razorpay:")
    data_lines = []
    in_data_block = False
    for line in method_code.split('\n'):
        if 'data = {' in line:
            in_data_block = True
        if in_data_block:
            data_lines.append(line)
            if line.strip().startswith('}') and not line.strip().endswith(','):
                break
    
    for line in data_lines[:15]:  # Show first 15 lines of data structure
        print(f"     {line}")
    
    if has_callback_url and has_callback_method and sends_data:
        print("\n✅ ISSUE #1 RESOLVED: Callback URL IS being sent to Razorpay!")
        print("   - callback_url is added to the data dictionary")
        print("   - callback_method is set to 'get'")
        print("   - Data is sent in the API request (json=data)")
        return True
    else:
        print("\n❌ ISSUE #1 NOT FIXED: Callback URL is NOT being sent properly")
        return False

def check_issue_2():
    """
    Issue #2: The payment-callback endpoint requires authentication but Razorpay won't have the user's token
    """
    print_section("ISSUE #2: Payment Callback Authentication Requirement")
    
    print("Checking: /app/backend/routers/razorpay.py")
    print("Endpoint: @router.get('/payment-callback')\n")
    
    with open('/app/backend/routers/razorpay.py', 'r') as f:
        content = f.read()
    
    # Find the payment-callback endpoint
    endpoint_match = re.search(
        r'@router\.get\(["\']\/payment-callback["\']\).*?(?=@router\.|$)',
        content,
        re.DOTALL
    )
    
    if not endpoint_match:
        print("❌ FAILED: Could not find payment-callback endpoint")
        return False
    
    endpoint_code = endpoint_match.group(0)
    
    # Check for authentication
    has_depends = 'Depends(get_current_user)' in endpoint_code
    has_current_user_param = 'current_user: User' in endpoint_code or 'current_user:User' in endpoint_code
    
    # Check for public endpoint marker
    has_public_comment = 'PUBLIC ENDPOINT' in endpoint_code
    
    # Check for user_id parameter instead
    has_user_id_param = 'user_id: Optional[str]' in endpoint_code or 'user_id:Optional[str]' in endpoint_code
    
    print("Verification Steps:")
    print(f"  1. Depends(get_current_user): {'❌ FOUND (BAD)' if has_depends else '✅ NOT FOUND (GOOD)'}")
    print(f"  2. current_user parameter: {'❌ FOUND (BAD)' if has_current_user_param else '✅ NOT FOUND (GOOD)'}")
    print(f"  3. PUBLIC ENDPOINT comment: {'✅ FOUND (GOOD)' if has_public_comment else '❌ NOT FOUND'}")
    print(f"  4. user_id query parameter: {'✅ FOUND (GOOD)' if has_user_id_param else '❌ NOT FOUND'}")
    
    # Extract function signature
    func_match = re.search(r'async def payment_callback\((.*?)\):', endpoint_code, re.DOTALL)
    if func_match:
        params = func_match.group(1)
        print(f"\n  📋 Function Signature:")
        print(f"     async def payment_callback(")
        for param in params.split(','):
            param = param.strip()
            if param:
                print(f"         {param},")
        print(f"     ):")
    
    # Check docstring
    docstring_match = re.search(r'"""(.*?)"""', endpoint_code, re.DOTALL)
    if docstring_match:
        docstring = docstring_match.group(1).strip()
        print(f"\n  📝 Docstring:")
        for line in docstring.split('\n')[:5]:
            print(f"     {line}")
    
    if not has_depends and not has_current_user_param and has_user_id_param:
        print("\n✅ ISSUE #2 RESOLVED: Payment callback does NOT require authentication!")
        print("   - No Depends(get_current_user) found")
        print("   - No current_user parameter found")
        print("   - Uses user_id from query parameters instead")
        print("   - Razorpay can redirect here without JWT token")
        return True
    else:
        print("\n❌ ISSUE #2 NOT FIXED: Endpoint still requires authentication")
        return False

def main():
    print("\n" + "🔍"*40)
    print("  VERIFICATION: Two Exact Issues from User")
    print("🔍"*40)
    
    print("\nUser reported these two specific issues:")
    print("1. No callback URL is being sent to Razorpay during subscription creation")
    print("2. The payment-callback endpoint requires authentication but Razorpay won't have token")
    
    # Check both issues
    issue1_fixed = check_issue_1()
    issue2_fixed = check_issue_2()
    
    # Final summary
    print_section("FINAL VERIFICATION SUMMARY")
    
    print(f"Issue #1 (Callback URL): {'✅ FIXED' if issue1_fixed else '❌ NOT FIXED'}")
    print(f"Issue #2 (Authentication): {'✅ FIXED' if issue2_fixed else '❌ NOT FIXED'}")
    
    if issue1_fixed and issue2_fixed:
        print("\n" + "🎉"*40)
        print("  BOTH ISSUES COMPLETELY RESOLVED!")
        print("🎉"*40)
        print("\n✅ Callback URL is now being sent to Razorpay with user_id")
        print("✅ Payment callback endpoint is now PUBLIC (no auth required)")
        print("\n💡 How it works now:")
        print("   1. User clicks Subscribe → create_subscription() sends callback_url to Razorpay")
        print("   2. User pays on Razorpay → Razorpay redirects to callback_url (with user_id)")
        print("   3. Callback endpoint (PUBLIC) → Syncs subscription without needing JWT token")
        print("   4. User redirected to subscription page → Success!")
        return 0
    else:
        print("\n⚠️  Some issues remain. Please review the details above.")
        return 1

if __name__ == "__main__":
    exit(main())
