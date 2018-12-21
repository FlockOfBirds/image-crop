import { Component, createElement } from "react";
import { ImageCrop, ImageCropProps } from "./components/ImageCrop";
import { ImageCropContainerProps, ImageCropContainerState } from "./components/ImageCropContainer";
import { Alert } from "./components/Alert";
import { validateProps } from "./utils/Helper";

declare function require(name: string): string;

// tslint:disable-next-line class-name
export class preview extends Component<ImageCropContainerProps, ImageCropContainerState> {
    render() {
        const message = validateProps(this.props);
        if (message) {
            return createElement(Alert, { className: "widget-image-crop-alert-danger" }, message);
        }

        return createElement(ImageCrop, this.transformProps(this.props));
    }

    private transformProps(_props: ImageCropContainerProps): ImageCropProps {
        return {
            aspectRatioHorizontal: 0,
            aspectRatioVertical: 0,
            imageUrl: "https://www.mendix.com/ui/svg/logo-mendix.svg",
            preselect: true,
            readOnly: false
        };
    }
}

export function getPreviewCss() {
    return require("./ui/ImageCrop.scss");
}
