# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from selenium.webdriver.common.by import By

from regions.base import Region


class ContentItem(Region):
    _chapter_section_span_locator = (By.CSS_SELECTOR, "span.os-number")
    _title_span_locator = (By.CSS_SELECTOR, "span.os-text")

    def __init__(self, page, parent_root, index):
        root = parent_root.find_element(
            By.XPATH, self._root_locator_template.format(index=index + 1)
        )
        self.parent_root = parent_root
        self.index = index
        super().__init__(page, root)

    @property
    def chapter_section_span(self):
        return self.find_element(*self._chapter_section_span_locator)

    @property
    def title_span(self):
        return self.find_element(*self._title_span_locator)
