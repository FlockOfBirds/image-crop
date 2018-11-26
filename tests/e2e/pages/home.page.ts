class HomePage {
    public get imagecrop() { return browser.element(".mx-name-imageCrop2  img"); }
    public get cropSelection() {
        return browser.element(".mx-name-imageCrop2 .ReactCrop .ReactCrop__crop-selection .ReactCrop__drag-elements");
    }

    public open(): void {
        browser.url("/");
    }
}

const page = new HomePage();

export default page;
