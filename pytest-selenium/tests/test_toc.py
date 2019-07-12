import pytest
from pages.content import Content
from . import markers


@markers.test_case("C250849", "C242270")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_toc_toggle_button_opens_and_closes(selenium, base_url, book_slug, page_slug):
    """ Test that table of contents toggle button opens and closes the sidebar

    The table of contents sidebar is open by default for desktop resolutions
    and closed for mobile and tablet. We need to do different actions based
    on the resolution. When the resolution is desktop we
    click the toc button on the sidebar to close and the toc button on the
    toolbar to open. It's the other way around for mobile and tablet because
    the sidebar is closed by default.

    """
    # GIVEN: The selenium driver, base_url, book_slug, and page_slug

    # WHEN: The book and page URL is loaded
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    toolbar = content.toolbar
    sidebar = content.sidebar
    toc = content.sidebar.toc

    # AND: Window width is 1024 or greater (Desktop)
    if content.is_desktop:

        # THEN: Sidebar is open by default
        assert sidebar.header.is_displayed

        # AND: The page name in the sidebar is bolded to indicate that its selected
        bold = "400"
        assert toc.font_property_of_selected_page == bold

        # WHEN: The toc button on the sidebar is clicked
        # THEN: The sidebar area has been closed
        # AND: The toc button on the toolbar is clicked
        # AND: The side bar is opened again
        sidebar.header.click_toc_toggle_button()

        assert not sidebar.header.is_displayed

        toolbar.click_toc_toggle_button()

        assert sidebar.header.is_displayed

    # AND: Window Size is Mobile
    elif content.is_mobile:

        # THEN: Sidebar is closed by default
        assert not sidebar.header.is_displayed

        # WHEN: The toc button on the toolbar is clicked
        # THEN: The sidebar area is opened
        # AND: The page name in the sidebar is bolded to indicate that its selected
        # AND: The toc button on the sidebar is clicked
        # AND: the sidebar area is closed
        toolbar.click_toc_toggle_button()

        assert sidebar.header.is_displayed

        bold = "400"
        assert toc.font_property_of_selected_page == bold

        sidebar.header.click_toc_toggle_button()

        assert not sidebar.header.is_displayed

    else:

        pytest.fail("window must be either mobile or desktop size")


@markers.test_case("C476819")
@markers.parametrize(
    "book_slug,page_slug",
    [
        (
            "college-physics",
            "1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units",
        )
    ],
)
@markers.nondestructive
# @markers.mobile_only
def test_toc_closes_after_selecting_page_in_mobile(selenium, base_url, book_slug, page_slug):
    # GIVEN: The selenium driver, base_url, book_slug, and page_slug is opened in mobile resolution
    # AND: The TOC is opened

    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()

    # toolbar = content.toolbar
    sidebar = content.sidebar
    toc = content.sidebar.toc

    # toolbar.click_toc_toggle_button()

    # WHEN: The page in the ToC is clicked
    # THEN: The page loads and the ToC is automatically closed

    pages = toc.pages[0]
    pages.click()

    from time import sleep

    # sleep(4)

    assert not sidebar.is_displayed


@markers.test_case("C476818")
@markers.parametrize("book_slug,page_slug", [("college-physics", "1-1-physics-an-introduction")])
@markers.nondestructive
@markers.mobile_only
def test_toc_disables_interacting_with_content_on_mobile(selenium, base_url, book_slug, page_slug):

    # GIVEN: A page URL in the format of {base_url}/books/{book_slug}/pages/{page_slug}
    # AND: A mobile resolution
    content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
    toolbar = content.toolbar
    attribution = content.attribution
    sidebar = content.sidebar

    # WHEN: the toc is open
    toolbar.click_toc_toggle_button()

    # THEN: The links in the content should be disabled
    content.assert_element_not_interactable_exception(content.next_link)
    content.assert_element_not_interactable_exception(content.previous_link)
    content.assert_element_not_interactable_exception(attribution.attribution_link)

    # AND scrolling over it should do nothing
    with pytest.raises(Exception) as exc_info:
        content.scroll_over_content_overlay()

    exception_raised = exc_info.type
    assert "ElementClickInterceptedException" in str(exception_raised)

    # AND clicking anywhere in the content overlay should just close the TOC and content stays in the same page
    initial_url = selenium.current_url
    content.click_content_overlay()
    assert not sidebar.is_displayed
    assert selenium.current_url == initial_url
