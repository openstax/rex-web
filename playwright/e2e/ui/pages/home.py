import asyncio
import pytest
from selenium.webdriver.common.devtools.v85.runtime import await_promise

from playwright.async_api import expect

import re


class HomeRex:
    def __init__(self, page):
        self.page = page

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
    def book_toc_slideout_is_visible(self):
        return self.page.locator("div.toc-slideout-contents")

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
        return await (self.page.locator("div.copyrights").get_by_role("link").get_attribute("href"))

    # Book page navigation

    @property
    @pytest.mark.asyncio
    async def content_page_previous_link_is_visible(self):
        return await self.page.is_visible("a :text('Previous')")

    @property
    def content_page_previous_link(self):
        return self.page.locator("a").get_by_text("Previous")

    @pytest.mark.asyncio
    async def click_content_page_previous_link(self):
        await self.content_page_previous_link.click()

    @property
    @pytest.mark.asyncio
    async def content_page_next_link_is_visible(self):
        return await self.page.is_visible("a :text('Next')")

    @property
    def content_page_next_link(self):
        return self.page.locator("a").get_by_text("Next")

    @pytest.mark.asyncio
    async def click_content_page_next_link(self):
        await self.content_page_next_link.click()

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
    def order_options_button_is_visible(self):
        return self.page.locator("a").get_by_text("Order options")

    @pytest.mark.asyncio
    async def click_order_options_button(self):
        await self.order_options_button_is_visible.click()

    @property
    def highlight_recommended_popup_is_visible(self):
        return self.page.locator("span").get_by_text("Recommended")

    @property
    def cookies_accept_is_visible(self):
        return self.page.locator("button.osano-cm-accept-all").get_by_text("Accept All")

    @pytest.mark.asyncio
    async def click_cookies_accept(self):
        await self.cookies_accept_is_visible.click()

    @property
    def toc_is_visible(self):
        return self.page.locator("span").get_by_text("Table of contents")

    @property
    def bookbanner_is_visible(self):
        return self.page.locator("div.bookbanner")
                #.get_by_text("Principles of Macroeconomics 3e"))
