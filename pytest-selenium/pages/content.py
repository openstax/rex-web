from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected

from pages.base import Page
from regions.base import Region


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"

    _body_locator = (By.TAG_NAME, "body")
    _main_content_locator = (By.CSS_SELECTOR, "h1")

    @property
    def loaded(self):
        return self.find_element(*self._body_locator).get_attribute("data-rex-loaded")

    @property
    def navbar(self):
        return self.NavBar(self)

    @property
    def toolbar(self):
        return self.ToolBar(self)

    @property
    def sidebar(self):
        return self.SideBar(self)

    @property
    def attribution(self):
        return self.Attribution(self)

    class NavBar(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="navbar"]')
        _openstax_logo_link_locator = (By.CSS_SELECTOR, "div > a")

        @property
        def openstax_logo_link(self):
            return self.find_element(*self._openstax_logo_link_locator).get_attribute("href")

    class ToolBar(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="toolbar"]')
        _toc_toggle_button_locator = (
            By.CSS_SELECTOR,
            "[aria-label='Click to open the Table of Contents']",
        )

        @property
        def toc_toggle_button(self):
            return self.find_element(*self._toc_toggle_button_locator)

        def click_toc_toggle_button(self):
            self.offscreen_click(self.toc_toggle_button)
            return self.page.sidebar.wait_for_region_to_display()

    class SideBar(Region):
        _root_locator = (By.CSS_SELECTOR, "[aria-label='Table of Contents']")

        @property
        def header(self):
            return self.Header(self.page)

        class Header(Region):
            _root_locator = (By.CSS_SELECTOR, '[data-testid="tocheader"]')
            _toc_toggle_button_locator = (
                By.CSS_SELECTOR,
                "[aria-label='Click to close the Table of Contents']",
            )
            _chapter_div_locator = (
                By.XPATH,
                "//div[@aria-label='Table of Contents']/nav/ol/li[2]/nav/ol/li[1]/a",
            )

            @property
            def toc_toggle_button(self):
                return self.find_element(*self._toc_toggle_button_locator)

            def click_toc_toggle_button(self):
                self.offscreen_click(self.toc_toggle_button)
                return self.wait.until(
                    expected.invisibility_of_element_located(self.toc_toggle_button)
                )

            @property
            def chapter1_element(self):
                return self.find_element(*self._chapter_div_locator)

            @property
            def chapter1_url(self):
                return self.chapter1_element.get_attribute("href")

    class Attribution(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="attribution-details"]')
        _attribution_toggle_locator = (
            By.CSS_SELECTOR,
            'summary[aria-label="Citation/Attribution"]',
        )
        _section_url_locator = (By.XPATH, "//*[contains(text(), 'Section URL')]/a")
        _book_url_locator = (By.XPATH, "//*[contains(text(), 'Book URL')]/a")
        _access_for_free_locator = (By.XPATH, "//*[contains(text(), 'Access for free at')]/a")

        @property
        def attribution_link(self):
            return self.find_element(*self._attribution_toggle_locator)

        @property
        def attribution_status(self):
            return self.find_element(*self._root_locator)

        @property
        def is_open(self):
            return self.attribution_status.get_attribute("open")

        @property
        def section_url_within_attribution(self):
            return self.find_element(*self._section_url_locator)

        @property
        def section_url(self):
            return self.section_url_within_attribution.get_attribute("href")

        @property
        def book_url_within_attribution(self):
            return self.find_element(*self._book_url_locator)

        @property
        def book_url(self):
            return self.book_url_within_attribution.get_attribute("href")

        @property
        def access_for_free_url_within_attribution(self):
            return self.find_element(*self._access_for_free_locator)

        @property
        def access_for_free_url(self):
            return self.access_for_free_url_within_attribution.get_attribute("href")

        def click_attribution_link(self):
            self.offscreen_click(self.attribution_link)
            return self.page.attribution.wait_for_region_to_display()
