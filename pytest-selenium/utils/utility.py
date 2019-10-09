import random


class Library(object):
    def __init__(self):
        self._book_slug_list = [
            "chemistry-2e",
            "chemistry-atoms-first-2e",
            "anatomy-and-physiology",
            "college-physics",
            "astronomy",
            "biology-2e",
            "biology-ap-courses",
            "college-physics-ap-courses",
            "concepts-biology",
            "microbiology",
        ]

    @property
    def books(self) -> [str]:
        return self._book_slug_list

    def random_book_slug(self):
        return random.choice(self.books)


class FontProperties(object):
    def is_bold(self, element):
        return element.value_of_css_property("font-weight") == "400"
