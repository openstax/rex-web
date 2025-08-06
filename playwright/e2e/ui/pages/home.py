import asyncio
import pytest

from playwright.async_api import expect

import re


class HomeRex:
    def __init__(self, page):
        self.page = page

    # openstax.org homepage

    @pytest.mark.asyncio
    async def click_openstax_logo(self):
        await self.page.locator("div.styled__BarWrapper-sc-3syvnw-12.ePgITh > div > a").click()

    # Subjects homepage

    @property
    def subjects_page_menu(self):
        return self.page.get_by_role("button", name="Subjects")

    @pytest.mark.asyncio
    async def click_subjects_page_menu(self):
        await self.subjects_page_menu.hover()

    @property
    def subjects_homepage_link(self):
        return self.page.get_by_role("link", name="All")

    @pytest.mark.asyncio
    async def click_subjects_homepage_link(self):
        await self.subjects_homepage_link.click()

    @property
    def language_selector_section(self):
        return self.page.locator("section.language-selector-section")

    @property
    def subjects_listing_section(self):
        return self.page.locator("section.subjects-listing")

    @property
    def about_openstax_section(self):
        return self.page.locator("section.about-openstax > div > h2")

    @property
    def learn_about_openstax_link(self):
        return self.page.locator("a").get_by_text("Learn about OpenStax")

    @pytest.mark.asyncio
    async def click_learn_about_openstax_link(self):
        await self.learn_about_openstax_link.click()

    @property
    def about_page(self):
        return self.page.locator("id=main")

    @property
    def book_toc_link(self):
        return self.page.locator("div.option.toc-option")

    @pytest.mark.asyncio
    async def click_book_toc_link(self):
        await self.book_toc_link.click()

    @property
    def book_toc_content(self):
        return self.page.locator("div.toc-slideout-contents > div > div")

    @property
    def book_toc_slideout_is_visible(self):
        return self.page.get_by_test_id("toc")

    @property
    def book_link(self):
        return self.page.locator("menu > li:nth-child(5) > a").get_by_text("Economics")

    @pytest.mark.asyncio
    async def click_book_link(self):
        await self.book_link.click()

    @property
    def book_cover_link(self):
        return self.page.locator("a").get_by_text("Principles of Macroeconomics 3e")

    @pytest.mark.asyncio
    async def click_book_cover_link(self):
        await self.book_cover_link.click()

    @property
    def view_online_link(self):
        return self.page.locator("a").get_by_text("View online")

    @pytest.mark.asyncio
    async def click_view_online_link(self):
        await self.view_online_link.click()

    @property
    def go_to_your_book_link(self):
        return self.page.locator("a.btn.go-to").get_by_text("Go to your ")

    @pytest.mark.asyncio
    async def click_go_to_your_book_link(self):
        await self.go_to_your_book_link.click()

    @property
    def book_contents_is_visible(self):
        return self.page.locator("div").get_by_test_id("toolbar").get_by_label("Click to close the Table of")

    @pytest.mark.asyncio
    async def click_book_contents_sidebar_option(self):
        await self.book_contents_is_visible.click()

    @property
    def resources_tabs_are_visible(self):
        return self.page.locator("div.tabs-and-extras")

    @pytest.mark.asyncio
    async def click_instructor_resources_tab(self):
        await self.page.locator("id=Instructor resources-tab").click()

    @pytest.mark.asyncio
    async def click_student_resources_tab(self):
        await self.page.locator("id=Student resources-tab").click()

    # My Highlights and Notes

    @property
    def highlights_option_is_visible(self):
        return self.page.locator("#nudge-study-tools > button")

    @pytest.mark.asyncio
    async def click_highlights_option(self):
        await self.highlights_option_is_visible.click()

    @property
    def highlights_option_page_is_visible(self):
        return self.page.locator("div").get_by_test_id("show-myhighlights-body")

    @property
    def highlights_option_page_menu_is_visible(self):
        return self.page.locator(".ContextMenu__StyledContextMenu-a36hp5-0 > "
                                 ".Dropdown__TabHiddenDropDown-rmc6yw-1 > .Button__PlainButton-ayg7nk-2").first

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu(self):
        await self.highlights_option_page_menu_is_visible.click()

    @property
    def highlights_option_page_menu_edit_is_visible(self):
        return self.page.locator(
            "li").get_by_role("button", name="Edit")

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu_edit(self):
        await self.highlights_option_page_menu_edit_is_visible.click()

    @property
    def highlights_option_page_menu_edit_note_field_is_visible(self):
        return self.page.locator("div.HighlightAnnotation__HighlightNote-ppiq8t-0.kkNpZF > textarea")

    @pytest.mark.asyncio
    async def fill_highlights_option_edit_note_field(self, value):
        await self.highlights_option_page_menu_edit_note_field_is_visible.fill(value)

    @property
    def highlights_option_page_menu_edit_save_is_visible(self):
        return self.page.locator("div").get_by_role("button", name="Save")

    @pytest.mark.asyncio
    async def click_highlights_option_edit_save_button(self):
        await self.highlights_option_page_menu_edit_save_is_visible.click()

    @property
    def highlights_option_page_menu_delete_is_visible(self):
        return self.page.locator(
            "li").get_by_role("button", name="Delete")

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu_delete(self):
        await self.highlights_option_page_menu_delete_is_visible.click()

    @property
    def highlights_option_page_menu_delete_delete_is_visible(self):
        return self.page.locator("div").get_by_test_id("delete")

    @pytest.mark.asyncio
    async def click_highlights_option_page_menu_delete_delete(self):
        await self.highlights_option_page_menu_delete_delete_is_visible.click()

    @property
    def highlights_option_page_is_empty(self):
        return self.page.locator("div").get_by_test_id("show-myhighlights-body")

    # Print and Attribution

    @property
    def order_a_print_copy_link_is_visible(self):
        return self.page.locator("div.BuyBook__BuyBook > a").get_by_text("Order a print copy")

    @property
    def citation_attribution_link_is_visible(self):
        return self.page.locator("div.ContentPane__Wrapper-sc-6et83r-0.hPmLNC > details > summary > "
                                 "span").get_by_text("Citation/Attribution")

    @property
    def giving_tuesday_popup_is_visible(self):
        return self.page.locator("div.text-side > h1").get_by_text("Embrace the spirit of Giving Tuesday today!")

    @property
    def giving_tuesday_popup_close_icon(self):
        return self.page.locator("button.put-away.no-title-bar")

    @pytest.mark.asyncio
    async def close_giving_tuesday_popup(self):
        await self.giving_tuesday_popup_close_icon.click()

    # Philanthropic support

    @property
    def philanthropic_support_section(self):
        return self.page.locator("section.philanthropic-support")

    @property
    def our_impact_link(self):
        return self.page.locator("a").get_by_text("Learn more about our impact")

    @pytest.mark.asyncio
    async def click_our_impact_link(self):
        await self.our_impact_link.click()

    @property
    def give_today_link_is_visible(self):
        return self.page.locator("#footer").get_by_role("link", name="Give today")

    @pytest.mark.asyncio
    async def click_give_today_link(self):
        await self.give_today_link_is_visible.click()

    # Subjects page footer section

    @property
    def footer_section(self):
        return self.page.locator("id=footer")

    @property
    def footer_section_help_is_visible(self):
        return self.page.locator("div.column.col1")

    @property
    def footer_section_openstax_is_visible(self):
        return self.page.locator("div.column.col2")

    @property
    def footer_section_policies_is_visible(self):
        return self.page.locator("div.column.col3")

    @property
    def footer_section_bottom_is_visible(self):
        return self.page.locator("div.bottom")

    @property
    @pytest.mark.asyncio
    async def footer_section_license_link(self):
        return await self.page.locator("div.copyrights").get_by_role("link").get_attribute("href")

    # Book page navigation

    @property
    def content_page_previous_next_page_bar_is_visible(self):
        return self.page.locator("div.PrevNextBar__BarWrapper-sc-13m2i12-3.fEZPiF")

    @property
    def content_page_previous_link_is_visible(self):
        return self.page.locator("a").get_by_text('Previous')

    @pytest.mark.asyncio
    async def click_content_page_previous_link(self):
        await self.content_page_previous_link_is_visible.click()

    @property
    def content_page_next_link_is_visible(self):
        return self.page.locator("a").get_by_text('Next')

    @pytest.mark.asyncio
    async def click_content_page_next_link(self):
        await self.content_page_next_link_is_visible.click()

    @property
    def subject_listing_book_is_visible(self):
        return self.page.locator("a").get_by_text("Astronomy")

    @pytest.mark.asyncio
    async def click_subject_listing_book(self):
        await self.subject_listing_book_is_visible.click()

    @property
    def book_selection(self):
        return self.page.locator("div").get_by_text("Astronomy 2e")

    @pytest.mark.asyncio
    async def click_book_selection(self):
        await self.book_selection.click()

    @property
    def buy_print_copy_button_is_visible(self):
        return self.page.locator("a").get_by_text("Buy a print copy")

    @pytest.mark.asyncio
    async def click_buy_print_copy_button(self):
        await self.buy_print_copy_button_is_visible.click()

    @property
    def bookstore_box_is_visible(self):
        return self.page.locator("div").get_by_text("Bookstore")

    @property
    def order_options_button_is_visible(self):
        return self.page.locator("a").get_by_text("Order options")

    @pytest.mark.asyncio
    async def order_options_href(self):
        await self.page.locator("a").get_by_text("Order options").get_attribute('href')

    @pytest.mark.asyncio
    async def click_order_options_button(self):
        await self.order_options_button_is_visible.click()

    @property
    def highlight_recommended_popup_is_visible(self):
        return self.page.locator("span").get_by_text("Recommended")

    @pytest.mark.asyncio
    async def click_cookieyes_accept(self):
        await self.page.get_by_role("button", name="Accept All").click()

    @property
    def toc_is_visible(self):
        return self.page.locator("span").get_by_text("Table of contents")

    @property
    def bookbanner_is_visible(self):
        return self.page.locator("div.bookbanner")

    # Accessibility page (hidden link: go to accessibility page)

    @property
    def accessibility_help_content(self):
        return self.page.locator("#maincontent > div")

    # Login

    @pytest.mark.asyncio
    async def click_login(self):
        await self.page.locator("a").get_by_text("Log in").click()

    @pytest.mark.asyncio
    async def click_login_other(self):
        await self.page.get_by_role("menuitem").get_by_text("Log in").click()

    @pytest.mark.asyncio
    async def fill_user_field(self, value):
        await self.page.locator("id=login_form_email").fill(value)

    @pytest.mark.asyncio
    async def fill_password_field(self, value):
        await self.page.locator("id=login_form_password").fill(value)

    @pytest.mark.asyncio
    async def click_continue_login(self):
        await self.page.locator("input.primary").get_by_text("Continue").click()

    @property
    def logged_in_user_dropdown_is_visible(self):
        return self.page.locator("div").get_by_test_id('user-nav-toggle')

    @pytest.mark.asyncio
    async def click_logged_in_user_dropdown(self):
        await self.logged_in_user_dropdown_is_visible.click()

    @property
    def logout_link_is_visible(self):
        return self.page.get_by_role("menuitem", name="Log out")

    @pytest.mark.asyncio
    async def click_logout_link(self):
        await self.logout_link_is_visible.click()

    # Book chapter section

    @pytest.mark.asyncio
    async def double_click_text(self):
        await self.page.locator("p#eip-342").dblclick()

    @property
    def select_text_locator(self):
        return self.page.locator("p:has-text('impact history')")

    @pytest.mark.asyncio
    async def click_other_text(self):
        await self.page.locator("#fs-id1170323854379").click()

    @pytest.mark.asyncio
    async def select_text(self):
        await self.select_text_locator.select_text()

    @property
    def survey_dialog_is_visible(self):
        return self.page.locator("div._pi_closeButton")

    @pytest.mark.asyncio
    async def close_survey_dialog(self):
        await self.survey_dialog_is_visible.click()

    # Highlight box and highlights

    @property
    def highlight_box_trash_icon_is_visible(self):
        return self.page.locator("div").get_by_test_id('editcard-trash-icon')

    @pytest.mark.asyncio
    async def click_highlight_box_trash_icon(self):
        await self.highlight_box_trash_icon_is_visible.click()

    @pytest.mark.asyncio
    async def highlight_box_is_visible(self):
        return await self.page.locator("id=note-textarea").all()

    @property
    def highlight_box_note_field_is_visible(self):
        return self.page.locator("id=note-textarea")

    @pytest.mark.asyncio
    async def click_highlight_box_note_field(self):
        await self.highlight_box_note_field_is_visible.click()

    @pytest.mark.asyncio
    async def fill_highlight_box_note_field(self, value):
        await self.highlight_box_note_field_is_visible.fill(value)

    @property
    def highlight_box_colours_are_visible(self):
        return self.page.locator("div").get_by_test_id('highlight-colours-picker')

    @pytest.mark.asyncio
    async def click_highlight_box_purple_colour(self):
        await self.page.locator("div").get_by_title("purple").first.click()

    @pytest.mark.asyncio
    async def click_highlights_option_green_colour(self):
        await self.page.locator("div").get_by_title("green").first.click()

    @pytest.mark.asyncio
    async def highlights_option_text_colour_is_purple(self):
        return await self.page.locator("div.HighlightListElement__HighlightContentWrapper-s4j4lf-1.ibAyfS").all()

    @property
    def highlights_option_text_colour_purple(self):
        return self.page.locator("div.HighlightListElement__HighlightContentWrapper-s4j4lf-1.ibAyfS")

    @property
    def highlights_option_text_colour_green(self):
        return self.page.locator("div.HighlightListElement__HighlightContentWrapper-s4j4lf-1.kuxHtj")

    @property
    def highlights_option_text_colour_check_purple(self):
        return self.highlights_option_text_colour_purple.get_attribute("color")

    @property
    def highlights_option_text_colour_check_green(self):
        return self.highlights_option_text_colour_green.get_attribute("color")

    @pytest.mark.asyncio
    async def small_highlighted_note_box_is_visible(self):
        return await self.page.locator("div.sc-cIShpX.kepmsY > div > div > div").all()

    @pytest.mark.asyncio
    async def click_small_highlight_box_dropdown(self):
        await self.page.locator("div.sc-cIShpX.kepmsY > div > div > div > button").click()

    @pytest.mark.asyncio
    async def click_small_highlight_box_delete_button(self):
        await self.page.locator("div > menu").get_by_text("Delete").click()

    @pytest.mark.asyncio
    async def click_delete_highlight_button(self):
        await self.page.locator("div").get_by_test_id('confirm').click()

    @pytest.mark.asyncio
    async def yellow_highlighted_text_is_visible(self):
        return await self.page.locator("mark > span:nth-child(1)").all()

    @pytest.mark.asyncio
    async def click_highlight_box_save_button(self):
        await self.page.locator("div").get_by_test_id("save").click()

    @pytest.mark.asyncio
    async def click_highlight_box_cancel_button(self):
        await self.page.locator("div").get_by_test_id("cancel").click()

    @property
    def overlapping_highlights_message_is_visible(self):
        return self.page.locator("div").get_by_test_id('banner-body')

    @pytest.mark.asyncio
    async def click_new_chapter(self):
        await self.page.locator("div").get_by_text("The Origin of the Moon").click()

    # Unsaved highlight dialog

    @pytest.mark.asyncio
    async def unsaved_highlight_dialog_is_visible(self):
        return await self.page.locator("div").get_by_text('Discard unsaved changes?').is_visible()

    @property
    def unsaved_highlight_dialog_discard_button_is_visible(self):
        return self.page.locator("div").get_by_test_id('discard-changes')

    @property
    def unsaved_highlight_dialog_cancel_button_is_visible(self):
        return self.page.locator("div").get_by_test_id('cancel-discard')

    @pytest.mark.asyncio
    async def click_discard_changes_button(self):
        await self.unsaved_highlight_dialog_discard_button_is_visible.click()

    @pytest.mark.asyncio
    async def click_cancel_changes_button(self):
        await self.unsaved_highlight_dialog_cancel_button_is_visible.click()

    # Error states and pages

    @property
    def subjects_error_page_is_visible(self):
        return self.page.locator("h1").get_by_text('Subject not found')

    @pytest.mark.asyncio
    async def click_view_all_subjects_link(self):
        await self.page.locator("a").get_by_text('View all').click()

    @property
    def incorrect_page_error_is_visible(self):
        return self.page.locator("main > div").get_by_text("Uh-oh, no page here")

    @property
    def incorrect_page_error_text(self):
        return self.page.locator("main > div > p")

    # Content search

    @property
    def content_search_field_is_visible(self):
        return self.page.get_by_test_id("desktop-search-input")

    @pytest.mark.asyncio
    async def click_search(self):
        await self.content_search_field_is_visible.click()

    @pytest.mark.asyncio
    async def click_search_icon(self):
        await self.page.get_by_title("Search").click()

    @pytest.mark.asyncio
    async def fill_search_field(self, value):
        await self.content_search_field_is_visible.fill(value)

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
        await self.page.locator("div").get_by_test_id("search-result").get_by_text("about the Sun (88").click()

    @pytest.mark.asyncio
    async def section_count(self):
        return await self.page.locator("section").all()