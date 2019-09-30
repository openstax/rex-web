import random


class Library(object):
    books = {
        "chemistry-2e": {"default_page": "1-introduction"},
        "chemistry-atoms-first-2e": {"default_page": "1-introduction"},
        "anatomy-and-physiology": {"default_page": "1-introduction"},
        "college-physics": {
            "default_page": "1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units"
        },
        "astronomy": {"default_page": "1-introduction"},
        "biology-2e": {"default_page": "1-introduction"},
        "biology-ap-courses": {"default_page": "1-introduction"},
        "college-physics-ap-courses": {"default_page": "1-connection-for-ap-r-courses"},
        "concepts-biology": {"default_page": "1-introduction"},
        "microbiology": {"default_page": "1-introduction"},
    }

    def random_book_slug(self):
        random_book_slug = random.choice(list(self.books.keys()))
        return random_book_slug


def get_default_page(element):
    book_list = Library.books
    default_page = book_list[element]["default_page"]
    return default_page


class FontProperties(object):
    def is_bold(self, element):
        return element.value_of_css_property("font-weight") == "400"
