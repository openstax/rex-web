
from time import sleep

import pytest
from selenium import webdriver

from pages.content import Content
from tests import markers


class TestCitationtexturl():

#c476303 attribution section is initially collapsed, expands when clicked
    @markers.test_case("C476303")
    @markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
    @markers.nondestructive

    def test_attribution_initial_status(self, selenium, base_url, book_slug, page_slug):
        
#Given - the page {base_url}/books/college-physics/pages/preface
#When - the page loads
        content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
        attribution = content.attribution
        sleep(1)

#Then -the attribution section is collapsed
        assert not attribution.is_open
        print (attribution.is_open) #none


#AND the attribution section opens when clicked
        attribution.attribution_click()
        sleep(1)
        assert attribution.is_open
        print (attribution.is_open) #true

#click on attribution again and verify it closes
        attribution.attribution_click()
        sleep(1)
        assert not attribution.is_open
        print (attribution.is_open) #none




# c476304 citation/attribution section collapses by default when you navigate to a new page
    @markers.test_case("C476304")
    @markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
    @markers.nondestructive

    def test_attribution_new_page_status(self, selenium, base_url, book_slug, page_slug):


#Given - the page {base_url}/books/college-physics/pages/preface
#AND the citation/attribution tab is open
        content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
        attribution = content.attribution
        attribution.attribution_click()
        sleep(1)

#When - navigating via (next link)
        content.next_click()

#Then - the citation/attribution section is not open on the new page
        print (attribution.is_open) #none
        assert not attribution.is_open

        attribution.attribution_click()
        sleep(1)
        
#When - navigating via (Back link)
        content.back_click()

#Then - the citation/attribution section is not open on the new page
        print (attribution.is_open) #none
        assert not attribution.is_open

        attribution.attribution_click()
        sleep(1)

#When - navigating via (TOC link)
        toolbar = content.toolbar
        sidebar = content.sidebar
        
        if content.is_desktop:
            sidebar.header.click_toc_toggle_button()
        #sidebar.click_toc_section2_link()
            sleep(2)
        #print (attribution.is_open) #none
        #assert not attribution.is_open
        if content.is_mobile:
            toolbar.click_toc_toggle_button()
            






#Then - the citation/attribution section is not open on the new page






# c476302 citation text shows url for current page
    #@markers.test_case("C476302")
    #@markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
    #@markers.nondestructive

    #def test_citation_url_matches_page_url(self, selenium, base_url, book_slug, page_slug):

#Given - the page {base_url}/books/college-physics/pages/preface
#When - the page loads
        #content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
        #new_url = content.url
        
        #print(url)
        #attribution = content.attribution

#AND the attribution section is expanded
        #attribution.attribution_click()
        #print(page_url)
        #assert page_url 
#Then - the urls in the the attribution should reference current page in rex

