import { Component, createElement } from "react";
import ImageCrop, { ImageCropProps } from "./components/ImageCrop";
import { ImageCropContainerProps } from "./components/ImageCropContainer";

declare function require(name: string): string;

const image = "base64-image-loader!./img/imageviewerpreview.png";
type VisibilityMap = {
    [P in keyof ImageCropContainerProps]: boolean;
};

// tslint:disable-next-line class-name
export class preview extends Component<ImageCropContainerProps> {
    render() {
        return createElement(ImageCrop, this.transformProps(this.props));
    }

    private transformProps(props: ImageCropContainerProps): ImageCropProps {
        return {
            imageSource: "systemImage",
            imageUrl: this.getImage(props),
            keepSelection: this.props.keepSelection,
            minWidth: props.minWidth,
            minHeight: props.minHeight,
            maxWidth: props.maxWidth,
            maxHeight: props.maxHeight
        };
    }

    private getImage(props: ImageCropContainerProps): string {
        if (props.source === "staticUrl") {
            return props.urlStatic || image;
        } else if (props.source === "staticImage") {
            return props.imageStatic || image;
        }

        return image;
    }
}

export function getVisibleProperties(valueMap: ImageCropContainerProps, visibilityMap: VisibilityMap) {
    visibilityMap.dynamicUrlAttribute = valueMap.source === "urlAttribute";
    visibilityMap.urlStatic = valueMap.source === "staticUrl";
    visibilityMap.imageStatic = valueMap.source === "staticImage";

    visibilityMap.afterCropMicroflow = valueMap.afterCrop === "callMicroflow";
    visibilityMap.afterCropNanoflow = valueMap.afterCrop === "callNanoflow";

    return visibilityMap;
}

export function getPreviewCss() {
    return require("./ui/ImageCrop.scss");
}
