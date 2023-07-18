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
    chapterInUnit: Locator



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
  

  async sectionClick(n: number) {
    if (await this.sectionLocator.nth(n).isVisible() === true) {
        await this.sectionLocator.nth(n).click()
    }
  }

  async pageClick(n: number){
    const unitCount = await this.unitLocator.count()
    //  if page is visible click and return
    if (await this.sectionLocator.nth(n).isVisible() === true) {
        await this.sectionLocator.nth(n).click()
        
    } 

    // if book has units, expand unit and check if page is visible
    else if (await this.unitLocator.nth(0).isVisible() === true) {
            let unit: number
            let chapter: number 
        
            for (unit = 0; unit < unitCount; unit++) {
                await this.unitLocator.nth(unit).click()
                if (await this.sectionLocator.nth(n).isVisible() === true) {
                    await this.sectionLocator.nth(n).click()                   
                }
            
        
                else {
                    
                    this.chapterInUnit = this.unitLocator.nth(unit).locator("//li[@data-type='chapter']")

                    const chapterInUnitCount = await this.chapterInUnit.count()
                    console.log(chapterInUnitCount)
                
                    for (chapter = 0; chapter < chapterInUnitCount; chapter++) {
                        await this.chapterInUnit.nth(chapter).click()
                        if (await this.sectionLocator.nth(n).isVisible() === true)
                            await this.sectionLocator.nth(n).click()
                            
                          
                            
                    }
                }
        }
    }
}
}

    



export { toc }