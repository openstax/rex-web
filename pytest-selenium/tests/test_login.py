from pages.content import Content
from tests import markers


@markers.test_case("C477326")
@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
@markers.nondestructive
def test_login(selenium, base_url, book_slug, page_slug):
    pass
