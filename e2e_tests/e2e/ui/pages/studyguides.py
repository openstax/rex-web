import pytest


class StudyGuides:
    def __init__(self, page):
        self.page = page

    @property
    def study_guides_icon(self):
        return self.page.get_by_label("Guides")

    @property
    def study_guides_page(self):
        return self.page.get_by_test_id("show-studyguides-body")

    @property
    def study_guides_other_filters(self):
        return self.page.get_by_label("Applied filters")

    @property
    def study_guides_filter_by_chapter(self):
        return self.page.get_by_label("Filter study guides by Chapter")

    @property
    def study_guides_filter_by_color(self):
        return self.page.get_by_label("Filter study guides by Color")

    @property
    def study_guides_filter_by_chapter_dropdown(self):
        return self.page.get_by_role("heading", name="The History of Management")

    @property
    def study_guides_filter_by_color_dropdown(self):
        return self.page.locator("#guide-filter-color")

    @property
    def study_guides_unlogged_banner(self):
        return self.page.get_by_text(
            "Expert-created study guides. 100% free!Sign UporLog in"
        )

    @property
    def study_guides_unlogged_banner_signup(self):
        return self.page.locator("a[data-analytics-label='signup']")

    @property
    def study_guides_unlogged_banner_login(self):
        return self.page.get_by_role("link", name="Log in")
