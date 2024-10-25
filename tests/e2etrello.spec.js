import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page';
import { BoardsPage } from '../pages/boards-page';
import testdata from '../fixtures/testdata.json';

import dotenv from 'dotenv';

dotenv.config();

const email = process.env.TRELLO_EMAIL;
const password = process.env.TRELLO_PASSWORD;

const taskData = testdata[0];
const templateData = testdata[1];

test.describe('Trello Board Automation using Playwright', async() => {

    test.beforeEach( async ({ page }) => {
        await page.goto("/");
        const loginPage = new LoginPage(page);
        const boardPage = new BoardsPage(page);
        await loginPage.login(email, password);
        await boardPage.verifyBoardsHeader('YOUR WORKSPACES');
        //Navigate to Board
        await boardPage.navigateToTaskBoard();
    })

    test('Add Backlog List to Board', async ({page}) => {
        const boardPage = new BoardsPage(page);
        await page.waitForSelector('#board > li');
        let listCount = await page.locator('#board > li').count();
        console.log(listCount);
        await expect(listCount).toBe(3);
        await boardPage.addList('Backlog');
        listCount = await page.locator('#board > li').count();
        await expect(listCount).toBe(4);
        console.log(listCount);
        await expect(page.getByTestId('list-name-textarea').nth(3)).toHaveText('Backlog');
    })

    test('Add Tasks to To-Do List', async ({page}) => {
        const boardPage = new BoardsPage(page);
        //Add Task 1:
        boardPage.addTaskInTodoList('Task #1');
        await expect(page.getByRole('link', { name: 'Task #1' })).toBeVisible();
        //Add Task 2:
        boardPage.addTaskInTodoList('Task #2');
        await expect(page.getByRole('link', { name: 'Task #2' })).toBeVisible();
        //Add Task 3:
        boardPage.addTaskInTodoList('Task #3');
        await expect(page.getByRole('link', { name: 'Task #3' })).toBeVisible();
    })
    
    test('Drag and Drop Task from To-Do to In-Progress and Done', async ({page}) => {
        //Drag and Drop Task Card 2 from To-Do to In Progress
        await page.getByText(taskData.task2).dragTo(page.locator('#board > li').nth(1));
        await expect(page.locator('li').filter({ hasText: 'In-Progress' }).getByText(taskData.task2)).toBeVisible();
        //Drag and Drop Task Card 3 from To-Do to Done
        await page.getByText(taskData.task3).dragTo(page.locator('#board > li').nth(2));
        await expect(page.locator('li').filter({ hasText: 'Done' }).getByText(taskData.task3)).toBeVisible();
    })

    test('Create Template and create a Task Card from using template', async ({page}) => {
       //Create a template
       await page.getByTestId('card-template-list-button').first().click();
       await page.getByTestId('create-new-template-card-button').click();
       await page.getByPlaceholder('Template title').fill(templateData.template1);
       await page.getByTestId('new-template-card-submit-button').click();
       await page.getByTestId('card-back-labels-button').click();
       await page.getByPlaceholder('Search labels…').fill(templateData.label);
       await expect(page.getByLabel('Color: green, title: none')).toBeVisible();
       await page.getByTestId('clickable-checkbox').check();
       await expect(page.getByTestId('clickable-checkbox')).toBeChecked();
       await page.getByTestId('popover-close').click();
       await page.getByTestId('card-back-checklist-button').click();
       await page.getByRole('button', { name: 'Add', exact: true }).click();
       //Add checklist to the template
       await expect(page.locator('h3').filter({ hasText: 'Checklist'})).toBeVisible();
       await page.getByTestId('check-item-name-input').fill(templateData.checkListOption1);
       await page.getByTestId('check-item-add-button').click();
       await expect(page.getByRole('button', {name: 'Option1'})).toBeVisible();
       await page.getByTestId('check-item-name-input').fill(templateData.checkListOption2);
       await page.getByTestId('check-item-add-button').click();
       await expect(page.getByRole('button', {name: 'Option2'})).toBeVisible();
       await page.getByTestId('check-item-name-input').fill(templateData.checkListOption3);
       await page.getByTestId('check-item-add-button').click();
       await expect(page.getByRole('button', {name: 'Option3'})).toBeVisible();
       await page.getByLabel('Close dialog').click();
       await expect(page.locator("a[href*='template1']")).toHaveText(templateData.template1);
       //Create task card from template
       await page.locator("a[href*='template1']").click();
       await page.getByTestId('create-card-from-template-banner-button').click();
       await page.getByTestId('card-title-textarea').fill(templateData.templateTask1);
       await page.locator('.value-container').click();
       await page.getByRole('option', { name: 'Done' }).click();
       await page.getByTestId('create-card-from-template-button').click();
       await expect(page.getByTestId('card-back-title-input')).toHaveText(templateData.templateTask1)
       await page.getByLabel('Close dialog').click();
       await expect(page.locator('li').filter({ hasText: 'Done' }).getByText(templateData.templateTask1)).toBeVisible();
       //Check mark option from Checklist
       await page.locator("a[href*='taskfromtemplate1']").click();
       await page.locator('li').filter({ hasText: 'Option2' }).getByTestId('clickable-checkbox').check();
       await expect(page.locator('li').filter({ hasText: 'Option2' }).getByTestId('clickable-checkbox')).toBeChecked();
       await page.getByLabel('Close dialog').click();
       await expect(page.locator('li').filter({ hasText: 'Done'}).getByTestId('checklist-badge')).toHaveText('1/3');
    })

    test('Edit Template and validate checklist options after re-ordering', async ({page}) => {
        //Open Create Template
        await page.getByRole('link', { name: 'Template#1', exact: true }).click();
        //Drag Option 3 over Option 2
        await expect(page.getByTestId('checklist-title')).toHaveText('Checklist');
        await page.getByRole('button', { name: 'Option3' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Option3' }).hover();
        await page.mouse.down();
        await page.getByRole('button', { name: 'Option2' }).hover()
        await page.getByRole('button', { name: 'Option2' }).hover();
        await page.mouse.up();
        //Validate Option3 is second in the list
        const textOption3 = await page.locator('[data-testid="check-item-container"]').nth(1).textContent();
        expect(textOption3).toBe(templateData.checkListOption3);
    })
})
