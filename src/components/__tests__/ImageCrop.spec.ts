import { createElement } from "react";
import ReactCrop from "react-image-crop";
import { shallow } from "enzyme";

import { ImageCrop, ImageCropProps } from "../ImageCrop";

describe("Image crop", () => {
    const renderImageCrop = (props: ImageCropProps) => shallow(createElement(ImageCrop, props as ImageCropProps));

    const defaultProps: ImageCropProps = {
        imageUrl: "https://www.mendix.com/ui/svg/logo-mendix.svg",
        readOnly: false,
        handleCropEnd: jasmine.any(Function),
        preselect: true,
        aspectRatioHorizontal: 0,
        aspectRatioVertical: 0
    };
    const crop = { aspect: 0, x: 0, y: 0 };

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

    it("should call on change and on complete callbacks when a crop is changed", () => {
        const wrapper = renderImageCrop(defaultProps);
        const imageCropInstance = wrapper.instance() as any;
        const newImage = document.createElement("img") as HTMLImageElement;
        const newCrop = { height: 11, width: 10, x: 10, y: 10 };
        const pixelCrop = { height: 94, width: 200, x: 200, y: 94 };

        newImage.src = defaultProps.imageUrl;
        imageCropInstance.imageRef = newImage;
        wrapper.setState({ crop });
        wrapper.setProps({
            handleCropEnd: () => jasmine.any(Function),
            preselect: false,
            aspectRatioHorizontal: 5,
            aspectRatioVertical: 12
        });

        const cropCompleteSpy = spyOn(imageCropInstance, "onCropComplete").and.callThrough();
        const cropChangeSpy = spyOn(imageCropInstance, "onChange").and.callThrough();

        imageCropInstance.onImageLoaded(imageCropInstance.imageRef);
        imageCropInstance.onChange(newCrop);
        imageCropInstance.onCropComplete(newCrop, pixelCrop);

        expect(cropChangeSpy).toHaveBeenCalled();
        expect(cropCompleteSpy).toHaveBeenCalled();
    });

    it("calls the image load callback when the image is loaded", () => {
        const wrapper = renderImageCrop(defaultProps);
        const imageCropInstance = wrapper.instance() as any;
        const newImage = document.createElement("img") as HTMLImageElement;

        newImage.src = defaultProps.imageUrl;
        newImage.width = 20;
        newImage.height = 15;
        imageCropInstance.imageRef = newImage;
        wrapper.setState({ crop });

        const imageLoadedSpy = spyOn(imageCropInstance, "onImageLoaded").and.callThrough();
        imageCropInstance.onImageLoaded(imageCropInstance.imageRef);

        expect(imageLoadedSpy).toHaveBeenCalled();
    });

    it("renders with a pre-selected image", () => {
        const wrapper = renderImageCrop(defaultProps);
        const imageCropInstance = wrapper.instance() as any;
        const newImage = document.createElement("img") as HTMLImageElement;

        newImage.src = defaultProps.imageUrl;
        newImage.width = 10;
        newImage.height = 15;
        imageCropInstance.imageRef = newImage;
        wrapper.setState({ crop });

        const cropChangeSpy = spyOn(imageCropInstance, "getAspectRatio").and.callThrough();
        imageCropInstance.getAspectRatio(imageCropInstance.imageRef);

        expect(cropChangeSpy).toHaveBeenCalled();
    });
});
