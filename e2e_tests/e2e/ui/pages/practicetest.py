import pytest


class PracticeTest:
    def __init__(self, page):
        self.page = page

    @property
    def exercises_icon(self):
        return self.page.get_by_text("Exercises", exact=True)

    @property
    def practice_test_icon(self):
        return self.page.get_by_text("Practice Test", exact=True)

    @property
    def practice_test_page(self):
        return self.page.locator("section.practice-test")

    @property
    def practice_test_exercise(self):
        return self.page.locator("section.practice-test > div[data-type='exercise']")

    @property
    def practice_test_page_title(self):
        return self.page.locator("h3[data-type='title']", has_text="Practice Test")

    @property
    def practice_test_exercise_link(self):
        return self.page.locator("a.os-number[aria-label='Go to 3']")

    @property
    def practice_test_table_link(self):
        return self.page.get_by_label("View Table 2")

    @property
    def practice_test_table_image(self):
        return self.page.locator("#Table_04_03_31")

    @property
    def practice_test_figure_link(self):
        return self.page.get_by_label("View Figure 3")

    @property
    def practice_test_figure_image(self):
        return self.page.get_by_role(
            "img", name="This image is a graph showing the company's profit"
        )

    @property
    def chapter_answer_key_page(self):
        return self.page.locator("div.os-solution-container", has_text="Chapter 4")
