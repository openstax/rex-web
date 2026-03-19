from ipaddress import summarize_address_range

import pytest

from e2e_tests.e2e.ui.pages.chapterend import PracticeTest
from e2e_tests.e2e.ui.pages.chapterend import SummaryMultiChoice


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [("college-algebra-2e", "4-2-modeling-with-linear-functions")],
)
async def test_math_practice_tests(chrome_page, base_url, book_slug, page_slug):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    practicetest = PracticeTest(chrome_page)

    # THEN: Exercises and Practice Test links are visible (only in some math books)
    await practicetest.exercises_icon.click()

    assert await practicetest.practice_test_icon.is_visible()

    await practicetest.practice_test_icon.click()

    await chrome_page.keyboard.press("Escape")

    # THEN: Practice test page opens and contains exercises, tables, figures
    assert await practicetest.practice_test_page_title.is_visible()

    assert await practicetest.practice_test_page.is_visible()
    assert await practicetest.practice_test_exercise.count() > 0

    await practicetest.practice_test_exercise_link.click()

    # THEN: Exercise, table and figure links work
    assert "chapter-4" in chrome_page.url and "solution" in chrome_page.url

    assert await practicetest.chapter_answer_key_page.is_visible()

    await chrome_page.go_back()

    await practicetest.practice_test_table_link.click()

    assert await practicetest.practice_test_table_image.is_visible()

    assert await practicetest.practice_test_page.is_visible()
    assert await practicetest.practice_test_exercise.count() > 0

    await practicetest.practice_test_figure_link.click()

    assert await practicetest.practice_test_figure_image.is_visible()

    assert await practicetest.practice_test_page.is_visible()
    assert await practicetest.practice_test_exercise.count() > 0


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [("principles-financial-accounting", "1-why-it-matters")],
)
async def test_accounting_summary_section(chrome_page, base_url, book_slug, page_slug):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    summarymultichoice = SummaryMultiChoice(chrome_page)

    # THEN: Exercises and Practice Test links are visible (only in some math books)

    await summarymultichoice.summary_section.click()

    await chrome_page.keyboard.press("Escape")

    assert await summarymultichoice.summary_section_page.is_visible()

    await summarymultichoice.summary_section_chapter_link.click()

    assert (
        "Explain Why Accounting Is Important to Business Stakeholders".lower()
        in chrome_page.url.replace("-", " ")
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [
        (
            "principles-financial-accounting",
            "10-1-describe-and-demonstrate-the-basic-inventory-valuation-methods-and-their-cost-flow-assumptions",
        )
    ],
)
async def test_accounting_multiple_choice_section(
    chrome_page, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    summarymultichoice = SummaryMultiChoice(chrome_page)

    # THEN: Exercises and Practice Test links are visible (only in some math books)

    await summarymultichoice.multiple_choice_section.click()

    await chrome_page.keyboard.press("Escape")

    assert await summarymultichoice.multiple_choice_section_page.is_visible()

    await summarymultichoice.multiple_choice_section_chapter_link.click()

    assert (
        "Describe and Demonstrate the Basic Inventory Valuation Methods and "
        "Their Cost Flow As"
    ).lower() in chrome_page.url.replace("-", " ")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [
        (
            "principles-financial-accounting",
            "16-3-prepare-the-statement-of-cash-flows-using-the-indirect-method",
        )
    ],
)
async def test_accounting_questions_section(
    chrome_page, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    summarymultichoice = SummaryMultiChoice(chrome_page)

    # THEN: Exercises and Practice Test links are visible (only in some math books)

    await summarymultichoice.questions_section.click()

    await chrome_page.keyboard.press("Escape")

    assert await summarymultichoice.questions_section_page.is_visible()

    await summarymultichoice.questions_section_chapter_link.click()

    assert (
        "Prepare the Completed Statement of Cash Flows Using the Indirect Method"
    ).lower() in chrome_page.url.replace("-", " ")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [
        (
            "principles-financial-accounting",
            "3-6-prepare-a-trial-balance",
        )
    ],
)
async def test_accounting_exercise_set_section(
    chrome_page, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    summarymultichoice = SummaryMultiChoice(chrome_page)

    # THEN: Exercises and Practice Test links are visible (only in some math books)

    await summarymultichoice.exercise_set_section.click()

    await chrome_page.keyboard.press("Escape")

    assert await summarymultichoice.exercise_set_section_page.is_visible()

    await summarymultichoice.exercise_set_section_chapter_link.click()

    assert (
        "Define and Describe the Expanded Accounting Equation and Its Relationship to Analyzing"
    ).lower() in chrome_page.url.replace("-", " ")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [
        (
            "principles-financial-accounting",
            "5-2-prepare-a-post-closing-trial-balance",
        )
    ],
)
async def test_accounting_problem_set_section(
    chrome_page, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    summarymultichoice = SummaryMultiChoice(chrome_page)

    # THEN: Exercises and Practice Test links are visible (only in some math books)
    await summarymultichoice.problem_set_section.click()

    await chrome_page.keyboard.press("Escape")

    assert await summarymultichoice.problem_set_section_page.is_visible()

    await summarymultichoice.problem_set_section_chapter_link.click()

    assert (
        "Describe and Prepare Closing Entries for a Business"
    ).lower() in chrome_page.url.replace("-", " ")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "book_slug, page_slug",
    [
        (
            "principles-financial-accounting",
            "2-3-prepare-an-income-statement-statement-of-owners-equity-and-balance-sheet",
        )
    ],
)
async def test_accounting_thought_provokers_section(
    chrome_page, base_url, book_slug, page_slug
):

    # GIVEN: Playwright, chromium and the rex_base_url

    # WHEN: The Home page is fully loaded
    await chrome_page.goto(f"{base_url}/books/{book_slug}/pages/{page_slug}")
    summarymultichoice = SummaryMultiChoice(chrome_page)

    # THEN: Exercises and Practice Test links are visible (only in some math books)
    await summarymultichoice.tprovokers_section.click()

    await chrome_page.keyboard.press("Escape")

    assert await summarymultichoice.tprovokers_section_page.is_visible()

    await summarymultichoice.tprovokers_section_chapter_link.click()

    assert "Prepare an Income Statement, Statement of".replace(
        ",", ""
    ).lower() in chrome_page.url.replace("-", " ")
