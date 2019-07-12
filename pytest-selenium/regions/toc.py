from selenium.webdriver.common.by import By

from regions.base import Region
from regions.content_item import ContentItem
from pages import content
from pages import base

from selenium.webdriver.common.keys import Keys


class TableOfContents(Region):
    _root_locator = (By.CSS_SELECTOR, "ol")
    _page_link_locator = (By.XPATH, "(.//li/a)")
    _active_page_locator = (By.CSS_SELECTOR, "[aria-label='Current Page']")

    # _title_locator = (By.TAG_NAME, "title")
    #
    # @property
    # def title(self):
    #     return self.find_element(*self._title_locator)
    #
    # @property
    # def title_before_click(self):
    #     return self.title.get_attribute("innerHTML")

    @property
    def active_page(self):
        return self.find_element(*self._active_page_locator)

    @property
    def font_property_of_selected_page(self):
        bold = self.active_page.value_of_css_property("font-weight")
        return bold

    @property
    def head(self):
        return self.head(self)

    @property
    def pages(self):
        return [
            self.ContentPage(self.page, self.root, index)
            for index in range(len(self.find_elements(*self._page_link_locator)))
        ]

    class ContentPage(ContentItem):
        _root_locator_template = "(//li/a)[{index}]"

        def click(self):
            title_before_click = self.title_before_click
            print(title_before_click)
            self.root.send_keys(Keys.ENTER)
            # page = self.__class__(self.page, self.parent_root, self.index)
            return self.page.wait_for_region_to_display()

        # def click_and_wait_for_load(self):
        #     """Clicks an offscreen element and waits for title to load.

        #     Clicks the given element, even if it is offscreen, by sending the ENTER key.
        #     Returns after loading the last element (title) of the page).
        #     """
        #     title_before_click = content.title_before_click
        #     self.root.send_keys(Keys.ENTER)
        #     return self.wait.until(
        #         lambda _: title_before_click != (self.page.title.get_attribute("innerHTML") or "")
        #     )
