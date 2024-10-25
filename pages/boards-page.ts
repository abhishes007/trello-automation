import { Locator, Page, expect } from '@playwright/test';

export class BoardsPage {

    private page : Page;
    private boardsHeader : Locator;
    private taskBoard : Locator;
    private listSelector: Locator;
    private addListItem: Locator;
    private newListTextBox: Locator;
    private addListButton: Locator;
    private newListTile: Locator;
    private addTodoTaskButton: Locator;
    private addTodoTaskTextField: Locator;
    private addCardButton: Locator;
    private addCardCloseButton: Locator;
    private inProgressList : Locator;
    private doneList: Locator;
    private closeBtn: Locator;
    private showMenu: Locator;
    private closeCurrentBoard: Locator;
    private permanentDelete: Locator;
    private deleteBoardConfirm: Locator;

    constructor(page: Page) {
        this.page = page;
        this.boardsHeader = page.locator('.boards-page-section-header-name');
        this.taskBoard = page.getByRole('link', { name: 'Task Board' })
        this.addListItem = page.getByRole('button', { name: 'Add another list'});
        this.newListTextBox = page.getByPlaceholder('Enter list name…');
        this.addListButton = page.getByTestId('list-composer-add-list-button');
        this.newListTile = page.getByTestId('list-name-textarea');
        this.listSelector = page.locator('#board > li');
        this.addTodoTaskButton = page.locator('li').filter({ hasText: 'To-Do' }).getByTestId('list-add-card-button');
        this.addTodoTaskTextField = page.getByPlaceholder('Enter a title or paste a link');
        this.addCardButton =  page.getByRole('button', {name:'Add card'})
        this.addCardCloseButton = page.getByTestId('CloseIcon');
        this.inProgressList = page.locator('li').filter({ hasText: 'In-Progress' });
        this.doneList = page.locator('li').filter({ hasText: 'Done' });
        this.closeBtn = this.page.getByTestId('close-board-confirm-button')
        this.showMenu = this.page.getByLabel('Show menu');
        this.closeCurrentBoard = this.page.getByRole('button', { name: 'Close board' })
        this.permanentDelete = this.page.getByTestId('close-board-delete-board-button');
        this.deleteBoardConfirm = this.page.getByTestId('close-board-delete-board-confirm-button');
    }

    async verifyBoardsHeader(boardHeader : string): Promise<void> {
        await expect(this.boardsHeader).toHaveText(boardHeader);
    }

    async getNewListTile(): Promise<Locator> {
        return this.newListTile;
    }

    async getInProgressList(): Promise<Locator> {
        return this.inProgressList;
    }

    async getDoneList(): Promise<Locator> {
        return this.doneList;
    }

    async addList(listName: string) : Promise<void> {
        await this.addListItem.click();
        await this.newListTextBox.fill(listName);
        await this.addListButton.click();
    }

    async navigateToTaskBoard() : Promise<void> {
        await this.taskBoard.click();
        await this.page.waitForLoadState('networkidle');
    }

    async addTaskInTodoList(taskName: string) : Promise<void> {
        await this.addTodoTaskButton.click();
        await this.addTodoTaskTextField.fill(taskName);
        await this.addCardButton.click();
        await this.addCardCloseButton.click();
    }

    async getTaskCard(taskName:string) {
        await this.page.getByText(taskName);
    }

    async closeAndDeleteBoard(): Promise<void> {
        await this.showMenu.click();
        await this.closeCurrentBoard.click();
        await this.closeBtn.click();
        await this.permanentDelete.click();
        await this.deleteBoardConfirm.click();
    }
}