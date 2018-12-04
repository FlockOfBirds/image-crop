import { createElement } from "react";
import ReactCrop from "react-image-crop";
import { shallow } from "enzyme";

import { ImageCrop, ImageCropProps } from "../ImageCrop";

describe("Image crop", () => {
    const renderImageCrop = (props: ImageCropProps) => shallow(createElement(ImageCrop, props as ImageCropProps));
    // const fullRenderImageCrop = (props: ImageCropProps) => mount(createElement(ImageCrop, props as ImageCropProps));

    const defaultProps: ImageCropProps = {
        imageUrl: "https://www.w3schools.com/css/paris.jpg",
        minWidth: 10,
        maxWidth: 10,
        positionX: 0,
        positionY: 0,
        readOnly: false,
        handleCropEnd: jasmine.any(Function)
    };
    const crop = { aspect: 0, height: undefined, width: 10, x: 0, y: 0 };

    it("renders the structure correctly", () => {
        const imageCrop = renderImageCrop(defaultProps);

        expect(imageCrop).toBeElement(
            createElement(ReactCrop, {
                className: "widget-image-crop",
                src: defaultProps.imageUrl,
                crop,
                keepSelection: true,
                onChange: jasmine.any(Function),
                onComplete: jasmine.any(Function),
                onImageLoaded: jasmine.any(Function)
            })
        );
    });

    it("renders with an initial cropper frame position when an image src is provided", () => {
        const wrapper = renderImageCrop(defaultProps);
        const imageCropInstance = wrapper.instance() as any;
        const newImage = document.createElement("img") as HTMLImageElement;
        const newCrop = { height: 11, width: 10, x: 10, y: 10 };
        const pixelCrop = { height: 94, width: 200, x: 200, y: 94 };

        newImage.src = defaultProps.imageUrl;
        imageCropInstance.imageRef = newImage;
        wrapper.setState({ crop });
        wrapper.setProps({ handleCropEnd: () => jasmine.any(Function) });

        const imageLoadedSpy = spyOn(imageCropInstance, "onImageLoaded").and.callThrough();
        const cropCompleteSpy = spyOn(imageCropInstance, "onCropComplete").and.callThrough();
        const cropChangeSpy = spyOn(imageCropInstance, "onCropChange").and.callThrough();

        imageCropInstance.onImageLoaded(imageCropInstance.imageRef);
        imageCropInstance.onCropChange(newCrop);
        imageCropInstance.onCropComplete(newCrop, pixelCrop);

        expect(cropChangeSpy).toHaveBeenCalled();
        expect(cropCompleteSpy).toHaveBeenCalled();
        expect(imageLoadedSpy).toHaveBeenCalled();
    });
});
