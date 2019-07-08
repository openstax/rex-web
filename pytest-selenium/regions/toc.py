from selenium.webdriver.common.by import By

from regions.base import Region
from regions.content_item import ContentItem

from selenium.webdriver.common.keys import Keys


class TableOfContents(Region):
    _root_locator = (By.CSS_SELECTOR, "ol")
    _active_page_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

    @property
    def active_page(self):
        return self.find_element(*self._active_page_locator)

    def assert_page_name_in_TOC_is_bolded(self):
        bold = self.active_page.value_of_css_property("font-weight")
        assert bold == "400"
