from .base import Page


class BookContent(Page):
    URL_TEMPLATE = "/books/{book_slug}/pages/{page_slug}"
