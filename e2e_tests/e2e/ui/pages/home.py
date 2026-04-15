import pytest


class HomeRex:
    def __init__(self, page):
        self.page = page

    # openstax.org homepage

    @pytest.mark.asyncio
    async def click_openstax_logo(self):
        await self.page.get_by_test_id("navbar").get_by_role("img").click()

    # Subjects homepage

    @property
    def book_toc_slideout_is_visible(self):
        return self.page.get_by_test_id("toc")

    @pytest.mark.asyncio
    async def click_book_cover_link(self):
        await self.page.locator("a").get_by_text("Calculus Volume 1").click()

    # Highlights and Notes

    @pytest.mark.asyncio
    async def highlights_option_is_visible(self):
        return await self.page.locator("#nudge-study-tools").is_visible()

    @pytest.mark.asyncio
    async def click_highlights_option(self):
        await self.page.locator("#nudge-study-tools > button").click()

    @pytest.mark.asyncio
    async def close_highlights_option_page(self):
        await self.page.get_by_test_id("close-highlights-popup").click()

    @property
    def highlights_option_page(self):
        return self.page.locator("div").get_by_test_id("highlights-popup-wrapper")

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu(self):
        await self.page.get_by_test_id("highlight-dropdown-menu-toggle").first.click()

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu_edit(self):
        await self.page.locator("li").get_by_role("button", name="Edit").click()

    @pytest.mark.asyncio
    async def fill_highlights_option_edit_note_field(self, value):
        await self.page.locator("textarea[placeholder='Add a note']").fill(value)

    @pytest.mark.asyncio
    async def click_highlights_option_edit_save_button(self):
        await self.page.locator("div").get_by_role("button", name="Save").click()

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu_delete(self):
        await self.page.locator("li").get_by_role("button", name="Delete").click()

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu_delete_delete(self):
        await self.page.locator("div").get_by_test_id("delete").click()

    @property
    def highlights_option_page_is_empty(self):
        return self.page.locator("div").get_by_test_id("show-myhighlights-body")

    # Book page navigation

    @pytest.mark.asyncio
    async def content_page_previous_next_page_bar_is_visible(self):
        prevnext_locator = self.page.locator('[data-analytics-region="prev-next"]')
        await prevnext_locator.scroll_into_view_if_needed()
        return await prevnext_locator.is_visible()

    @pytest.mark.asyncio
    async def click_content_page_previous_link(self):
        prev_locator = self.page.locator(
            '[data-analytics-region="prev-next"] [data-analytics-label="prev"]'
        )
        await prev_locator.scroll_into_view_if_needed()
        await prev_locator.click()

    @pytest.mark.asyncio
    async def click_content_page_next_link(self):
        next_locator = self.page.locator(
            '[data-analytics-region="prev-next"] [data-analytics-label="next"]'
        )
        await next_locator.scroll_into_view_if_needed()
        await next_locator.click()

    @pytest.mark.asyncio
    async def subject_listing_book_is_visible(self):
        return await self.page.locator("a").get_by_text("Astronomy").is_visible()

    @pytest.mark.asyncio
    async def click_cookieyes_accept(self):
        await self.page.get_by_role("button", name="Accept All").click()

    # Accessibility page (hidden link: go to accessibility page)

    @property
    def accessibility_help_content(self):
        return self.page.locator("#maincontent > div")

    # Login

    @property
    def login_page(self):
        return self.page.locator("#login-page")

    @property
    def signup_page(self):
        return self.page.get_by_role("heading", name="Welcome! Join OpenStax as")

    @property
    def signup_page_student(self):
        return self.page.get_by_role("link", name="Student")

    @property
    def signup_page_educator_researcher(self):
        return self.page.get_by_role("link", name="Educator / Researcher")

    @property
    def signup_page_facebook_link(self):
        return self.page.get_by_role("link", name="Facebook")

    @property
    def signup_page_google_link(self):
        return self.page.get_by_role("link", name="Google")

    @property
    def login_link(self):
        return self.page.get_by_role("link", name="Log in")

    @pytest.mark.asyncio
    async def fill_user_field(self, value):
        await self.page.locator("#login_form_email").fill(value)

    @pytest.mark.asyncio
    async def fill_password_field(self, value):
        await self.page.locator("#login_form_password").fill(value)

    @pytest.mark.asyncio
    async def click_continue_login(self):
        await self.page.locator("input.primary").get_by_text("Continue").click()

    @pytest.mark.asyncio
    async def logged_in_user_dropdown_is_visible(self):
        return (
            await self.page.locator("div")
            .get_by_test_id("user-nav-toggle")
            .is_visible()
        )

    @pytest.mark.asyncio
    async def click_logged_in_user_dropdown(self):
        await self.page.locator("div").get_by_test_id("user-nav-toggle").click()

    @pytest.mark.asyncio
    async def logout_link_is_visible(self):
        return await self.page.get_by_role("menuitem", name="Log out").is_visible()

    @pytest.mark.asyncio
    async def click_logout_link(self):
        await self.page.get_by_role("menuitem", name="Log out").click()

    @property
    def small_login_box(self):
        return self.page.get_by_text(
            "Log in to highlight and take notes. It’s 100% free.Log inCancel"
        )

    @pytest.mark.asyncio
    async def click_small_login_box_cancel(self):
        await self.page.get_by_role("button", name="Cancel").click()

    @pytest.mark.asyncio
    async def click_small_login_box_login(self):
        await self.page.get_by_test_id("confirm").click()

    # Book chapter section

    @pytest.mark.asyncio
    async def double_click_text(self):
        await self.page.locator("p#eip-342").dblclick()

    @pytest.mark.asyncio
    async def click_other_text(self):
        await self.page.locator("#fs-id1170323854379").click()

    @pytest.mark.asyncio
    async def select_text(self):
        await self.page.locator("p:has-text('impact history')").select_text()

    @pytest.mark.asyncio
    async def click_astronomy_book_chapter93(self):
        await self.page.get_by_test_id("content-link-test").get_by_text(
            "Impact Craters"
        ).click()

    # Highlight box and highlights

    @pytest.mark.asyncio
    async def highlight_box_trash_icon_is_visible(self):
        return await self.page.get_by_label("Deselect current highlight").is_visible()

    @pytest.mark.asyncio
    async def click_highlight_box_trash_icon(self):
        await self.page.get_by_label("Deselect current highlight").click()

    @pytest.mark.asyncio
    async def oneclick_highlight_infobox(self):
        await self.page.get_by_label("Edit highlighted note").click()

    @property
    def highlight_infobox(self):
        return self.page.get_by_label("Edit highlighted note")

    @pytest.mark.asyncio
    async def highlight_box_is_visible(self):
        return await self.page.locator("#note-textarea").is_visible()

    @pytest.mark.asyncio
    async def click_highlight_box_note_field(self):
        await self.page.locator("#note-textarea").click()

    @pytest.mark.asyncio
    async def fill_highlight_box_note_field(self, value):
        await self.page.locator("#note-textarea").fill(value)

    @pytest.mark.asyncio
    async def highlight_box_colours_are_visible(self):
        return (
            await self.page.locator("div")
            .get_by_test_id("highlight-colours-picker")
            .is_visible()
        )

    @pytest.mark.asyncio
    async def click_highlight_box_purple_colour(self):
        await self.page.locator("div").get_by_title("purple").first.click()

    @pytest.mark.asyncio
    async def click_highlights_option_green_colour(self):
        await self.page.locator("div").get_by_title("green").first.click()

    @property
    def highlights_option_text_colour_check_purple(self):
        return self.page.locator('div[color="purple"]').get_attribute("color")

    @property
    def highlights_option_text_colour_check_green(self):
        return self.page.locator('div[color="green"]').get_attribute("color")

    @pytest.mark.asyncio
    async def small_highlighted_note_box_is_visible(self):
        return await self.page.get_by_test_id("card").get_by_role("dialog").is_visible()

    @pytest.mark.asyncio
    async def click_small_highlight_box_dropdown(self):
        await self.page.get_by_test_id("card").get_by_role("button").click()

    @pytest.mark.asyncio
    async def click_small_highlight_box_delete_button(self):
        await self.page.get_by_test_id("card").get_by_text("Delete").click()

    @pytest.mark.asyncio
    async def click_delete_highlight_button(self):
        await self.page.locator("div").get_by_test_id("confirm").click()

    @pytest.mark.asyncio
    async def click_small_highlight_box_edit_button(self):
        await self.page.get_by_test_id("card").get_by_text("Edit").click()

    @pytest.mark.asyncio
    async def yellow_highlighted_text_is_visible(self):
        return await self.page.locator("mark > span:nth-child(1)").all()

    @pytest.mark.asyncio
    async def click_highlight_box_save_button(self):
        await self.page.locator("div").get_by_test_id("save").click()

    @property
    def overlapping_highlights_message(self):
        return self.page.locator("div").get_by_test_id("banner-body")

    @pytest.mark.asyncio
    async def overlapping_highlights_message_is_visible(self):
        return await self.page.locator("div").get_by_test_id("banner-body").is_visible()

    @pytest.mark.asyncio
    async def click_new_chapter(self):
        await self.page.locator("div").get_by_text("The Origin of the Moon").click()

    @pytest.mark.asyncio
    async def click_show_hide_solution_link(self):
        button_locator = self.page.locator(
            'summary[data-content="Show/Hide Solution"]'
        ).first
        await button_locator.scroll_into_view_if_needed()
        await button_locator.click()

    # Unsaved highlight dialog

    @pytest.mark.asyncio
    async def unsaved_highlight_dialog_is_visible(self):
        return (
            await self.page.locator("div")
            .get_by_text("Discard unsaved changes?")
            .is_visible()
        )

    @pytest.mark.asyncio
    async def unsaved_highlight_dialog_discard_button_is_visible(self):
        return (
            await self.page.locator("div")
            .get_by_test_id("discard-changes")
            .is_visible()
        )

    @pytest.mark.asyncio
    async def click_discard_changes_button(self):
        await self.page.locator("div").get_by_test_id("discard-changes").click()

    @pytest.mark.asyncio
    async def unsaved_highlight_dialog_cancel_button_is_visible(self):
        return (
            await self.page.locator("div").get_by_test_id("cancel-discard").is_visible()
        )

    @pytest.mark.asyncio
    async def click_cancel_changes_button(self):
        await self.page.locator("div").get_by_test_id("cancel-discard").click()

    # Error states and pages

    @pytest.mark.asyncio
    async def subjects_error_page_is_visible(self):
        return (
            await self.page.locator("h1").get_by_text("Subject not found").is_visible()
        )

    @pytest.mark.asyncio
    async def click_view_all_subjects_link(self):
        await self.page.locator("a").get_by_text("View all").click()

    # Content search

    @property
    def content_search_field_is_visible(self):
        return self.page.get_by_test_id("desktop-search-input")

    @pytest.mark.asyncio
    async def click_search(self):
        await self.content_search_field_is_visible.click()

    @pytest.mark.asyncio
    async def fill_search_field(self, value):
        await self.content_search_field_is_visible.fill(value)

    @pytest.mark.asyncio
    async def click_search_magnifier_icon(self):
        await self.page.get_by_role("button", name="Search").click()

    @property
    def search_result_is_visible(self):
        return self.page.get_by_test_id("search-results-sidebar")

    @pytest.mark.asyncio
    async def close_unsuccessful_search_result_sidebar(self):
        await self.page.get_by_test_id("close-search-noresults").click()

    @pytest.mark.asyncio
    async def close_successful_search_result_sidebar(self):
        await self.page.get_by_test_id("close-search").click()

    @pytest.mark.asyncio
    async def click_first_search_result(self):
        await self.page.locator("details > ol > li > a:nth-child(2)").first.click()

    @pytest.mark.asyncio
    async def click_search_result(self):
        await self.page.locator("div").get_by_test_id("search-result").get_by_text(
            "about the Sun (88"
        ).click()

    # Clears blockers/overlays

    @pytest.mark.asyncio
    async def clear_all_blockers(self):
        await self.page.evaluate(
            """() => {
            document.querySelectorAll('div[class*="ClickBlocker"]').forEach(el => el.remove());
        }"""
        )
