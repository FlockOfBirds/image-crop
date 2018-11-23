import { Component, createElement } from "react";
import { ImageCrop } from "./ImageCrop";

export default class ImageCropContainer extends Component<{}, {}> {
    render() {
        return createElement(ImageCrop);
    }
}
