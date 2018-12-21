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
    aspectRatioHorizontal?: number;
    aspectRatioVertical?: number;
    preselect?: boolean;
    readOnly: boolean;
    handleCropEnd?: (imageUrl: Blob) => void;
    imageUrl: string;
    style?: object;
}

export interface ImageCropState {
    crop: Crop;
}

export class ImageCrop extends Component<ImageCropProps, ImageCropState> {
    private imageRef: HTMLImageElement | null = null;

    readonly state = {
        crop: { aspect: 0, x: 0, y: 0 }
    };

    render() {
        return createElement(ReactCrop, {
            className: classNames("widget-image-crop", this.props.className),
            crop: this.state.crop,
            disabled: this.props.readOnly,
            keepSelection: true,
            onImageLoaded: this.onImageLoaded,
            onComplete: this.onCropComplete,
            onChange: this.onChange,
            src: this.props.imageUrl,
            style: this.props.style
        });
    }

    private onImageLoaded = (image: HTMLImageElement, _pixelCrop: any) => {
         this.imageRef = image;
         this.getAspectRatio(image);
    }

    private onChange = (crop: Crop) => {
        this.setState({ crop });
    }

    private onCropComplete = (crop: Crop, pixelCrop: PixelCrop) => {
        if (crop.width && crop.height && this.props.handleCropEnd && this.imageRef) {
            this.processCroppedImage(this.imageRef, pixelCrop);
        }
    }

    private processCroppedImage(image: HTMLImageElement, pixelCrop: PixelCrop) {
        this.getCroppedImage(image, pixelCrop)
        .then(croppedImage =>
            this.props.handleCropEnd &&
            this.props.handleCropEnd(croppedImage))
        .catch(error => {
            window.mx.ui.error("An error occurred while converting image data url to blob ", error);
        });
    }

    private getCroppedImage(image: HTMLImageElement, pixelCrop: PixelCrop) {
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

    private getAspectRatio = (image?: HTMLImageElement) => {
        const { aspectRatioHorizontal, aspectRatioVertical, preselect } = this.props;
        const cropWidth = aspectRatioHorizontal as number;
        const cropHeight = aspectRatioVertical as number;
        let crop: Crop = { aspect: 0, x: 0, y: 0 };

        if (preselect && image) {
            const imageSize = Math.min(image.width, image.height);
            const width = image.width === imageSize ? 100 : 50;
            const height = image.height === imageSize ? 100 : 50;

            if (cropWidth > 0 && cropHeight > 0) {
                crop = {
                    aspect: cropWidth / cropHeight,
                    width,
                    x: 0,
                    y: 0
                };
            } else {
                crop = {
                    aspect: 1 / 1,
                    width,
                    height,
                    x: image.width > imageSize ? 25 : 0,
                    y: image.height > imageSize ? 25 : 0
                };
            }
            this.setState({ crop });
        } else if (cropWidth > 0 && cropHeight > 0) {
            this.setState({ crop: { aspect: cropWidth / cropHeight, x: 0, y: 0 } });
        } else {
            this.setState({ crop });
        }
    }
}
