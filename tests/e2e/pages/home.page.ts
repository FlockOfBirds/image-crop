class HomePage {
    public get imagecrop() { return browser.element(".ReactCrop.widget-image-crop.mx-name-imageCrop2  img"); }
    public get cropSelection() {
        return browser.element(".mx-name-imageCrop2 .ReactCrop__crop-selection .ReactCrop__drag-elements");
    }

    public open(): void {
        browser.url("/p/home");
    }
}

const page = new HomePage();

export default page;
