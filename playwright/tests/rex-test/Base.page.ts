// Base page locators and functions

class BasePage{
    page: any;
    constructor(page){
        this.page = page;
    }

    // Open a Rex page with base url
    async open(path: string){
        await this.page.goto(path)
    }
}

module.exports = BasePage;

