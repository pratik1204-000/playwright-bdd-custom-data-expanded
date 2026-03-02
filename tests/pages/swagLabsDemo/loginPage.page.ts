import {Page, expect} from '@playwright/test';
import { ScreenshotOperations } from '../../utils/screenshot-operations.utils';
import * as locators from '../../locators/swagLabsDemo/locator_loginPage.json';



export class LoginPage{
    private readonly page: Page;
    private readonly usernameInput = locators.usernameInput;
    private readonly passwordInput = locators.passwordInput;
    private readonly loginButton = locators.loginButton;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate() {
        await this.page.goto('https://www.saucedemo.com/');
        await ScreenshotOperations.save(this.page,'Navigated to Sauce Demo Login Page');
    }

    async login(username: string, password: string) {
        await this.page.fill(this.usernameInput, username);
        await this.page.fill(this.passwordInput, password);
        await ScreenshotOperations.save(this.page,'Entered username and password');
    }

    async clickOnLoginButton() {
        await this.page.click(this.loginButton);
        await ScreenshotOperations.save(this.page,'Clicked on Login Button');
    }


    async verifyOnLoginPage() {
        await expect(this.page).toHaveURL(/.*saucedemo.com/);
        await expect(this.page.locator(this.loginButton)).toBeVisible();
        await ScreenshotOperations.save(this.page,'Verified on Login Page');
    }


}