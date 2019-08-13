import random


class Library(object):
    def __init__(self):
        self._book_slug_list = [
            "chemistry-2e",
            "chemistry-atoms-first-2e",
            "anatomy-and-physiology",
        ]

        self._user_email_list = [
            "mn45+rexstudent01@rice.edu",
            "mn45+rexinstructor01@rice.edu",
            "mn45+rexadmin01@rice.edu",
            "mn45+rexadjunct01@rice.edu",
            "mn45+rexhomeschool01@rice.edu",
            "mn45+rexlibrarian01@rice.edu",
            "mn45+rexdesigner01@rice.edu",
            "mn45+rexother01@rice.edu",
        ]
        self._password = ["nope"]

    @property
    def books(self) -> [str]:
        return self._book_slug_list

    def random_book_slug(self):
        return random.choice(self.books)

    @property
    def user_email(self) -> [str]:
        return self._user_email_list

    @property
    def random_user_email(self):
        return random.choice(self.user_email)

    @property
    def password(self):
        return self._password
