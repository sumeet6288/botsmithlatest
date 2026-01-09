#!/usr/bin/env python3
"""
BotSmith AI - Google OAuth via Supabase Authentication Testing
=============================================================

This script tests the Google OAuth authentication via Supabase for BotSmith AI application.

Test Scope:
1. Supabase Configuration Verification
2. Backend Health Check
3. Admin Authentication (Legacy - Should Still Work)
4. Service Status

Context:
- Google OAuth is NOW configured with Supabase
- Backend environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET
- Frontend environment variables: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY
- Regular users (/signup, /signin) will use Google OAuth ONLY
- Admin users will continue using email/password authentication
- Application URL: https://premium-type.preview.emergentagent.com
"""

import asyncio
import aiohttp
import json
import sys
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://premium-type.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@botsmith.com"
ADMIN_PASSWORD = "admin123"

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

class TestResult:
    """Test result container"""
    def __init__(self, name: str, success: bool, message: str, details: Optional[Dict] = None):
        self.name = name
        self.success = success
        self.message = message
        self.details = details or {}
        self.timestamp = datetime.now().isoformat()

class SupabaseAuthTester:
    """Comprehensive Supabase Authentication Tester"""
    
    def __init__(self):
        self.session = None
        self.results = []
        self.admin_token = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def log_test(self, result: TestResult):
        """Log test result"""
        self.results.append(result)
        status_color = Colors.GREEN if result.success else Colors.RED
        status_text = "✅ PASS" if result.success else "❌ FAIL"
        
        print(f"{status_color}{status_text}{Colors.END} {Colors.BOLD}{result.name}{Colors.END}")
        print(f"   {result.message}")
        
        if result.details:
            for key, value in result.details.items():
                print(f"   {Colors.CYAN}{key}:{Colors.END} {value}")
        print()
    
    async def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                          headers: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{BASE_URL}{endpoint}"
        request_headers = headers or {}
        
        try:
            async with self.session.request(method, url, json=data, headers=request_headers) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = {"text": await response.text()}
                
                return response.status < 400, {
                    "status_code": response.status,
                    "data": response_data,
                    "headers": dict(response.headers)
                }
        except Exception as e:
            return False, {
                "error": str(e),
                "status_code": 0
            }
    
    async def test_supabase_status(self):
        """Test 1: Supabase Configuration Verification"""
        print(f"{Colors.BLUE}🔍 Testing Supabase Configuration Status...{Colors.END}")
        
        success, response = await self.make_request("GET", "/auth/supabase/status")
        
        if not success:
            self.log_test(TestResult(
                "Supabase Status Endpoint",
                False,
                f"Failed to reach endpoint: {response.get('error', 'Unknown error')}",
                {"status_code": response.get('status_code', 0)}
            ))
            return
        
        data = response.get('data', {})
        configured = data.get('configured', False)
        message = data.get('message', '')
        
        expected_message = "Supabase authentication is configured and ready"
        
        if configured and expected_message in message:
            self.log_test(TestResult(
                "Supabase Status Endpoint",
                True,
                "Supabase is properly configured and ready",
                {
                    "configured": configured,
                    "message": message,
                    "status_code": response['status_code']
                }
            ))
        else:
            self.log_test(TestResult(
                "Supabase Status Endpoint",
                False,
                f"Supabase configuration issue: configured={configured}",
                {
                    "configured": configured,
                    "message": message,
                    "expected_message": expected_message,
                    "status_code": response['status_code']
                }
            ))
    
    async def test_backend_health(self):
        """Test 2: Backend Health Check"""
        print(f"{Colors.BLUE}🏥 Testing Backend Health Check...{Colors.END}")
        
        success, response = await self.make_request("GET", "/health")
        
        if not success:
            self.log_test(TestResult(
                "Backend Health Check",
                False,
                f"Health check failed: {response.get('error', 'Unknown error')}",
                {"status_code": response.get('status_code', 0)}
            ))
            return
        
        data = response.get('data', {})
        status = data.get('status')
        database = data.get('database')
        connection_pool = data.get('connection_pool', {})
        
        health_ok = (status == "running" and database == "healthy")
        
        if health_ok:
            self.log_test(TestResult(
                "Backend Health Check",
                True,
                "Backend is healthy and database is accessible",
                {
                    "status": status,
                    "database": database,
                    "connection_pool_status": connection_pool.get('status', 'unknown'),
                    "active_connections": connection_pool.get('active_connections', 'unknown'),
                    "status_code": response['status_code']
                }
            ))
        else:
            self.log_test(TestResult(
                "Backend Health Check",
                False,
                f"Backend health issues: status={status}, database={database}",
                {
                    "status": status,
                    "database": database,
                    "connection_pool": connection_pool,
                    "status_code": response['status_code']
                }
            ))
    
    async def test_admin_authentication(self):
        """Test 3: Admin Authentication (Legacy - Should Still Work)"""
        print(f"{Colors.BLUE}🔐 Testing Admin Authentication...{Colors.END}")
        
        # Test admin login
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        success, response = await self.make_request("POST", "/auth/login", login_data)
        
        if not success:
            self.log_test(TestResult(
                "Admin Login",
                False,
                f"Admin login failed: {response.get('error', 'Unknown error')}",
                {
                    "email": ADMIN_EMAIL,
                    "status_code": response.get('status_code', 0),
                    "response": response.get('data', {})
                }
            ))
            return
        
        data = response.get('data', {})
        access_token = data.get('access_token')
        token_type = data.get('token_type', 'bearer')
        
        if access_token:
            self.admin_token = access_token
            self.log_test(TestResult(
                "Admin Login",
                True,
                "Admin authentication successful, JWT token issued",
                {
                    "email": ADMIN_EMAIL,
                    "token_type": token_type,
                    "token_length": len(access_token),
                    "status_code": response['status_code']
                }
            ))
            
            # Test getting admin user info
            await self.test_admin_user_info()
        else:
            self.log_test(TestResult(
                "Admin Login",
                False,
                "Admin login succeeded but no access token received",
                {
                    "email": ADMIN_EMAIL,
                    "response_data": data,
                    "status_code": response['status_code']
                }
            ))
    
    async def test_admin_user_info(self):
        """Test 3b: Get Admin User Information"""
        if not self.admin_token:
            self.log_test(TestResult(
                "Admin User Info",
                False,
                "Cannot test admin user info - no admin token available",
                {}
            ))
            return
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        success, response = await self.make_request("GET", "/auth/me", headers=headers)
        
        if not success:
            self.log_test(TestResult(
                "Admin User Info",
                False,
                f"Failed to get admin user info: {response.get('error', 'Unknown error')}",
                {"status_code": response.get('status_code', 0)}
            ))
            return
        
        data = response.get('data', {})
        user_email = data.get('email')
        user_role = data.get('role')
        user_name = data.get('name')
        
        if user_email == ADMIN_EMAIL and user_role == "admin":
            self.log_test(TestResult(
                "Admin User Info",
                True,
                "Admin user information retrieved successfully with correct role",
                {
                    "email": user_email,
                    "role": user_role,
                    "name": user_name,
                    "plan_id": data.get('plan_id', 'unknown'),
                    "status_code": response['status_code']
                }
            ))
        else:
            self.log_test(TestResult(
                "Admin User Info",
                False,
                f"Admin user info incorrect: email={user_email}, role={user_role}",
                {
                    "expected_email": ADMIN_EMAIL,
                    "actual_email": user_email,
                    "expected_role": "admin",
                    "actual_role": user_role,
                    "status_code": response['status_code']
                }
            ))
    
    async def test_service_status(self):
        """Test 4: Service Status Verification"""
        print(f"{Colors.BLUE}⚙️ Testing Service Status...{Colors.END}")
        
        # Test if backend is responding
        success, response = await self.make_request("GET", "/")
        
        if not success:
            self.log_test(TestResult(
                "Backend Service Status",
                False,
                f"Backend service not responding: {response.get('error', 'Unknown error')}",
                {"status_code": response.get('status_code', 0)}
            ))
            return
        
        data = response.get('data', {})
        message = data.get('message', '')
        status = data.get('status', '')
        
        if "BotSmith API" in message and status == "running":
            self.log_test(TestResult(
                "Backend Service Status",
                True,
                "Backend service is running and responding correctly",
                {
                    "message": message,
                    "status": status,
                    "status_code": response['status_code']
                }
            ))
        else:
            self.log_test(TestResult(
                "Backend Service Status",
                False,
                f"Backend service status unexpected: message='{message}', status='{status}'",
                {
                    "message": message,
                    "status": status,
                    "status_code": response['status_code']
                }
            ))
    
    async def test_environment_variables(self):
        """Test 5: Environment Variables Check"""
        print(f"{Colors.BLUE}🌍 Testing Environment Variables...{Colors.END}")
        
        # Check if we can read the .env file to verify Supabase configuration
        try:
            backend_env_path = "/app/backend/.env"
            frontend_env_path = "/app/frontend/.env"
            
            backend_vars = {}
            frontend_vars = {}
            
            # Read backend .env
            if os.path.exists(backend_env_path):
                with open(backend_env_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            backend_vars[key] = value.strip('"')
            
            # Read frontend .env
            if os.path.exists(frontend_env_path):
                with open(frontend_env_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            frontend_vars[key] = value.strip('"')
            
            # Check required Supabase variables
            required_backend = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_JWT_SECRET']
            required_frontend = ['REACT_APP_SUPABASE_URL', 'REACT_APP_SUPABASE_ANON_KEY']
            
            backend_missing = [var for var in required_backend if var not in backend_vars or not backend_vars[var]]
            frontend_missing = [var for var in required_frontend if var not in frontend_vars or not frontend_vars[var]]
            
            if not backend_missing and not frontend_missing:
                self.log_test(TestResult(
                    "Environment Variables",
                    True,
                    "All required Supabase environment variables are configured",
                    {
                        "backend_supabase_url": backend_vars.get('SUPABASE_URL', '')[:50] + "...",
                        "frontend_supabase_url": frontend_vars.get('REACT_APP_SUPABASE_URL', '')[:50] + "...",
                        "backend_anon_key_length": len(backend_vars.get('SUPABASE_ANON_KEY', '')),
                        "frontend_anon_key_length": len(frontend_vars.get('REACT_APP_SUPABASE_ANON_KEY', '')),
                        "jwt_secret_configured": bool(backend_vars.get('SUPABASE_JWT_SECRET'))
                    }
                ))
            else:
                self.log_test(TestResult(
                    "Environment Variables",
                    False,
                    "Missing required Supabase environment variables",
                    {
                        "backend_missing": backend_missing,
                        "frontend_missing": frontend_missing,
                        "backend_vars_found": list(backend_vars.keys()),
                        "frontend_vars_found": list(frontend_vars.keys())
                    }
                ))
        
        except Exception as e:
            self.log_test(TestResult(
                "Environment Variables",
                False,
                f"Error checking environment variables: {str(e)}",
                {"error": str(e)}
            ))
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"{Colors.BOLD}{Colors.MAGENTA}🚀 BotSmith AI - Google OAuth via Supabase Testing{Colors.END}")
        print(f"{Colors.CYAN}Testing URL: {BASE_URL}{Colors.END}")
        print(f"{Colors.CYAN}Admin Credentials: {ADMIN_EMAIL} / {ADMIN_PASSWORD}{Colors.END}")
        print("=" * 80)
        print()
        
        # Run all tests
        await self.test_environment_variables()
        await self.test_supabase_status()
        await self.test_backend_health()
        await self.test_admin_authentication()
        await self.test_service_status()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("=" * 80)
        print(f"{Colors.BOLD}{Colors.MAGENTA}📊 TEST SUMMARY{Colors.END}")
        print("=" * 80)
        
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.success)
        failed_tests = total_tests - passed_tests
        
        print(f"{Colors.BOLD}Total Tests: {total_tests}{Colors.END}")
        print(f"{Colors.GREEN}✅ Passed: {passed_tests}{Colors.END}")
        print(f"{Colors.RED}❌ Failed: {failed_tests}{Colors.END}")
        print(f"{Colors.CYAN}Success Rate: {(passed_tests/total_tests*100):.1f}%{Colors.END}")
        print()
        
        if failed_tests > 0:
            print(f"{Colors.RED}{Colors.BOLD}FAILED TESTS:{Colors.END}")
            for result in self.results:
                if not result.success:
                    print(f"  ❌ {result.name}: {result.message}")
            print()
        
        # Expected results summary
        print(f"{Colors.BOLD}{Colors.YELLOW}EXPECTED RESULTS:{Colors.END}")
        print("✅ Supabase status endpoint returns configured: true")
        print("✅ Admin login works with email/password")
        print("✅ Backend health check passes")
        print("✅ All services running properly")
        print("✅ Environment variables properly configured")
        print()
        
        if failed_tests == 0:
            print(f"{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Google OAuth via Supabase is ready for testing.{Colors.END}")
        else:
            print(f"{Colors.RED}{Colors.BOLD}⚠️ Some tests failed. Please review the issues above.{Colors.END}")
        
        print()
        print(f"{Colors.CYAN}Note: Full Google OAuth testing (sign-in/sign-up flow) requires Google OAuth provider")
        print(f"to be enabled in Supabase Dashboard. This test focuses on backend configuration")
        print(f"and admin authentication preservation.{Colors.END}")

async def main():
    """Main test execution"""
    try:
        async with SupabaseAuthTester() as tester:
            await tester.run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Test interrupted by user{Colors.END}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Test execution failed: {str(e)}{Colors.END}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())