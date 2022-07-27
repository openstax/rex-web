// Keyboard Shortcuts modal locators and functions

import BasePage from './Base.page';

class KsmodalPage extends BasePage {
    ksModal: string;
    ksModalCloseIcon: string;
    
    constructor(page){
        super(page);

        //locators for Keyboard shortcuts modal
        this.ksModal = page.locator('data-testid=keyboard-shortcuts-popup-wrapper');
        this.ksModalCloseIcon = page.locator('data-testid=close-keyboard-shortcuts-popup');
    }

    // Close Keyboard Shortcuts modal using x icon
    async closeKsModal(){
        await this.ksModalCloseIcon.click();
    }
}

module.exports = KsmodalPage;