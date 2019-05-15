
from time import sleep

import pytest
from selenium import webdriver

from pages.content import Content
from tests import markers


class TestCitationtexturl():

    # c476302 citation text shows url for current page
    @markers.test_case("C476302")
    @markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
    @markers.nondestructive

    def test_citation_url_matches_page_url(self, selenium, base_url, book_slug, page_slug):

        #Given - the page {base_url}/books/college-physics/pages/preface
        #When - the page loads
        content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
        url_before_attribution_click = content.current_url
        #print(content.current_url)
        
        #AND the attribution section is expanded
        attribution = content.attribution
        attribution.attribution_click()
        url_after_attribution_click = content.current_url
        #print(content.current_url)
     
        #Then - the urls in the the attribution should reference current page in rex
        assert url_before_attribution_click == url_after_attribution_click



    #c476303 attribution section is initially collapsed, expands when clicked
    @markers.test_case("C476303")
    @markers.parametrize("book_slug,page_slug", [("college-physics", "preface")])
    @markers.nondestructive

    def test_attribution_initial_status(self, selenium, base_url, book_slug, page_slug):
        
        #Given - the page {base_url}/books/college-physics/pages/preface
        #When - the page loads
        content = Content(selenium, base_url, book_slug=book_slug, page_slug=page_slug).open()
        attribution = content.attribution


        #Then -the attribution section is collapsed
        assert not attribution.is_open
        #print (attribution.is_open) #none


        #AND the attribution section opens when clicked
        attribution.attribution_click()
        assert attribution.is_open
        #print (attribution.is_open) #true

        attribution.attribution_click()
        """click on attribution again and verify it closes
        
        """
        assert not attribution.is_open
        #print (attribution.is_open) #none




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
        
        #When - navigating via (next link)
        content.next_click()
        sleep(1)
        
        #Then - the citation/attribution section is not open on the new page
        #print (attribution.is_open) #none
        assert not attribution.is_open
        attribution.attribution_click()
        
        #When - navigating via (Back link)
        content.back_click()
        sleep(1)

        #Then - the citation/attribution section is not open on the new page
        #print (attribution.is_open) #none
        assert not attribution.is_open

        attribution.attribution_click()
        sleep(1)

        #When - navigating via (TOC link)
        toolbar = content.toolbar
        sidebar = content.sidebar     
        
        if content.is_desktop: 
            sidebar.header.click_toc_element()
            sleep(2)
        #Then - the citation/attribution section is not open on the new page
            #print (attribution.is_open) #none
            assert not attribution.is_open

        if content.is_mobile:
            toolbar.click_toc_toggle_button()
            sleep(1)
            sidebar.header.click_toc_element()
            sleep(2)
            #print (attribution.is_open) #none
            assert not attribution.is_open



