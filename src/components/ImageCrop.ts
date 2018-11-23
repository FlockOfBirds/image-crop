import { Component, createElement } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "../ui/ImageCrop.scss";
import classNames = require("classnames");

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
    editable?: boolean;
    handleCropEnd?: (imageUrl: Blob) => void;
    imageSource: string;
    imageUrl: string;
    keepSelection?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    style?: object;
}

export interface ImageCropState {
    crop: Crop;
    croppedImageUrl: string;
}

export class ImageCrop extends Component<ImageCropProps, ImageCropState> {
    private imageRef: HTMLImageElement;

    constructor(props: ImageCropProps) {
        super(props);
        this.state = {
            crop: {
                x: 10,
                y: 10,
                width: props.minWidth,
                height: props.minHeight
            },
            croppedImageUrl: ""
        };
    }

    render() {
        return createElement("div", { className: classNames("widget-image-crop",
                    this.props.className, { hidden: this.props.editable })
                },
            createElement(ReactCrop, {
                src: this.props.imageUrl || "",
                crop: this.state.crop,
                keepSelection: this.props.keepSelection,
                onImageLoaded: this.onImageLoaded,
                onComplete: this.onCropComplete,
                onChange: this.onCropChange
            })
        );
    }

    private onImageLoaded = (image: HTMLImageElement) => {
         this.imageRef = image;
    }

    private onCropChange = (crop: Crop, _pixelCrop: PixelCrop) => {
        this.setState({ crop });
    }

    private onCropComplete = (crop: Crop, pixelCrop: PixelCrop) => {
        if (crop.width && crop.height) {
            if (this.props.handleCropEnd) {
                this.getCroppedImg(this.imageRef, pixelCrop)
                .then(croppedImage =>
                    this.props.handleCropEnd &&
                    this.props.handleCropEnd(croppedImage)
                ).catch(error => {
                    console.log("An error occurred while converting image data url to blob ", error); // tslint:disable-line
                });
            }
        }
    }

    private getCroppedImg(image: HTMLImageElement, pixelCrop: PixelCrop) {
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.drawImage(
                this.getImage(image),
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );
        }

        const url = canvas.toDataURL("image/png");

        return window.fetch(url).then(res => res.blob());
    }

    private getImage = (image: HTMLImageElement): HTMLImageElement => {
        if (this.props.imageSource !== "staticImage") {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                return img;
            };
            img.onerror = () => {
                console.warn("Could not load image at " + image.currentSrc); // tslint:disable-line
            };
            img.src = image.currentSrc;

            return img;
        }

        return image;
    }
}

export default ImageCrop;
