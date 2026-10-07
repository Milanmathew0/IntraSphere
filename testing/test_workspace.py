import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestWorkspaceReservation():
  def setup_method(self, method):
    self.driver = webdriver.Chrome()
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.quit()
  
  def test_workspace_reservation(self):
    wait = WebDriverWait(self.driver, 10)

    
    self.driver.get("http://localhost:5173/")
    self.driver.set_window_size(1280, 800)

    sign_in_nav_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign In')]"))
    )
    sign_in_nav_btn.click()

    email_input = wait.until(
      EC.presence_of_element_located((By.XPATH, "//input[@placeholder='name@company.com']"))
    )
    email_input.clear()
    email_input.send_keys("tomshibu@gmail.com")

    password_input = wait.until(
      EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
    )
    password_input.clear()
    password_input.send_keys("Milan@07")

    submit_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
    )
    submit_btn.click()

    time.sleep(2)

    self.driver.get("http://localhost:5173/workspaces")

    reserve_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Reserve')]"))
    )
    reserve_btn.click()

    confirm_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm Reservation')]"))
    )
    confirm_btn.click()

    time.sleep(3)
