import { Page, expect } from '@playwright/test';
import { ScreenshotOperations } from '../../utils/screenshot-operations.utils';
import * as locators from '../../locators/swagLabsDemo/locator_inventoryPage.json';




export class InventoryPage {
    private readonly page: Page;
    private readonly inventoryContainer = locators.inventoryContainer;
    private readonly productTitle = locators.productTitle;

    constructor(page: Page) {
        this.page = page;
    }

    async verifyOnInventoryPage() {
        await expect(this.page).toHaveURL(/.*inventory.html/);
        await expect(this.page.locator(this.productTitle)).toHaveText('Products');
        await expect(this.page.locator(this.inventoryContainer)).toBeVisible();
        await ScreenshotOperations.save(this.page, 'Verified on Inventory Page');
    }

}