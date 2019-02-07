from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected

from pages.base import Page
from regions.base import Region

# TODO: Ensure only 1 <nav> element exists on the Page
NAV_SELECTOR = "#root > div > div > div > div > nav"


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"

    _body_locator = (By.TAG_NAME, "body")
    _main_content_locator = (By.CSS_SELECTOR, "h1")
    _table_of_contents_button_locator = (
        By.CSS_SELECTOR,
        "[aria-label='Click to close the Table of Contents'], [aria-label='Click to open the Table of Contents']",
    )
    _table_of_contents_nav_locator = (By.CSS_SELECTOR, NAV_SELECTOR)

    @property
    def loaded(self):
        return self.find_element(*self._body_locator).get_attribute("data-rex-loaded")

    @property
    def table_of_contents_nav(self):
        return self.find_element(*self._table_of_contents_nav_locator)

    @property
    def table_of_contents_toggle_button(self):
        return self.find_element(*self._table_of_contents_button_locator)

    def click_table_of_contents_button(self):
        if self.table_of_contents.is_displayed:
            self.offscreen_click(self.table_of_contents_toggle_button)
            return self.wait.until(
                expected.invisibility_of_element_located(self.table_of_contents_nav)
            )
        else:
            self.table_of_contents_toggle_button.click()
        return self.table_of_contents.wait_for_region_to_display()

    @property
    def table_of_contents(self):
        return self.TableOfContents(self)

    class TableOfContents(Region):
        _root_locator = (By.CSS_SELECTOR, NAV_SELECTOR)
