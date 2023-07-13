// Content page locators and functions
import { Locator, Page } from 'playwright'
import { exit } from 'yargs'

class toc {
    page: Page
    sectionLocator: Locator
    chapterLocator: Locator
    eocLocator: Locator
    eobLocator: Locator
    unitLocator: Locator



  constructor(page: Page) {
    this.page = page
    this.sectionLocator = this.page.locator('[data-type="page"]')
    this.chapterLocator = this.page.locator('[data-type="chapter"]')
    this.eocLocator = this.page.locator('[data-type="eoc-dropdown"]')
    this.eobLocator = this.page.locator('[data-type="eob-dropdown"]')
    this.unitLocator = this.page.locator('[data-type="unit"]')

  }


  async tocPageCount() {
    const tocPageCount = await this.sectionLocator.count()
    console.log(tocPageCount)
  }

  async tocChapterCount() {
    return await this.chapterLocator.count()
  }
  
  async chapterClick(n: number){
    await this.chapterLocator.nth(n).click()
  }

  async pageClick(n: number){
    const chapterCount = await this.tocChapterCount()
    if (await this.sectionLocator.nth(n).isVisible() === true) {
    await this.sectionLocator.nth(n).click()
    } 
    else {
        let j: number
        
        for (j = 0; j < chapterCount; j++) {
            await this.chapterLocator.nth(j).click()
            if (await this.sectionLocator.nth(n).isVisible() === true)
                await this.sectionLocator.nth(n).click()
                exit
    }
  }
}

}
export { toc }