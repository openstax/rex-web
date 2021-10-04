import random

from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

from pages.accounts import Signup
from tests import markers
from pages.content import Content
from utils.utility import Color, Highlight, Utilities


@markers.test_case("C624981")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("business-law-i-essentials", "1-1-basic-american-legal-principles")]
)
def test_change_highlight_color_using_keyboard(selenium, base_url, book_slug, page_slug):
    """Highlight color can be changed using keyboard navigation."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight some text in the page without a note
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE, color=Color.GREEN)
    highlight_no_note = book.content.highlight_ids[0]

    # AND: Navigate to next page and highlight some text with a note
    book.click_next_link()
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(
        target=paragraphs[0],
        offset=Highlight.ENTIRE,
        color=Color.YELLOW,
        note=Utilities.random_string(),
    )
    highlight_with_note = book.content.highlight_ids[0]

    book.reload()

    # WHEN: Tab to the highlight and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Change the highlight color in the active notecard using shift tab and spacebar keys
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (
        ActionChains(selenium)
        .send_keys(Keys.SHIFT + Keys.TAB + Keys.SHIFT)
        .send_keys(Keys.SPACE)
        .perform()
    )

    # AND: Navigate out of the highlight
    (ActionChains(selenium).send_keys("H").perform())

    # THEN: The highlight color is changed
    highlight_classes_0 = book.content.get_highlight(by_id=highlight_with_note)[0].get_attribute(
        "class"
    )
    highlight_0_color_after_color_change = Color.from_html_class(highlight_classes_0)
    assert (
        highlight_0_color_after_color_change == Color.PINK
    ), f"Highlight color in the page {selenium.current_url} is {highlight_0_color_after_color_change}"

    # WHEN: Navigate to the previous page, tab to the highlight without note and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Change the highlight color and navigate out of the highlight
    (ActionChains(selenium).send_keys(Keys.SHIFT + Keys.TAB + Keys.SHIFT).perform())
    (ActionChains(selenium).send_keys(Keys.SPACE).perform())
    (ActionChains(selenium).send_keys("H").send_keys(Keys.TAB).perform())

    # THEN: The highlight color is changed
    highlight_classes_1 = book.content.get_highlight(by_id=highlight_no_note)[0].get_attribute(
        "class"
    )
    highlight_1_color_after_color_change = Color.from_html_class(highlight_classes_1)
    assert (
        highlight_1_color_after_color_change == Color.PINK
    ), f"Highlight color in the page {selenium.current_url} is {highlight_1_color_after_color_change}"


@markers.test_case("C639520")
@markers.desktop_only
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("organizational-behavior", "2-introduction")])
def test_edit_note_using_keyboard(selenium, base_url, book_slug, page_slug):
    """Edit note using keyboard navigation."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight some text in the page without a note
    paragraphs = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraphs[0], offset=Highlight.ENTIRE, color=Color.GREEN)
    highlight_no_note = book.content.highlight_ids[0]
    note_text = Utilities.random_string()

    book.reload()

    # WHEN: Tab to the highlight and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Enter the note in the textbox and hit cancel
    ActionChains(selenium).send_keys(note_text).perform()
    ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform()

    # THEN: The corresponding highlight in the content page is not updated with any note info
    Utilities.click_option(
        driver=selenium,
        element=book.content.get_highlight(by_id=highlight_no_note)[0],
        scroll_to=-130,
    )

    assert (
        book.content.highlight_box.note == ""
    ), "the note is added to highlight even on clicking Cancel"

    book.reload()

    # WHEN: Tab to the highlight and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Enter the note in the textbox and hit save
    (
        ActionChains(selenium)
        .send_keys(note_text)
        .send_keys(Keys.TAB)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # THEN: The corresponding highlight in the content page is not updated with any note info
    Utilities.click_option(
        driver=selenium,
        element=book.content.get_highlight(by_id=highlight_no_note)[0],
        scroll_to=-130,
    )

    assert (
        book.content.highlight_box.note == note_text
    ), "the note text does not match the note added"
