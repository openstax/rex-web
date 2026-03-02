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


class SummaryMultiChoice:
    def __init__(self, page):
        self.page = page

    # Chapter end - Summary section

    @property
    def summary_section(self):
        return self.page.get_by_text("Summary", exact=True)

    @property
    def summary_section_page(self):
        return self.page.locator(
            "div.os-eoc.os-section-summary-container", has_text="Summary"
        )

    @property
    def summary_section_chapter_link(self):
        return self.page.locator(
            "h3[data-type='document-title']",
            has_text="Explain Why Accounting Is Important to Business Stakeholders",
        )

    # Chapter end - Multiple choice section

    @property
    def multiple_choice_section(self):
        return self.page.get_by_text("Multiple Choice", exact=True)

    @property
    def multiple_choice_section_page(self):
        return self.page.locator(
            "div.os-eoc.os-multiple-choice-container", has_text="Multiple Choice"
        )

    @property
    def multiple_choice_section_chapter_link(self):
        return self.page.locator("p#fs-idm364818304")

    # Chapter end - Questions section

    @property
    def questions_section(self):
        return self.page.get_by_text("Questions", exact=True)

    @property
    def questions_section_page(self):
        return self.page.locator(
            "div.os-eoc.os-questions-container", has_text="Questions"
        )

    @property
    def questions_section_chapter_link(self):
        return self.page.locator("p#fs-idm249293696")

    # Chapter end - Exercise Set B section

    @property
    def exercise_set_section(self):
        return self.page.get_by_text("Exercise Set B", exact=True)

    @property
    def exercise_set_section_page(self):
        return self.page.locator(
            "div.os-eoc.os-exercise-set-b-container", has_text="Exercise Set B"
        )

    @property
    # Link to EB3.LO 3.2Provide the missing amounts of the accounting equation for each of the following companies.
    def exercise_set_section_chapter_link(self):
        return self.page.locator("p#fs-idm676586784")

    # Chapter end - Problem Set A section

    @property
    def problem_set_section(self):
        return self.page.get_by_text("Problem Set A", exact=True)

    @property
    def problem_set_section_page(self):
        return self.page.locator(
            "div.os-eoc.os-problem-set-a-container", has_text="Problem Set A"
        )

    @property
    # Link to PA1.LO 5.1Identify whether each of the following accounts would be considered...
    def problem_set_section_chapter_link(self):
        return self.page.locator("p#fs-idm209245648")

    # Chapter end - Thought Provokers section

    @property
    def tprovokers_section(self):
        return self.page.get_by_text("Thought Provokers", exact=True)

    @property
    def tprovokers_section_page(self):
        return self.page.locator(
            "div.os-eoc.os-thought-provokers-container", has_text="Thought Provokers"
        )

    @property
    # Link to TP5.LO 2.3The following historical information is from Assisi Community Markets.
    def tprovokers_section_chapter_link(self):
        return self.page.locator("p#fs-idm373368272")
