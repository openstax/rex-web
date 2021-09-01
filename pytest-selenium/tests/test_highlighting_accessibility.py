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
@markers.parametrize("book_slug, page_slug", [("organizational-behavior", "2-introduction")])
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

    # AND: Highlight 2 set of texts in the page
    paragraph = random.sample(book.content.paragraphs, 2)
    note = Utilities.random_string()
    content_highlight_ids = book.content.highlight_ids

    data = [(paragraph[0], Color.GREEN, note), (paragraph[1], Color.YELLOW, note == "")]

    for paragraphs, colors, note in data:
        book.content.highlight(target=paragraphs, offset=Highlight.RANDOM, color=colors, note=note)
        content_highlight_ids = content_highlight_ids + list(
            set(book.content.highlight_ids) - set(content_highlight_ids)
        )

    book.reload()

    (ActionChains(selenium).send_keys(Keys.TAB).perform())
    assert selenium.switch_to.active_element == book.skip_to_content
