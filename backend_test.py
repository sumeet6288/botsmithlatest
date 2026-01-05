#!/usr/bin/env python3
"""
Backend Test Suite for Admin Plan Change Subscription Duration Fix
================================================================

This test suite verifies the critical bug fix where admin changing user plans
via Ultimate Edit modal resulted in incorrect subscription durations.

Test Focus:
- Admin plan changes via PUT /api/admin/users/{user_id}/ultimate-update
- Subscription duration calculation (FREE: 6 days, Paid: 30 days)
- Database verification of subscription data after plan changes
- Edge cases and multiple plan changes

Expected Behavior:
- When admin changes plan, subscription should ALWAYS start fresh
- FREE plan: expires_at = NOW + 6 days
- Paid plans: expires_at = NOW + 30 days
- No carry-forward of remaining time from previous plan
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AdminPlanChangeTestSuite:
    def __init__(self):
        self.base_url = "https://secure-pay-17.preview.emergentagent.com/api"
        self.admin_token = None
        self.test_users = []
        self.session = None
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result for summary"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"{status}: {test_name} - {details}")
    
    async def admin_login(self) -> bool:
        """Login as admin to get authentication token"""
        try:
            login_data = {
                "email": "admin@botsmith.com",
                "password": "admin123"
            }
            
            async with self.session.post(f"{self.base_url}/auth/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("access_token")
                    self.log_test_result("Admin Login", True, "Successfully authenticated as admin")
                    return True
                else:
                    error_text = await response.text()
                    self.log_test_result("Admin Login", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test_result("Admin Login", False, f"Exception: {str(e)}")
            return False
    
    async def create_test_user(self, email: str, name: str, initial_plan: str = "free") -> Optional[str]:
        """Create a test user with specified initial plan"""
        try:
            # Create user
            user_data = {
                "name": name,
                "email": email,
                "password": "testpass123"
            }
            
            async with self.session.post(f"{self.base_url}/auth/register", json=user_data) as response:
                if response.status == 200:
                    data = await response.json()
                    user_id = data.get("user", {}).get("id")
                    
                    if user_id:
                        # Set initial plan if not free
                        if initial_plan != "free":
                            await self.change_user_plan_admin(user_id, initial_plan)
                        
                        self.test_users.append({"id": user_id, "email": email, "name": name})
                        self.log_test_result(f"Create Test User ({email})", True, f"User ID: {user_id}, Initial plan: {initial_plan}")
                        return user_id
                    else:
                        self.log_test_result(f"Create Test User ({email})", False, "No user ID in response")
                        return None
                else:
                    error_text = await response.text()
                    self.log_test_result(f"Create Test User ({email})", False, f"Status {response.status}: {error_text}")
                    return None
        except Exception as e:
            self.log_test_result(f"Create Test User ({email})", False, f"Exception: {str(e)}")
            return None
    
    async def change_user_plan_admin(self, user_id: str, new_plan_id: str) -> bool:
        """Change user plan via admin ultimate-update endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            update_data = {"plan_id": new_plan_id}
            
            async with self.session.put(
                f"{self.base_url}/admin/users/{user_id}/ultimate-update",
                json=update_data,
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    success = data.get("success", False)
                    if success:
                        self.log_test_result(f"Admin Plan Change ({user_id} → {new_plan_id})", True, "Plan changed successfully")
                        return True
                    else:
                        self.log_test_result(f"Admin Plan Change ({user_id} → {new_plan_id})", False, f"API returned success=false: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test_result(f"Admin Plan Change ({user_id} → {new_plan_id})", False, f"Status {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test_result(f"Admin Plan Change ({user_id} → {new_plan_id})", False, f"Exception: {str(e)}")
            return False
    
    async def verify_subscription_duration(self, user_id: str, expected_plan: str, expected_duration_days: int) -> bool:
        """Verify subscription has correct plan and duration"""
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Get user subscription data via admin endpoint
            async with self.session.get(f"{self.base_url}/admin/users/{user_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    user_data = data.get("user", {})
                    
                    # Check plan_id
                    actual_plan = user_data.get("plan_id")
                    if actual_plan != expected_plan:
                        self.log_test_result(f"Verify Subscription ({user_id})", False, f"Plan mismatch: expected {expected_plan}, got {actual_plan}")
                        return False
                    
                    # Get subscription details
                    async with self.session.get(f"{self.base_url}/admin/users/{user_id}/subscription", headers=headers) as sub_response:
                        if sub_response.status == 200:
                            sub_data = await sub_response.json()
                            subscription = sub_data.get("subscription", {})
                            
                            # Verify subscription fields
                            sub_plan_id = subscription.get("plan_id")
                            expires_at_str = subscription.get("expires_at")
                            started_at_str = subscription.get("started_at")
                            status = subscription.get("status")
                            
                            if sub_plan_id != expected_plan:
                                self.log_test_result(f"Verify Subscription ({user_id})", False, f"Subscription plan mismatch: expected {expected_plan}, got {sub_plan_id}")
                                return False
                            
                            if status != "active":
                                self.log_test_result(f"Verify Subscription ({user_id})", False, f"Subscription status not active: {status}")
                                return False
                            
                            if not expires_at_str or not started_at_str:
                                self.log_test_result(f"Verify Subscription ({user_id})", False, f"Missing dates: expires_at={expires_at_str}, started_at={started_at_str}")
                                return False
                            
                            # Parse dates and verify duration
                            try:
                                expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
                                started_at = datetime.fromisoformat(started_at_str.replace('Z', '+00:00'))
                                
                                actual_duration = (expires_at - started_at).days
                                
                                # Allow 1 day tolerance for timing differences
                                if abs(actual_duration - expected_duration_days) <= 1:
                                    self.log_test_result(f"Verify Subscription ({user_id})", True, 
                                        f"Plan: {sub_plan_id}, Duration: {actual_duration} days (expected: {expected_duration_days}), Status: {status}")
                                    return True
                                else:
                                    self.log_test_result(f"Verify Subscription ({user_id})", False, 
                                        f"Duration mismatch: expected {expected_duration_days} days, got {actual_duration} days")
                                    return False
                            except Exception as date_error:
                                self.log_test_result(f"Verify Subscription ({user_id})", False, f"Date parsing error: {str(date_error)}")
                                return False
                        else:
                            error_text = await sub_response.text()
                            self.log_test_result(f"Verify Subscription ({user_id})", False, f"Subscription fetch failed: {error_text}")
                            return False
                else:
                    error_text = await response.text()
                    self.log_test_result(f"Verify Subscription ({user_id})", False, f"User fetch failed: {error_text}")
                    return False
        except Exception as e:
            self.log_test_result(f"Verify Subscription ({user_id})", False, f"Exception: {str(e)}")
            return False
    
    async def test_plan_change_scenario(self, user_id: str, from_plan: str, to_plan: str, expected_duration: int) -> bool:
        """Test a specific plan change scenario"""
        test_name = f"Plan Change: {from_plan} → {to_plan}"
        
        # Change plan
        change_success = await self.change_user_plan_admin(user_id, to_plan)
        if not change_success:
            return False
        
        # Wait a moment for database update
        await asyncio.sleep(1)
        
        # Verify subscription
        verify_success = await self.verify_subscription_duration(user_id, to_plan, expected_duration)
        return verify_success
    
    async def test_multiple_plan_changes(self, user_id: str) -> bool:
        """Test multiple plan changes in succession"""
        test_name = "Multiple Plan Changes"
        
        # Test sequence: free → starter → professional → free → starter
        changes = [
            ("free", "starter", 30),
            ("starter", "professional", 30),
            ("professional", "free", 6),
            ("free", "starter", 30)
        ]
        
        for i, (from_plan, to_plan, expected_duration) in enumerate(changes):
            logger.info(f"Testing change {i+1}/4: {from_plan} → {to_plan}")
            
            success = await self.test_plan_change_scenario(user_id, from_plan, to_plan, expected_duration)
            if not success:
                self.log_test_result(test_name, False, f"Failed at step {i+1}: {from_plan} → {to_plan}")
                return False
            
            # Small delay between changes
            await asyncio.sleep(0.5)
        
        self.log_test_result(test_name, True, "All 4 plan changes completed successfully")
        return True
    
    async def run_comprehensive_tests(self):
        """Run all admin plan change tests"""
        logger.info("🚀 Starting Admin Plan Change Subscription Duration Tests")
        logger.info("=" * 80)
        
        # Step 1: Admin login
        if not await self.admin_login():
            logger.error("❌ Cannot proceed without admin authentication")
            return
        
        # Step 2: Create test users
        logger.info("\n📝 Creating test users...")
        user1_id = await self.create_test_user("user1@test.com", "Test User 1", "free")
        user2_id = await self.create_test_user("user2@test.com", "Test User 2", "starter")
        user3_id = await self.create_test_user("user3@test.com", "Test User 3", "professional")
        
        if not all([user1_id, user2_id, user3_id]):
            logger.error("❌ Failed to create required test users")
            return
        
        # Step 3: Test primary scenarios
        logger.info("\n🧪 Testing primary plan change scenarios...")
        
        # Test FREE → Starter (should get exactly 30 days)
        await self.test_plan_change_scenario(user1_id, "free", "starter", 30)
        
        # Test FREE → Professional (should get exactly 30 days)
        await self.test_plan_change_scenario(user1_id, "starter", "professional", 30)
        
        # Test Starter → Professional (should get fresh 30 days)
        await self.test_plan_change_scenario(user2_id, "starter", "professional", 30)
        
        # Test Professional → FREE (should get exactly 6 days)
        await self.test_plan_change_scenario(user3_id, "professional", "free", 6)
        
        # Test Starter → FREE (should get exactly 6 days)
        await self.test_plan_change_scenario(user2_id, "professional", "free", 6)
        
        # Step 4: Test edge cases
        logger.info("\n🔄 Testing edge cases...")
        
        # Test multiple plan changes in succession
        await self.test_multiple_plan_changes(user1_id)
        
        # Step 5: Final verification
        logger.info("\n✅ Final verification of all users...")
        await self.verify_subscription_duration(user1_id, "starter", 30)
        await self.verify_subscription_duration(user2_id, "free", 6)
        await self.verify_subscription_duration(user3_id, "free", 6)
        
        # Print summary
        self.print_test_summary()
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        logger.info("\n" + "=" * 80)
        logger.info("📊 ADMIN PLAN CHANGE TEST SUMMARY")
        logger.info("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests} ✅")
        logger.info(f"Failed: {failed_tests} ❌")
        logger.info(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            logger.info("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    logger.info(f"  - {result['test']}: {result['details']}")
        
        logger.info("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                logger.info(f"  - {result['test']}: {result['details']}")
        
        logger.info("\n" + "=" * 80)
        
        # Overall result
        if failed_tests == 0:
            logger.info("🎉 ALL TESTS PASSED! Admin plan change duration fix is working correctly.")
        else:
            logger.info(f"⚠️  {failed_tests} test(s) failed. Admin plan change duration fix needs attention.")
        
        logger.info("=" * 80)

async def main():
    """Main test execution function"""
    async with AdminPlanChangeTestSuite() as test_suite:
        await test_suite.run_comprehensive_tests()

if __name__ == "__main__":
    asyncio.run(main())