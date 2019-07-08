from selenium.webdriver.common.by import By

from regions.base import Region
from regions.content_item import ContentItem

from selenium.webdriver.common.keys import Keys


class TableOfContents(Region):
    _root_locator = (By.CSS_SELECTOR, "ol")
    _page_link_locator = (By.XPATH, "(.//li/a)")
    _active_page_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

    @property
    def active_page(self):
        return self.find_element(*self._active_page_locator)

    def assert_page_name_in_TOC_is_bolded(self):
        bold = self.active_page.value_of_css_property("font-weight")
        assert bold == "400"

    @property
    def pages(self):
        return [
            self.ContentPage(self.page, self.root, index)
            for index in range(len(self.find_elements(*self._page_link_locator)))
        ]

    class ContentPage(ContentItem):
        _root_locator_template = "(//li/a)[{index}]"

        def click(self):
            self.root.send_keys(Keys.ENTER)
