import pytest


class NursingBooks:
    def __init__(self, page):
        self.page = page

    @property
    def nursing_content_warning_dialog_login(self):
        return self.page.get_by_test_id("navbar").get_by_test_id("nav-login")

    @pytest.mark.asyncio
    async def click_nursing_content_warning_dialog_login(self):
        await self.page.get_by_test_id("centered-content-row").get_by_test_id(
            "nav-login"
        ).click()

    @property
    def nursing_material_warning_dialog(self):
        return self.page.locator(
            "div",
            has_text="This material is intended for",
        ).nth(1)

    @pytest.mark.asyncio
    async def dismiss_nursing_material_warning_dialog(self):
        await self.page.get_by_role("button", name="Ok").click()

    @pytest.mark.asyncio
    async def click_nursing_content_warning_dialog_create(self):
        await self.page.locator("a[href*='signup/student']").click()

    @pytest.mark.asyncio
    async def click_get_the_maternal_newborn_book_link(self):
        get_book = self.page.locator("button#books\\/maternal-newborn-nursing-ddb")
        await get_book.scroll_into_view_if_needed()
        await get_book.click()

    @pytest.mark.asyncio
    async def click_get_the_clinical_nursing_book_link(self):
        get_book2 = self.page.locator("button#books\\/clinical-nursing-skills-ddb")
        await get_book2.scroll_into_view_if_needed()
        await get_book2.click()

    @pytest.mark.asyncio
    async def click_maternal_newborn_book_view_online_link(self):
        maternal_view = self.page.get_by_role("menuitem", name="View online")
        await maternal_view.scroll_into_view_if_needed()
        await maternal_view.click()

    @pytest.mark.asyncio
    async def click_nursing_content_warning_dialog_goto(self):
        await self.page.get_by_role("link", name="Go to your book").click()
