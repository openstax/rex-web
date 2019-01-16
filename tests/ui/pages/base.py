import pypom


class Page(pypom.Page):
    def __init__(self, driver, base_url=None, timeout=30, **url_kwargs):
        super().__init__(driver, base_url, timeout, **url_kwargs)

    @property
    def current_url(self):
        return self.driver.current_url
