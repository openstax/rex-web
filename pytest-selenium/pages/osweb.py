from pages.base import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains


class WebBase(Page):
    _root_locator = (By.CSS_SELECTOR, "body.page-loaded")
    _user_nav_locator = (By.CSS_SELECTOR, '[class*="login-dropdown"]')
    _logout_locator = (By.CSS_SELECTOR, "[href*=logout]")

    @property
    def loaded(self):
        """Return True when the page-loaded class is added to the body tag."""
        return (self.find_element(*self._root_locator)).is_displayed()

    @property
    def user_nav(self):
        return self.find_element(*self._user_nav_locator)

    @property
    def logout(self):
        return self.find_element(*self._logout_locator)

    def hover_over_user_name(self):
        actionChains = ActionChains(self.driver)
        actionChains.move_to_element(self.user_nav).perform()

    def click_logout(self):
        self.offscreen_click(self.logout)

    def wait_for_load(self):
        return self.wait.until(lambda _: self.loaded)
