import { Component, createElement } from "react";

import * as classNames from "classnames";
import ReactCrop from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";
import "../ui/ImageCrop.scss";

export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Crop {
    aspect?: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
}

export interface ImageCropProps {
    className?: string;
    readOnly: boolean;
    handleCropEnd?: (imageUrl: Blob) => void;
    imageUrl: string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    positionX: number;
    positionY: number;
    style?: object;
}

export interface ImageCropState {
    crop: Crop;
}

export class ImageCrop extends Component<ImageCropProps, ImageCropState> {
    private imageRef: HTMLImageElement;

    readonly state = {
        crop: {
            aspect: 0,
            height: this.props.minHeight,
            width: this.props.minWidth,
            x: this.props.positionX,
            y: this.props.positionY
        }
    };

    render() {
        return createElement(ReactCrop, {
            className: classNames("widget-image-crop", this.props.className),
            crop: this.state.crop,
            disabled: this.props.readOnly,
            keepSelection: true,
            onImageLoaded: this.onImageLoaded,
            onComplete: this.onCropComplete,
            onChange: this.onCropChange,
            src: this.props.imageUrl
        });
    }

    private onImageLoaded = (image: HTMLImageElement) => {
         this.imageRef = image;
    }

    private onCropChange = (crop: Crop, _pixelCrop: PixelCrop) => {
        this.setState({ crop });
    }

    private onCropComplete = (crop: Crop, pixelCrop: PixelCrop) => {
        if (crop.width && crop.height && this.props.handleCropEnd) {
            this.getCroppedImg(this.imageRef, pixelCrop)
                .then(croppedImage =>
                    this.props.handleCropEnd &&
                    this.props.handleCropEnd(croppedImage))
                .catch(error => {
                    console.log("An error occurred while converting image data url to blob ", error); // tslint:disable-line
                });
        }
    }

    private getCroppedImg(image: HTMLImageElement, pixelCrop: PixelCrop) {
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        const url = canvas.toDataURL("image/png", 1.0);

        return window.fetch(url).then(res => res.blob());
    }
}
