from random import choice
from string import digits, ascii_letters
import pytest
from pages.content import Content
from tests import markers
from regions.search_sidebar import SearchSidebar
from regions import base

from time import sleep

import re


@markers.test_case("C543235")
@markers.parametrize("page_slug", ["preface"])
@markers.nondestructive
def test_message_when_search_yields_no_results(selenium, base_url, book_slug, page_slug):
    # GIVEN: book page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    mobile = content.mobile
    search_sidebar = content.sidebar.search_sidebar
    page_before_search = content.current_url

    # using regex to create a random search term
    search_term = "".join(choice(digits + ascii_letters) for i in range(25))

    # WHEN: search is triggered for a term which yields no results
    if content.is_desktop:
        toolbar.search_for(search_term)

    if content.is_mobile:
        mobile.search_for(search_term)

    assert content.is_scrolled_to_top()

    # THEN: search sidebar displays the message "Sorry, no results found for ‘<search_term>'"
    assert search_sidebar.has_no_results

    # AND: confirm the term displayed in the message matches the search_term keyed in
    assert search_term in search_sidebar.no_results_message

    # AND: user stays in the same page as before executing the search
    assert content.current_url == page_before_search


# @markers.test_case("c")
@markers.parametrize("page_slug,search_term", [("preface", "molecule")])
# @markers.parametrize("search_term", ["molecule"])
@markers.nondestructive
def test_search_results(selenium, base_url, book_slug, page_slug, search_term):
    # GIVEN: book page is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    mobile = content.mobile
    sidebar = content.sidebar
    search_sidebar = content.sidebar.search_sidebar

    # WHEN: search is triggered for a term which yields no results
    if content.is_desktop:
        toolbar.search_for(search_term)

    if content.is_mobile:
        mobile.search_for(search_term)

    sleep(3)

    # assert TOC is closed when search results are open
    assert not sidebar.header.is_displayed

    # assert 'no search results message' is not displayed
    assert not search_sidebar.has_no_results

    # all chapters are expanded by default in search sidebar
    assert search_sidebar.all_chapters_are_in_expanded_state

    # content page loads the first hit
    assert search_sidebar.content_of_first_search_result_is_loaded()

    print(search_sidebar.number_chapters)

    search_sidebar.SearchPanelChapter.is_chapter_title_expanded()
