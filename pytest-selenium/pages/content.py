from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as expected

from pages.base import Page
from regions.base import Region


class Content(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"

    _body_locator = (By.TAG_NAME, "body")
    _main_content_locator = (By.CSS_SELECTOR, "h1")
    _next_locator = (By.CSS_SELECTOR, 'a[aria-label="Next Page"]')
    _back_locator = (By.CSS_SELECTOR, 'a[aria-label="Previous Page"]')

   

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

    @property
    def next_link(self):
        return self.find_element(*self._next_locator)

    def next_click(self):
            self.offscreen_click(self.next_link)
            

    @property
    def back_link(self):
        return self.find_element(*self._back_locator)

    def back_click(self):
            self.offscreen_click(self.back_link)
            

    @property
    def current_url(self):
        return self.driver.current_url
     


    class Attribution(Region):
        _root_locator = (By.XPATH,"//summary[contains(@class,'Attribution__Summary')]")
        _attribute_status_locator = (By.XPATH, "//details[contains(@class,'Attribution__Details')]")
        
        @property
        def attribution_link(self):
            return self.find_element(*self._root_locator)

        @property
        def attribution_status(self):
            return self.find_element(*self._attribute_status_locator)

        
        def attribution_click(self):
            self.offscreen_click(self.attribution_link)
            return self.page.attribution.wait_for_region_to_display()
        
        @property
        def is_open(self):
            return self.attribution_status.get_attribute("open")       
        
                    

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
            _TOC_element_locator = (By.XPATH, "//div[@aria-label='Table of Contents']/nav/ol/li[3]/nav/ol/li[1]/a")
          
            
            
            @property
            def toc_toggle_button(self):
                return self.find_element(*self._toc_toggle_button_locator)

            def click_toc_toggle_button(self):
                self.offscreen_click(self.toc_toggle_button)
                return self.wait.until(
                    expected.invisibility_of_element_located(self.toc_toggle_button)
                )

            @property
            def toc_element(self):
                return self.find_element(*self._TOC_element_locator)

            def click_toc_element(self):
                self.offscreen_click(self.toc_element)
            
