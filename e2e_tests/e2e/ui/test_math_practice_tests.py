import pytest

from e2e_tests.e2e.ui.pages.practicetest import PracticeTest


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

    # THEN: Exercises and Practice Test links are visible (only in some match books)
    await practicetest.exercises_icon.click()

    assert await practicetest.practice_test_icon.is_visible()

    await practicetest.practice_test_icon.click()

    await chrome_page.keyboard.press("Escape")

    # THEN: Practice test page opens and contains exercises, tables, figures
    assert await practicetest.practice_test_page_title.is_visible()

    assert await practicetest.practice_test_page.is_visible()
    assert await practicetest.practice_test_exercise.count() is not None

    await practicetest.practice_test_exercise_link.click()

    # THEN: Exercise, table and figure links work
    assert "chapter-4" in chrome_page.url and "solution" in chrome_page.url

    assert await practicetest.chapter_answer_key_page.is_visible()

    await chrome_page.go_back()

    await practicetest.practice_test_table_link.click()

    assert await practicetest.practice_test_table_image.is_visible()

    assert await practicetest.practice_test_page.is_visible()
    assert await practicetest.practice_test_exercise.count() is not None

    await practicetest.practice_test_figure_link.click()

    assert await practicetest.practice_test_figure_image.is_visible()

    assert await practicetest.practice_test_page.is_visible()
    assert await practicetest.practice_test_exercise.count() is not None
