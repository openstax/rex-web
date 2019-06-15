import pypom


class Region(pypom.Region):
    @property
    def is_displayed(self):
        return self.root.is_displayed()

    def wait_for_region_to_display(self):
        self.page.wait_for_region_to_display(self)
        return self

    def offscreen_click(self, element=None):
        """Clicks an offscreen element (or the region's root).

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element.
        """
        return self.page.offscreen_click(element or self.root)

    def TOC_click_and_wait_for_new_title_to_load(self):
        """Clicks an offscreen element (or the region's root).

        Clicks the given element, even if it is offscreen, by sending the ENTER key.
        Returns the element after loading the last element (title) of the page).
        """

        title_before_click = self.page.title_before_click
        self.root.click()
        return self.wait.until(
            lambda _: title_before_click != (self.page.title.get_attribute("innerHTML") or "")
        )
