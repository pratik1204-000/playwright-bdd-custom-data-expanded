import { createBdd } from "playwright-bdd";
const { Given, When, Then } = createBdd();

let a = 0;

Given('I have number {int}', async ({ }, num: number) => {
    a = num;
});

When('I add number {int}', async ({ }, num: number) => {
    a = a + num;
});

Then('the result should be {int}', async ({ }, expected: number) => {
    if (a !== expected) {
        throw new Error(`Expected ${expected}, got ${a}`);
    }
});