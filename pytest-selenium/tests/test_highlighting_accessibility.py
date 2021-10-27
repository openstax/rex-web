import random

import pytest
from selenium.common.exceptions import NoSuchElementException
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
def test_change_highlight_color_using_keyboard_content_page(
    selenium, base_url, book_slug, page_slug
):
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
def test_add_note_using_keyboard_content_page(selenium, base_url, book_slug, page_slug):
    """Add note using keyboard navigation."""

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

    # AND: Add the note in the textbox and hit cancel
    ActionChains(selenium).send_keys(note_text).perform()
    ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform()

    # THEN: Highlight in the content page is not updated with the note
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

    # AND: Add the note in the textbox and hit save
    (
        ActionChains(selenium)
        .send_keys(note_text)
        .send_keys(Keys.TAB)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # THEN: Highlight in the content page is updated with the note
    Utilities.click_option(
        driver=selenium,
        element=book.content.get_highlight(by_id=highlight_no_note)[0],
        scroll_to=-130,
    )

    assert (
        book.content.highlight_box.note == note_text
    ), "the note text does not match the note added"


@markers.test_case("C626893")
@markers.desktop_only
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("organizational-behavior", "2-introduction")])
def test_edit_note_using_keyboard_content_page(selenium, base_url, book_slug, page_slug):
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

    # AND: Highlight some text in the page with a note
    paragraphs = random.sample(book.content.paragraphs, 1)
    note_text = Utilities.random_string(length=15)
    book.content.highlight(
        target=paragraphs[0], offset=Highlight.ENTIRE, color=Color.GREEN, note=note_text
    )
    highlight_with_note = book.content.highlight_ids[0]
    note_append = Utilities.random_string(length=15)

    book.reload()

    # WHEN: Tab to the highlight and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Select Edit option from the context menu
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())

    # AND: Enter the note in the textbox and hit cancel
    ActionChains(selenium).send_keys(note_append).perform()
    ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform()

    # THEN: The note in the content page is not updated
    Utilities.click_option(
        driver=selenium,
        element=book.content.get_highlight(by_id=highlight_with_note)[0],
        scroll_to=-130,
    )

    assert (
        book.content.highlight_box.note == note_text
    ), "the note is updated even on clicking Cancel"

    book.reload()

    # WHEN: Tab to the highlight and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Select Edit option from the context menu
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())

    # AND: Enter the new note in the textbox and hit save
    (
        ActionChains(selenium)
        .send_keys(note_append)
        .send_keys(Keys.TAB)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # THEN: The note in the content page is updated
    Utilities.click_option(
        driver=selenium,
        element=book.content.get_highlight(by_id=highlight_with_note)[0],
        scroll_to=-130,
    )
    assert (
        book.content.highlight_box.note == note_append + note_text
    ), "the note text does not match the updated text"


@markers.test_case("C626894")
@markers.desktop_only
@markers.highlighting
@markers.parametrize("book_slug, page_slug", [("organizational-behavior", "2-introduction")])
def test_delete_note_using_keyboard_content_page(selenium, base_url, book_slug, page_slug):
    """Delete note using keyboard navigation."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight some text in the page with a note
    paragraphs = random.sample(book.content.paragraphs, 1)
    note_text = Utilities.random_string(length=15)
    book.content.highlight(
        target=paragraphs[0], offset=Highlight.ENTIRE, color=Color.GREEN, note=note_text
    )
    highlight_with_note = book.content.highlight_ids[0]

    book.reload()

    # WHEN: Tab to the highlight and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Select Delete option from the context menu and hit Cancel
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform())

    # THEN: The highlight/note is not deleted
    Utilities.click_option(
        driver=selenium,
        element=book.content.get_highlight(by_id=highlight_with_note)[0],
        scroll_to=-130,
    )

    assert (
        book.content.highlight_box.note == note_text
    ), "the highlight and note is deleted even on clicking Cancel"

    book.reload()

    # WHEN: Tab to the highlight and hit H key
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys("H").perform())

    # AND: Select Edit option from the context menu and hit Delete
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB * 2).send_keys(Keys.ENTER).perform())
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())

    # THEN: The highlight and note is deleted
    assert book.content.highlight_count == 0, (
        "Highlight is not removed from content page: "
        f"found {book.content.highlight_count}, expected {0}"
    )

    with pytest.raises(NoSuchElementException) as ex:
        book.content.highlight_box
    assert "No open highlight boxes found" in str(ex.value)


@markers.test_case("C600015")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def test_toggle_MH_page_context_menu_using_keyboard(selenium, base_url, book_slug, page_slug):
    """Open/close context menu in MH page using keyboard."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight 2 sets of text in the page
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string()
    data = [(paragraph[0], Color.GREEN, note), (paragraph[1], Color.YELLOW, note == "")]
    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)

    # AND: Open MH page
    my_highlights = book.toolbar.my_highlights()
    highlights = my_highlights.highlights.edit_highlight

    # WHEN: Tab to the first context menu (present after the last breadcrumb)
    # AND: Hit Return
    (ActionChains(selenium).send_keys(Keys.TAB * 8).send_keys(Keys.RETURN).perform())

    # THEN: Highlight edit box of the first highlight is open
    assert highlights[0].highlight_edit_box_open

    # AND: The focus is on the context menu of the first highlight
    assert selenium.switch_to.active_element == highlights[0].context_menu

    # WHEN: Hit Return
    (ActionChains(selenium).send_keys(Keys.RETURN).perform())

    # THEN: The highlight edit box of the first highlight is closed
    assert not highlights[0].highlight_edit_box_open

    # AND: The focus is on the context menu of the same highlight
    assert selenium.switch_to.active_element == highlights[0].context_menu

    # WHEN: Hit tab once and Enter
    (ActionChains(selenium).send_keys(Keys.TAB * 1).send_keys(Keys.ENTER).perform())

    # THEN: Highlight edit box of the second highlight is open
    assert highlights[1].highlight_edit_box_open

    # AND: The focus is on the context menu of the second highlight
    assert selenium.switch_to.active_element == highlights[1].context_menu

    # WHEN: Hit Escape
    (ActionChains(selenium).send_keys(Keys.ESCAPE).perform())

    # THEN: The highlight edit box of the second highlight is closed
    assert not highlights[1].highlight_edit_box_open

    # AND: The focus is on the context menu of the same highlight
    assert selenium.switch_to.active_element == highlights[1].context_menu

    # WHEN: Hit Esc
    (ActionChains(selenium).send_keys(Keys.ESCAPE).perform())

    # THEN: MH page is closed
    assert not book.my_highlights_open, "My Highlights and Notes modal is still open"


@markers.test_case("C600017")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def test_change_highlight_color_from_MH_page_context_menu_using_keyboard(
    selenium, base_url, book_slug, page_slug
):
    """Change highlight color using keyboard navigation in MH page."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight some text in the page
    paragraph = random.sample(book.content.paragraphs, 1)
    note = Utilities.random_string()
    book.content.highlight(
        target=paragraph[0], offset=Highlight.RANDOM, color=Color.GREEN, note=note
    )

    # AND: Open MH page
    my_highlights = book.toolbar.my_highlights()
    highlights = my_highlights.highlights.edit_highlight
    highlight_id = highlights[0].mh_highlight_id

    # WHEN: Tab to the context menu and hit Return
    (ActionChains(selenium).send_keys(Keys.TAB * 7).send_keys(Keys.RETURN).perform())

    # AND: Tab 4 times to select Purple color and hit Spacebar
    (
        ActionChains(selenium)
        .send_keys(Keys.TAB * 4)
        .send_keys(Keys.RETURN)
        .send_keys(Keys.SPACE)
        .perform()
    )

    # THEN: The highlight color in MH page is changed to purple
    assert highlights[0].highlight_color == "purple"

    # AND: The focus stays on purple color
    assert selenium.switch_to.active_element == highlights[0].purple

    # WHEN: Hit Esc twice to close the MH modal
    (ActionChains(selenium).send_keys(Keys.ESCAPE * 2).perform())

    highlight_classes = book.content.get_highlight(by_id=highlight_id)[0].get_attribute("class")
    highlight_color_in_content_page_after_MH_color_change = Color.from_html_class(highlight_classes)

    # THEN: The highlight color in the content page is changed to purple
    assert (
        highlight_color_in_content_page_after_MH_color_change == Color.PURPLE
    ), "the current highlight color does not match the new color"


@markers.test_case("C600018")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def test_add_note_from_MH_page_using_keyboard_navigation(selenium, base_url, book_slug, page_slug):
    """Add note from MH page using keyboard navigation."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight some text in the page
    paragraph = random.sample(book.content.paragraphs, 1)
    book.content.highlight(target=paragraph[0], offset=Highlight.RANDOM)

    # AND: Open MH page
    my_highlights = book.toolbar.my_highlights()
    highlight = my_highlights.highlights.edit_highlight
    highlight_id = highlight[0].mh_highlight_id
    note_text = Utilities.random_string()

    # WHEN: Open the context menu
    (ActionChains(selenium).send_keys(Keys.TAB * 7).send_keys(Keys.RETURN).perform())

    # AND: Select Add note
    (ActionChains(selenium).send_keys(Keys.TAB * 6).send_keys(Keys.RETURN).perform())

    # AND: Enter the note in the textbox and hit cancel
    (
        ActionChains(selenium)
        .send_keys(note_text)
        .send_keys(Keys.TAB * 2)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # AND: Close the MH page
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())

    # THEN: The corresponding highlight in the content page is not updated with any note info
    Utilities.click_option(
        driver=selenium, element=book.content.get_highlight(by_id=highlight_id)[0], scroll_to=-130
    )

    assert (
        book.content.highlight_box.note == ""
    ), "the note is added to highlight even on clicking Cancel in MH page"

    book.toolbar.my_highlights()

    # WHEN: Open the context menu
    (ActionChains(selenium).send_keys(Keys.TAB * 7).send_keys(Keys.RETURN).perform())

    # AND: Select Add note
    (ActionChains(selenium).send_keys(Keys.TAB * 6).send_keys(Keys.RETURN).perform())

    # AND: Enter the note in the textbox and hit save
    (
        ActionChains(selenium)
        .send_keys(note_text)
        .send_keys(Keys.TAB)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # AND: Close the MH page
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())

    # THEN: The corresponding highlight in the content page is updated with the note added in MH page
    Utilities.click_option(
        driver=selenium, element=book.content.get_highlight(by_id=highlight_id)[0], scroll_to=-130
    )

    assert (
        book.content.highlight_box.note == note_text
    ), "the note text does not match the note added in MH page"


@markers.test_case("C622375")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def test_edit_note_from_MH_page_using_keyboard_navigation(selenium, base_url, book_slug, page_slug):
    """Edit note from MH page using keyboard navigation."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight some text in the page
    paragraph = random.sample(book.content.paragraphs, 1)
    note = Utilities.random_string()
    book.content.highlight(target=paragraph[0], offset=Highlight.RANDOM, note=note)

    # AND: Open MH page
    my_highlights = book.toolbar.my_highlights()
    highlight = my_highlights.highlights.edit_highlight
    highlight_id = highlight[0].mh_highlight_id
    note_append = Utilities.random_string()

    # WHEN: Open the context menu
    (ActionChains(selenium).send_keys(Keys.TAB * 7).send_keys(Keys.RETURN).perform())

    # AND: Select Edit note
    (ActionChains(selenium).send_keys(Keys.TAB * 6).send_keys(Keys.RETURN).perform())

    # AND: Update the note in the textbox and hit cancel
    (
        ActionChains(selenium)
        .send_keys(note_append)
        .send_keys(Keys.TAB * 2)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # AND: Close the MH page
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())

    # THEN: The corresponding highlight in the content page is not updated with new note info
    Utilities.click_option(
        driver=selenium, element=book.content.get_highlight(by_id=highlight_id)[0], scroll_to=-130
    )

    assert (
        book.content.highlight_box.note == note
    ), "the note is updated even on clicking Cancel in MH page"

    book.toolbar.my_highlights()

    # WHEN: Open the context menu
    (ActionChains(selenium).send_keys(Keys.TAB * 7).send_keys(Keys.RETURN).perform())

    # AND: Select Edit note
    (ActionChains(selenium).send_keys(Keys.TAB * 6).send_keys(Keys.RETURN).perform())

    # AND: Update the note in the textbox and hit save
    (
        ActionChains(selenium)
        .send_keys(note_append)
        .send_keys(Keys.TAB)
        .send_keys(Keys.ENTER)
        .perform()
    )

    # AND: Close the MH page
    (ActionChains(selenium).send_keys(Keys.TAB).send_keys(Keys.ENTER).perform())

    # THEN: The corresponding highlight in the content page is updated with the new note text
    Utilities.click_option(
        driver=selenium, element=book.content.get_highlight(by_id=highlight_id)[0], scroll_to=-130
    )

    assert (
        book.content.highlight_box.note == note_append + note
    ), "the note text does not match the note updated in MH page"


@markers.test_case("C600019")
@markers.desktop_only
@markers.highlighting
@markers.parametrize(
    "book_slug, page_slug", [("organizational-behavior", "1-1-the-nature-of-work")]
)
def test_delete_highlight_from_MH_page_using_keyboard_navigation(
    selenium, base_url, book_slug, page_slug
):
    """Deleting highlight from MH page using_keyboard_navigation."""

    # GIVEN: Login book page
    book = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    while book.notification_present:
        book.notification.got_it()
    book.navbar.click_login()
    name, email = Signup(selenium).register()

    book.wait_for_page_to_load()
    while book.notification_present:
        book.notification.got_it()

    # AND: Highlight 2 set of texts in the page
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string(length=50)
    data = [(paragraph[0], Color.GREEN, note), (paragraph[1], Color.YELLOW, "")]

    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)

        my_highlights = book.toolbar.my_highlights()
        highlights = my_highlights.highlights.edit_highlight

        # WHEN: Open the context menu
        (ActionChains(selenium).send_keys(Keys.TAB * 7).send_keys(Keys.RETURN).perform())

        # AND: Select Delete note
        (ActionChains(selenium).send_keys(Keys.TAB * 7).send_keys(Keys.RETURN).perform())

        # THEN: Delete confirmation message is displayed
        assert (
            highlights[0].confirm_delete_message
            == "Are you sure you want to delete this note and highlight?"
            if highlights[0].note_present
            else "Are you sure you want to delete this highlight?"
        ), (
            "delete confirmation message is incorrect"
            f"message displayed: {highlights[0].confirm_delete_message}"
        )

        # WHEN: Hit Cancel in the delete confirmation dialog
        (ActionChains(selenium).send_keys(Keys.TAB * 2).pause(1).send_keys(Keys.ENTER).perform())

        # THEN: The highlight is not removed from MH page
        assert (
            len(my_highlights.all_highlights) == 1
        ), "Highlight is removed from MH page even on hitting Cancel in delete confirmation dialog"

        # WHEN: Open the context menu
        (ActionChains(selenium).send_keys(Keys.TAB * 8).pause(1).send_keys(Keys.ENTER).perform())

        # AND: Select Delete note
        (ActionChains(selenium).send_keys(Keys.TAB * 7).pause(1).send_keys(Keys.RETURN).perform())

        # AND: Hit Save in the delete confirmation dialog
        (ActionChains(selenium).send_keys(Keys.TAB * 1).pause(1).send_keys(Keys.ENTER).perform())

        # THEN: The highlight is removed from the MH page
        assert (
            len(my_highlights.all_highlights) == 0
        ), "Highlight is not removed from MH page even on hitting Save in delete confirmation dialog"

        my_highlights.close()

        # AND: The highlight deleted in MH page is removed from the content page
        assert book.content.highlight_count == 0, (
            "Highlight deleted in MH page is not removed from content page: "
            f"found {book.content.highlight_count}, expected {0}"
        )

        with pytest.raises(NoSuchElementException) as ex:
            book.content.highlight_box
        assert "No open highlight boxes found" in str(ex.value)
