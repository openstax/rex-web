from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected


from pages.base import Page
from regions.base import Region
from regions.content_item import ContentItem


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"
    _title_locator = (By.TAG_NAME, "title")
    _body_locator = (By.TAG_NAME, "body")
    _main_content_locator = (By.CSS_SELECTOR, "h1")
    _next_locator = (By.CSS_SELECTOR, "[aria-label='Next Page']")
    _previous_locator = (By.CSS_SELECTOR, "[aria-label='Previous Page']")

    @property
    def loaded(self):
        return self.find_element(*self._body_locator).get_attribute("data-rex-loaded")

    @property
    def title(self):
        return self.find_element(*self._title_locator)

    @property
    def title_before_click(self):
        return self.title.get_attribute("innerHTML")

    @property
    def next_link(self):
        return self.find_element(*self._next_locator)

    @property
    def previous_link(self):
        return self.find_element(*self._previous_locator)

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

    @property
    def section_url_within_attribution(self):
        return self.find_element(*self._section_url_locator)

    def click_next_link(self):
        self.offscreen_click_and_wait_for_new_title_to_load(self.next_link)

    def click_previous_link(self):
        self.offscreen_click_and_wait_for_new_title_to_load(self.previous_link)

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

        @property
        def toc(self):
            return self.TableOfContents(self.page)

        class Header(Region):
            _root_locator = (By.CSS_SELECTOR, '[data-testid="tocheader"]')
            _toc_toggle_button_locator = (
                By.CSS_SELECTOR,
                "[aria-label='Click to close the Table of Contents']",
            )

            @property
            def toc_toggle_button(self):
                return self.find_element(*self._toc_toggle_button_locator)

            def click_toc_toggle_button(self):
                self.offscreen_click(self.toc_toggle_button)
                return self.wait.until(
                    expected.invisibility_of_element_located(self.toc_toggle_button)
                )

        class TableOfContents(Region):
            _root_locator = (By.CSS_SELECTOR, '[data-testid="toc"]')
            _chapter_toggle = (By.CSS_SELECTOR, "ol li details")
            _toc_chapter_name_locator = (By.XPATH, "(//ol/li/details/summary/div/span)")

            @property
            def chapters(self):
                return [
                    self.ContentChapter(self.page, self.root, index)
                    for index in range(len(self.find_elements(*self._chapter_toggle)))
                ]

            class ContentChapter(ContentItem):
                _root_locator_template = "(.//ol/li/details)[{index}]"
                _page_link_locator = (By.CSS_SELECTOR, "ol li a")

                @property
                def pages(self):
                    return [
                        self.ContentPage(self.page, self.root, index)
                        for index in range(len(self.find_elements(*self._page_link_locator)))
                    ]

                def click(self):
                    self.root.click()
                    chapter = self.__class__(self.page, self.parent_root, self.index)
                    return chapter.wait_for_region_to_display()

                class ContentPage(ContentItem):
                    _root_locator_template = "(.//ol/li/a)[{index}]"
                    _title_locator = (By.CSS_SELECTOR, "span.os-text")

                    def click(self):
                        self.TOC_page_offscreen_click_and_wait_for_new_title_to_load(self.root)

    class Attribution(Region):
        _root_locator = (By.CSS_SELECTOR, '[data-testid="attribution-details"]')
        _attribution_toggle_locator = (
            By.CSS_SELECTOR,
            '[data-testid="attribution-details"] summary',
        )
        _section_url_locator = (By.XPATH, "//*[contains(text(), 'Section URL')]/a")

        @property
        def attribution_link(self):
            return self.find_element(*self._attribution_toggle_locator)

        @property
        def is_open(self):
            return bool(self.root.get_attribute("open"))

        @property
        def section_url_within_attribution(self):
            return self.find_element(*self._section_url_locator)

        @property
        def section_url(self):
            return self.section_url_within_attribution.get_attribute("href")

        def click_attribution_link(self):
            self.offscreen_click(self.attribution_link)
            self.page.attribution.wait_for_region_to_display()
