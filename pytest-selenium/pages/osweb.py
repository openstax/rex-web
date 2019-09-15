from pages.base import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains


class WebBase(Page):
    _root_locator = (By.CSS_SELECTOR, "body.page-loaded")
    _user_nav_locator = (By.CSS_SELECTOR, '[class*="login-dropdown"]')
    _logout_locator = (By.CSS_SELECTOR, "[href*=logout]")
    _mobile_user_nav_locator = (By.CSS_SELECTOR, '[aria-label="Toggle Meta Navigation Menu"]')
    # _mobile_user_nav_loaded_locator = (By.CSS_SELECTOR, '[class="page-header hide-until-loaded loaded active open"]')
    _mobile_user_nav_loaded_locator = (By.CSS_SELECTOR, '[aria-expanded="true"]')

    @property
    def loaded(self):
        """Return True when the page-loaded class is added to the body tag."""
        return (self.find_element(*self._root_locator)).is_displayed()

    @property
    def user_nav(self):
        return self.find_element(*self._user_nav_locator)

    def mobile_user_nav_loaded(self):
        return self.find_element(*self._mobile_user_nav_loaded_locator).is_displayed()

    @property
    def mobile_user_nav(self):
        return self.find_element(*self._mobile_user_nav_locator)

    @property
    def user_is_logged_in(self):
        if self.is_element_present(*self._user_nav_locator):
            return True

    @property
    def logout(self):
        return self.find_element(*self._logout_locator)

    def click_logout(self):
        actionChains = ActionChains(self.driver)
        actionChains.move_to_element(self.user_nav).click(self.logout).perform()
        self.wait_for_load()

    def click_logout_in_mobile(self):
        # self.mobile_user_nav.click()
        self.user_nav.click()
        # self.mobile_user_nav_loaded()
        self.wait.until(lambda _: self.mobile_user_nav_loaded)
        self.wait_for_load()
        from time import sleep

        sleep(1)
        self.logout.click()

    def wait_for_load(self):
        return self.wait.until(lambda _: self.loaded)
