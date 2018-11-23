import { Component, createElement } from "react";
import { ImageCrop } from "./components/ImageCrop";

// tslint:disable-next-line class-name
export class preview extends Component {
    render() {
        return createElement(ImageCrop);
    }
}
