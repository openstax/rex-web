// Content page locators and functions
import { Locator, Page } from 'playwright'

class toc {
    page: Page
    sectionLocator: Locator
    chapterLocator: Locator
    eocLocator: Locator
    eobLocator: Locator
    unitLocator: Locator
    chapterInUnit: Locator
    eocInChapter: Locator
    dropdownLocator: Locator



  constructor(page: Page) {
    this.page = page
    this.sectionLocator = this.page.locator('[data-type="page"]')
    this.chapterLocator = this.page.locator('[data-type="chapter"]')
    this.eocLocator = this.page.locator('[data-type="eoc-dropdown"]')
    this.eobLocator = this.page.locator('[data-type="eob-dropdown"]')
    this.unitLocator = this.page.locator('[data-type="unit"]')
    this.dropdownLocator = this.page.locator('details[class*="NavDetails"]')

  }


  async tocPageCount() {
    const tocPageCount = await this.sectionLocator.count()
    console.log(tocPageCount)
  }
  

  async sectionClick(n: number) {
    if (await this.sectionLocator.nth(n).isVisible() === true) {
        await this.sectionLocator.nth(n).click()
    }
    else{
        throw new Error  
    }
  }

  async pageClickIfUnits(n: number){
    const unitCount = await this.unitLocator.count()
    //  if page is visible click and return to test
    try {
        await this.sectionClick(n)
    }
    
    catch(error) {
        // if book has units, expand unit 
        if (await this.unitLocator.nth(0).isVisible() === true) {
                let unit: number
                let chapter: number 
            
            for (unit = 0; unit < unitCount; unit++) {
                await this.unitLocator.nth(unit).click()

                //  if page is visible within a unit, click and return to test
                try {
                    await this.sectionClick(n)}

                catch(error) { 
                    // expand the chapters within the unit
                    this.chapterInUnit = this.unitLocator.nth(unit).locator("//li[@data-type='chapter']")
                    const chapterInUnitCount = await this.chapterInUnit.count()

                    for (chapter = 0; chapter < chapterInUnitCount; chapter++) {
                        await this.chapterInUnit.nth(chapter).click()

                        //  if page is visible within a chapter, click and return to test
                        try {
                            await this.sectionClick(n)
                        }
                
                        catch(error) {
                            // if eoc is present expand
                            this.eocInChapter = this.chapterLocator.nth(chapter).locator("//li[@data-type='eoc-dropdown']")
                            const eocInChapterCount = await this.eocInChapter.count()

                            for (chapter = 0; chapter < eocInChapterCount; chapter++) {
                                await this.eocInChapter.nth(chapter).click()

                                //  if page is visible within a chapter, click and return to test
                                try {
                                    await this.sectionClick(n)
                                }

                                catch(error) {
                                    // console.log("page not found")
                                }     
                            }             
                        }
                    }
    
                    
                }
            }
        }   
    }
  }

async pageClick(n: number) {
    try {
        await this.sectionClick(n)
    }
    catch(error) {
        const dropdownCount = await this.dropdownLocator.count()
        let x: number
        // expand all dropdowns in toc
        for (x = 0; x < dropdownCount; x++) {
            await this.dropdownLocator.nth(x).click()
            if (await this.sectionLocator.nth(n).isVisible() === true) {
                await this.sectionLocator.nth(n).click()
                break
            }
            
        }

    }
}


}

export { toc }