from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected

from .base import Page
from ..regions.base import Region


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"

    _main_content_locator = (
        By.CSS_SELECTOR,
        '#main-content > div > div > div h1[data-type="document-title"]',
    )
    _table_of_contents_button_locator = (By.CSS_SELECTOR, "#root > div > div > button")
    _table_of_contents_nav_locator = (By.CSS_SELECTOR, "#root > div > div > div > div > nav")

    @property
    def loaded(self):
        return self.find_element(*self._main_content_locator)

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
        _root_locator = (By.CSS_SELECTOR, "#root > div > div > div > div > nav")
