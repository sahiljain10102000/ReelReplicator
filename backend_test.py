#!/usr/bin/env python3

import requests
import sys
import json
import os
from datetime import datetime
import time

class ReelReplicatorAPITester:
    def __init__(self, base_url="https://reel-replicator.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_health_check(self):
        """Test GET /api/ health check"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200 and "message" in response.json()
            expected_message = "AI Reel Replicator API"
            actual_message = response.json().get("message", "")
            
            if success and expected_message in actual_message:
                self.log_test("Health Check", True)
                return True
            else:
                self.log_test("Health Check", False, f"Expected '{expected_message}' in message, got: {actual_message}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False

    def test_pricing(self):
        """Test GET /api/pricing returns 4 plans"""
        try:
            response = requests.get(f"{self.base_url}/pricing", timeout=10)
            success = response.status_code == 200
            
            if success:
                plans = response.json()
                if len(plans) == 4:
                    expected_ids = ["free", "starter", "pro", "agency"]
                    actual_ids = [p.get("id") for p in plans]
                    if set(expected_ids) == set(actual_ids):
                        self.log_test("Pricing API", True)
                        return True
                    else:
                        self.log_test("Pricing API", False, f"Expected plan IDs {expected_ids}, got {actual_ids}")
                        return False
                else:
                    self.log_test("Pricing API", False, f"Expected 4 plans, got {len(plans)}")
                    return False
            else:
                self.log_test("Pricing API", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Pricing API", False, str(e))
            return False

    def create_test_user_session(self):
        """Create test user and session using MongoDB"""
        try:
            import subprocess
            
            # Generate unique test data
            timestamp = str(int(datetime.now().timestamp()))
            self.user_id = f"test-user-{timestamp}"
            self.session_token = f"test_session_{timestamp}"
            
            # MongoDB command to create test user and session
            mongo_cmd = f'''
            mongosh --eval "
            use('test_database');
            var userId = '{self.user_id}';
            var sessionToken = '{self.session_token}';
            db.users.insertOne({{
              user_id: userId,
              email: 'test.user.{timestamp}@example.com',
              name: 'Test User',
              picture: 'https://via.placeholder.com/150',
              credits: 10,
              plan: 'starter',
              created_at: new Date().toISOString()
            }});
            db.user_sessions.insertOne({{
              user_id: userId,
              session_token: sessionToken,
              expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
              created_at: new Date().toISOString()
            }});
            print('Test user created successfully');
            "
            '''
            
            result = subprocess.run(mongo_cmd, shell=True, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and "Test user created successfully" in result.stdout:
                self.log_test("Create Test User/Session", True)
                print(f"📝 Created test user: {self.user_id}")
                print(f"🔑 Session token: {self.session_token}")
                return True
            else:
                self.log_test("Create Test User/Session", False, f"MongoDB error: {result.stderr}")
                return False
                
        except Exception as e:
            self.log_test("Create Test User/Session", False, str(e))
            return False

    def test_auth_me(self):
        """Test GET /api/auth/me with session token"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.get(f"{self.base_url}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get("user_id") == self.user_id:
                    self.log_test("Auth Me", True)
                    return True
                else:
                    self.log_test("Auth Me", False, f"User ID mismatch. Expected {self.user_id}, got {user_data.get('user_id')}")
                    return False
            else:
                self.log_test("Auth Me", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Auth Me", False, str(e))
            return False

    def test_auth_logout(self):
        """Test POST /api/auth/logout"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.post(f"{self.base_url}/auth/logout", headers=headers, timeout=10)
            
            success = response.status_code == 200 and "message" in response.json()
            if success:
                self.log_test("Auth Logout", True)
                return True
            else:
                self.log_test("Auth Logout", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Auth Logout", False, str(e))
            return False

    def test_user_credits(self):
        """Test GET /api/user/credits"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.get(f"{self.base_url}/user/credits", headers=headers, timeout=10)
            
            if response.status_code == 200:
                credits_data = response.json()
                if "credits" in credits_data and "plan" in credits_data:
                    self.log_test("User Credits", True)
                    return True
                else:
                    self.log_test("User Credits", False, f"Missing credits/plan in response: {credits_data}")
                    return False
            else:
                self.log_test("User Credits", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User Credits", False, str(e))
            return False

    def test_user_upgrade(self):
        """Test POST /api/user/upgrade"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}", "Content-Type": "application/json"}
            data = {"plan": "pro"}
            response = requests.post(f"{self.base_url}/user/upgrade", headers=headers, json=data, timeout=10)
            
            if response.status_code == 200:
                upgrade_data = response.json()
                if "credits" in upgrade_data and "plan" in upgrade_data:
                    self.log_test("User Upgrade", True)
                    return True
                else:
                    self.log_test("User Upgrade", False, f"Missing upgrade data: {upgrade_data}")
                    return False
            else:
                self.log_test("User Upgrade", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Upgrade", False, str(e))
            return False

    def test_jobs_list(self):
        """Test GET /api/jobs"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.get(f"{self.base_url}/jobs", headers=headers, timeout=10)
            
            if response.status_code == 200:
                jobs = response.json()
                if isinstance(jobs, list):
                    self.log_test("Jobs List", True)
                    return True
                else:
                    self.log_test("Jobs List", False, f"Expected list, got {type(jobs)}")
                    return False
            else:
                self.log_test("Jobs List", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Jobs List", False, str(e))
            return False

    def test_jobs_create(self):
        """Test POST /api/jobs (multipart form)"""
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            # Create dummy files for testing
            files = {
                'reference_video': ('test.mp4', b'dummy video content', 'video/mp4'),
                'face_image': ('test.jpg', b'dummy image content', 'image/jpeg')
            }
            data = {
                'prompt': 'Test reel generation with dancing moves'
            }
            
            response = requests.post(f"{self.base_url}/jobs", headers=headers, files=files, data=data, timeout=15)
            
            if response.status_code == 200:
                job_data = response.json()
                if "job_id" in job_data and "status" in job_data:
                    self.job_id = job_data["job_id"]
                    self.log_test("Jobs Create", True)
                    return True
                else:
                    self.log_test("Jobs Create", False, f"Missing job data: {job_data}")
                    return False
            else:
                self.log_test("Jobs Create", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Jobs Create", False, str(e))
            return False

    def test_job_detail(self):
        """Test GET /api/jobs/{job_id}"""
        if not hasattr(self, 'job_id'):
            self.log_test("Job Detail", False, "No job_id available from create test")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            response = requests.get(f"{self.base_url}/jobs/{self.job_id}", headers=headers, timeout=10)
            
            if response.status_code == 200:
                job_data = response.json()
                if job_data.get("job_id") == self.job_id:
                    self.log_test("Job Detail", True)
                    return True
                else:
                    self.log_test("Job Detail", False, f"Job ID mismatch: {job_data}")
                    return False
            else:
                self.log_test("Job Detail", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Job Detail", False, str(e))
            return False

    def test_job_status_transitions(self):
        """Test job status transitions (queued -> processing -> completed)"""
        if not hasattr(self, 'job_id'):
            self.log_test("Job Status Transitions", False, "No job_id available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.session_token}"}
            
            # Check initial status (should be queued)
            response = requests.get(f"{self.base_url}/jobs/{self.job_id}", headers=headers, timeout=10)
            if response.status_code != 200:
                self.log_test("Job Status Transitions", False, "Failed to fetch initial job status")
                return False
                
            initial_status = response.json().get("status")
            print(f"🔄 Initial job status: {initial_status}")
            
            # Wait and check for status transitions (up to 15 seconds)
            statuses_seen = [initial_status] if initial_status else []
            
            for i in range(15):  # Check for 15 seconds
                time.sleep(1)
                response = requests.get(f"{self.base_url}/jobs/{self.job_id}", headers=headers, timeout=10)
                if response.status_code == 200:
                    current_status = response.json().get("status")
                    if current_status and current_status not in statuses_seen:
                        statuses_seen.append(current_status)
                        print(f"🔄 Job status changed to: {current_status}")
                        
                    if current_status == "completed":
                        break
            
            # Check if we saw the expected transitions
            expected_statuses = {"queued", "processing", "completed"}
            if set(statuses_seen) >= {"queued"} and "completed" in statuses_seen:
                self.log_test("Job Status Transitions", True)
                return True
            else:
                self.log_test("Job Status Transitions", False, f"Expected transitions through queued->processing->completed, saw: {statuses_seen}")
                return False
                
        except Exception as e:
            self.log_test("Job Status Transitions", False, str(e))
            return False

    def cleanup_test_data(self):
        """Clean up test user and session data"""
        try:
            import subprocess
            
            mongo_cmd = f'''
            mongosh --eval "
            use('test_database');
            db.users.deleteOne({{'user_id': '{self.user_id}'}});
            db.user_sessions.deleteOne({{'session_token': '{self.session_token}'}});
            if ('{self.job_id if hasattr(self, 'job_id') else ''}') {{
                db.jobs.deleteOne({{'job_id': '{self.job_id if hasattr(self, 'job_id') else ''}'}});
            }}
            print('Cleanup completed');
            "
            '''
            
            subprocess.run(mongo_cmd, shell=True, capture_output=True, text=True, timeout=30)
            print("🧹 Cleaned up test data")
            
        except Exception as e:
            print(f"⚠️ Cleanup failed: {e}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting AI Reel Replicator Backend API Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print("=" * 60)
        
        try:
            # Public endpoints (no auth required)
            self.test_health_check()
            self.test_pricing()
            
            # Create test user for authenticated endpoints
            if not self.create_test_user_session():
                print("❌ Cannot proceed with authenticated tests - test user creation failed")
                return False
            
            # Authenticated endpoints
            self.test_auth_me()
            self.test_user_credits()
            self.test_user_upgrade()
            self.test_jobs_list()
            self.test_jobs_create()
            self.test_job_detail()
            self.test_job_status_transitions()
            self.test_auth_logout()
            
        finally:
            # Always cleanup
            if self.user_id:
                self.cleanup_test_data()
        
        # Results
        print("=" * 60)
        print(f"📊 Backend API Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests PASSED!")
            return True
        else:
            print("❌ Some backend tests FAILED")
            failed_tests = [r for r in self.test_results if not r["success"]]
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
            return False

def main():
    tester = ReelReplicatorAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())