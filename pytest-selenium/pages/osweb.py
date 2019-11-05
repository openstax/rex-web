from pages.base import Page
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep


class WebBase(Page):
    URL_TEMPLATE = "/details/books/{book_slug}"
    _root_locator = (By.CSS_SELECTOR, "body.page-loaded")
    _async_hide_locator = (By.CSS_SELECTOR, ".async-hide")
    _login_locator = (By.CSS_SELECTOR, '[class="pardotTrackClick"]')
    _user_nav_locator = (By.CSS_SELECTOR, '[class*="login-menu"]')
    _logout_locator = (By.CSS_SELECTOR, "[href*=logout]")
    _mobile_user_nav_locator = (By.CSS_SELECTOR, '[aria-label="Toggle Meta Navigation Menu"]')
    # _mobile_user_nav_loaded_locator = (By.CSS_SELECTOR, '[class="page-header hide-until-loaded loaded active open"]')
    _mobile_user_nav_loaded_locator = (By.CSS_SELECTOR, '[aria-expanded="true"]')
    _view_online_desktop_locator = (
        By.XPATH,
        "//div[@class='bigger-view']//span[text()='View online']/..",
    )
    _view_online_mobile_locator = (
        By.XPATH,
        "//div[@class='phone-view']//span[text()='View online']/..",
    )

    @property
    def loaded(self):
        """Return True when the page-loaded class is added to the body tag."""
        return (self.find_element(*self._root_locator)).is_displayed() and not self.find_elements(
            *self._async_hide_locator
        )

    @property
    def login(self):
        return self.find_element(*self._login_locator)

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
        if self.is_desktop:
            if self.is_element_present(*self._user_nav_locator):
                return True
        elif self.is_mobile:
            self.mobile_user_nav.click()
            if self.is_element_present(*self._mobile_user_nav_locator):
                self.mobile_user_nav.click()
                return True

    @property
    def logout(self):
        return self.find_element(*self._logout_locator)

    @property
    def view_online(self):
        if self.is_desktop:
            return self.find_element(*self._view_online_desktop_locator)
        elif self.is_mobile:
            return self.find_element(*self._view_online_mobile_locator)

    def click_login(self):
        if self.is_desktop:
            self.login.click()
        elif self.is_mobile:
            self.click_mobile_user_nav()
            self.login.click()

    def click_logout(self):
        if self.is_desktop:
            actionChains = ActionChains(self.driver)
            actionChains.move_to_element(self.user_nav).click(self.logout).perform()

        elif self.is_mobile:
            self.mobile_user_nav.click()
            self.user_nav.click()
            self.mobile_user_nav_loaded()
            sleep(1)
            self.logout.click()
        self.wait_for_load()

        # sleep(2)

    def click_view_online(self):
        self.offscreen_click(self.view_online)

    def wait_for_load(self):
        return self.wait.until(lambda _: self.loaded)

    def click_mobile_user_nav(self):
        self.offscreen_click(self.mobile_user_nav)

    def osweb_username(self, element):
        element1 = self.username(element)
        return " ".join(element1.split()[:2])
