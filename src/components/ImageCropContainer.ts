import { Component, createElement } from "react";
import { hot } from "react-hot-loader";
import { Alert } from "./Alert";

import { ImageCrop } from "./ImageCrop";
import { parseStyle, validateProps } from "../utils/Helper";

export interface WrapperProps {
    class: string;
    friendlyId: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    readOnly: boolean;
    style?: string;
}

export interface ImageCropContainerProps extends WrapperProps {
    aspectRatioHorizontal: number;
    aspectRatioVertical: number;
    preselect: boolean;
}

export interface ImageCropContainerState {
    alertMessage: string;
    imageUrl: string;
    croppedImage?: Blob;
}

class ImageCropContainer extends Component<ImageCropContainerProps, ImageCropContainerState> {
    private subscriptionHandles: number[] = [];
    private formHandle = 0;

    readonly state: ImageCropContainerState = {
        alertMessage: "",
        croppedImage: {} as Blob,
        imageUrl: ""
    };

    render() {
        if (this.state.alertMessage) {
            return createElement(Alert, { className: "widget-image-crop-alert-danger" }, this.state.alertMessage);
        }

        return createElement(ImageCrop, {
            aspectRatioHorizontal: this.props.aspectRatioHorizontal,
            aspectRatioVertical: this.props.aspectRatioVertical,
            className: this.props.class,
            readOnly: this.isReadOnly(),
            handleCropEnd: this.handleCropEnd,
            imageUrl: this.state.imageUrl,
            preselect: this.props.preselect,
            style: parseStyle(this.props.style)
        });
    }

    componentDidMount() {
        this.formHandle = this.props.mxform.listen("commit", success => this.saveImage(success));
    }

    componentWillReceiveProps(newProps: ImageCropContainerProps) {
        this.setImageUrl(newProps.mxObject);
        this.resetSubscriptions(newProps.mxObject);
        this.setState({ alertMessage: validateProps(newProps) });
    }

    componentWillUnmount() {
        if (this.formHandle) {
            this.props.mxform.unlisten(this.formHandle);
        }
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        if (mxObject) {
            window.mx.data.subscribe({
                callback: () => this.setImageUrl(mxObject),
                guid: mxObject.getGuid()
            });
        }
    }

    private handleCropEnd = (croppedImage: Blob) => {
        if (croppedImage.size) {
            this.setState({ croppedImage });
        }
    }

    private isReadOnly(): boolean {
        return !this.props.mxObject || this.props.readOnly;
    }

    private saveImage = (success: () => void) => {
        const { mxObject } = this.props;
        const { croppedImage } = this.state;
        const filename = mxObject.get("Name") as string;

        if (croppedImage && croppedImage.size > 0 && mxObject.inheritsFrom("System.Image")) {
            mx.data.saveDocument(mxObject.getGuid(), filename,
                {}, croppedImage, success,
                error => mx.ui.error("Error saving image crop: " + error.message)
            );
        } else {
            success();
        }
    }

    private setImageUrl(mxObject?: mendix.lib.MxObject) {
        if (mxObject && mxObject.get("HasContents")) {
            const url = window.mx.data.getDocumentUrl(mxObject.getGuid(), mxObject.get("changedDate") as number);
            window.mx.data.getImageUrl(url, imageUrl => this.setState({ imageUrl }));
        } else {
            this.setState({ imageUrl: "" });
        }
    }
}

export default hot(module)(ImageCropContainer);
