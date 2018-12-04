import { Component, createElement } from "react";
import { ImageCrop, ImageCropProps } from "./components/ImageCrop";
import { ImageCropContainerProps } from "./components/ImageCropContainer";

declare function require(name: string): string;

const image = "base64-image-loader!./img/imagecroppreview.png";

// tslint:disable-next-line class-name
export class preview extends Component<ImageCropContainerProps> {
    render() {
        return createElement(ImageCrop, this.transformProps(this.props));
    }

    private transformProps(props: ImageCropContainerProps): ImageCropProps {
        return {
            imageUrl: image,
            readOnly: false,
            minWidth: props.minWidth,
            minHeight: props.minHeight,
            maxWidth: props.maxWidth,
            maxHeight: props.maxHeight,
            positionX: props.positionX,
            positionY: props.positionY
        };
    }

}

export function getPreviewCss() {
    return require("./ui/ImageCrop.scss");
}
