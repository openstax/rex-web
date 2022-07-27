// Base page locators and functions

class BasePage{
    page: any;
    constructor(page){
        this.page = page;
    }

    // Open a Rex page with base url
    async navigate(){
        await this.page.goto('/books/business-ethics/pages/preface')
    }
}

module.exports = BasePage;