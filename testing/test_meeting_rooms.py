# Selenium automated test for Meeting Room Booking flow
import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestMeetingRooms():
  def setup_method(self, method):
    self.driver = webdriver.Chrome()
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.quit()
  
  def test_meeting_room_booking(self):
    wait = WebDriverWait(self.driver, 10)

    # 1. Open Landing page & Sign In
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

    # Wait for login redirection
    time.sleep(2)

    # 2. Navigate to Meeting Rooms page
    self.driver.get("http://localhost:5173/meeting-rooms")

    # 3. Locate an active "Book Room" button
    book_room_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Book Room') and not(contains(@class, 'Mui-disabled'))]"))
    )
    book_room_btn.click()

    # 4. Fill in Meeting Title in booking modal
    title_input = wait.until(
      EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'Sprint')]"))
    )
    title_input.clear()
    title_input.send_keys("Automated Test Meeting")

    # 5. Click Confirm Booking button
    confirm_btn = wait.until(
      EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm Booking') and not(contains(@class, 'Mui-disabled'))]"))
    )
    confirm_btn.click()

    # 6. Wait for booking confirmation
    time.sleep(3)
