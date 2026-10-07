# Selenium automated test for Registration flow
import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestRegister():
  def setup_method(self, method):
    self.driver = webdriver.Chrome()
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.quit()
  
  def test_register(self):
    self.driver.get("http://localhost:5173/")
    self.driver.set_window_size(1280, 800)
    wait = WebDriverWait(self.driver, 10)

    # 1. Click "Create Account" button on navigation bar to open register modal
    create_acc_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create Account')]"))
    )
    create_acc_btn.click()

    # Generate dynamic timestamp for unique credentials
    timestamp = int(time.time())
    test_username = f"TestUser{timestamp}"
    test_email = f"testuser_{timestamp}@example.com"
    test_password = "TestPassword123!"

    # 2. Fill in Full Name / Username
    username_input = wait.until(
      EC.presence_of_element_located((By.XPATH, "//input[@placeholder='John Doe']"))
    )
    username_input.clear()
    username_input.send_keys(test_username)

    # 3. Fill in Email Address
    email_input = wait.until(
      EC.presence_of_element_located((By.XPATH, "//input[@placeholder='name@company.com']"))
    )
    email_input.clear()
    email_input.send_keys(test_email)

    # 4. Fill in Password
    password_input = wait.until(
      EC.presence_of_element_located((By.XPATH, "//input[@placeholder='At least 8 characters']"))
    )
    password_input.clear()
    password_input.send_keys(test_password)

    # 5. Fill in Confirm Password
    confirm_input = wait.until(
      EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Re-enter password']"))
    )
    confirm_input.clear()
    confirm_input.send_keys(test_password)

    # 6. Click Submit button ("Create Account") inside the form
    submit_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
    )
    submit_btn.click()

    # 7. Wait briefly for registration & sign-in redirect processing
    time.sleep(3)
