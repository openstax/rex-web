import random


class Library(object):
    def __init__(self):
        self._book_dict = {
            "chemistry-2e": "1-introduction",
            "chemistry-atoms-first-2e": "1-introduction",
            "anatomy-and-physiology": "1-introduction",
            "college-physics": "1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units",
            "astronomy": "1-introduction",
            "biology-2e": "1-introduction",
            "biology-ap-courses": "1-introduction",
            "college-physics-ap-courses": "1-connection-for-ap-r-courses",
            "concepts-biology": "1-introduction",
            "microbiology": "1-introduction",
        }

    @property
    def books(self) -> [str]:
        return self._book_dict

    def random_book_slug(self):
        random_book_slug = random.choice(list(self.books.keys()))
        return random_book_slug
