import HomePage from "./pages/home.page";

describe("Image crop", () => {

    beforeAll(() => {
        HomePage.open();
    });

    it("renders with an image", () => {
        HomePage.imagecrop.waitForVisible();
        const imageSrc = HomePage.imagecrop.getAttribute("src");

        expect(imageSrc).toContain("trevor_cole_385236_unsplash__1_.jpg");
    });

    it("renders the image with a crop selection", () => {
        HomePage.cropSelection.waitForVisible();
        const elementChildren = HomePage.cropSelection.getAttribute("childElementCount");

        expect(elementChildren).toBeGreaterThan(8);
    });
});
