import { createBdd } from "playwright-bdd";
import { LoginPage } from "../pages/swagLabsDemo/loginPage.page";
import { InventoryPage } from "../pages/swagLabsDemo/inventoryPage.page";
import { Page } from "@playwright/test";
import { PdfEvidenceOperations } from "../utils/pdf-evidence-operations.utils";
import { DocxEvidenceOperations } from "../utils/docx-evidence-operations.utils";
const { Given, When, Then } = createBdd();

let loginPage: LoginPage;
let inventoryPage: InventoryPage;



Given('the user is on the Swag Labs login page', async ({ page }) => {
    // Step: Given the user is on the Swag Labs login page
    // From: tests/.generated-features/basic-login-demo-swaglabs.gen.feature:6:9
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.verifyOnLoginPage();
});

When('the user enters username {string} and password {string}', async ({ }, arg: string, arg1: string) => {
    // Step: When the user enters username "standard_user" and password "secret_sauce"
    // From: tests/.generated-features/basic-login-demo-swaglabs.gen.feature:7:9
    await loginPage.login(arg, arg1);
});

When('the user clicks the login button', async ({ }) => {
    // Step: And the user clicks the login button
    // From: tests/.generated-features/basic-login-demo-swaglabs.gen.feature:8:9
    await loginPage.clickOnLoginButton();
});

Then('the user should be redirected to the Products inventory page', async ({ page }) => {
    // Step: Then the user should be redirected to the Products inventory page
    // From: tests/.generated-features/basic-login-demo-swaglabs.gen.feature:9:9
    inventoryPage = new InventoryPage(page);
    await inventoryPage.verifyOnInventoryPage();
    await page.close();
    await PdfEvidenceOperations.generate();
    await DocxEvidenceOperations.generate();
});
