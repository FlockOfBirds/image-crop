import { Component, createElement } from "react";
import { hot } from "react-hot-loader";
import { Alert } from "./Alert";

import { ImageCrop } from "./ImageCrop";
import { Helper } from "../utils/Helper";

export interface WrapperProps {
    class: string;
    friendlyId: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    readOnly: boolean;
    style?: string;
}

export interface ImageCropContainerProps extends WrapperProps {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    positionX: number;
    positionY: number;
}

export interface ImageCropContainerState {
    alertMessage: string;
    imageUrl: string;
    croppedImage: Blob;
}

class ImageCropContainer extends Component<ImageCropContainerProps, ImageCropContainerState> {

    private subscriptionHandles: number[] = [];
    private formHandle?: number;

    readonly state: ImageCropContainerState = {
        alertMessage: "",
        croppedImage: {} as Blob,
        imageUrl: ""
    };

    render() {
        if (this.state.alertMessage) {
            return createElement(Alert, { className: "widget-image-crop-alert" }, this.state.alertMessage);
        }

        return createElement(ImageCrop, {
            ...this.props as ImageCropContainerProps,
            className: this.props.class,
            readOnly: this.isReadOnly(),
            handleCropEnd: this.handleCropEnd,
            imageUrl: this.state.imageUrl,
            style: Helper.parseStyle(this.props.style)
        });
    }

    componentDidMount() {
        this.formHandle = this.props.mxform.listen("commit", callback => this.saveImage(callback));
    }

    componentWillReceiveProps(newProps: ImageCropContainerProps) {
        this.setImageUrl(newProps.mxObject);
        const alertMessage = this.validateProps(newProps);

        if (alertMessage) {
            this.setState({ alertMessage });
        }
    }

    componentWillUnmount() {
        if (this.formHandle) {
            this.props.mxform.unlisten(this.formHandle);
        }
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private handleCropEnd = (croppedImage: Blob) => {
        this.setState({ croppedImage });
    }

    private isReadOnly(): boolean {
        return !this.props.mxObject || this.props.readOnly;
    }

    private saveImage = (callback: () => void) => {
        const { mxObject } = this.props;
        const filename = mxObject.get("Name") as string;

        if (this.state.croppedImage && mxObject.inheritsFrom("System.Image")) {
            mx.data.saveDocument(mxObject.getGuid(), filename, {},
                this.state.croppedImage,
                callback,
                error => mx.ui.error("Error saving image crop: " + error.message)
            );
        } else {
            callback();
        }
    }

    private validateProps(props: ImageCropContainerProps): string {
        const errorMessage: string[] = [];
        if (props.mxObject && !props.mxObject.inheritsFrom("System.Image")) {
            errorMessage.push(`${props.friendlyId}: ${props.mxObject.getEntity()} does not inherit from "System.Image.`);
        }
        if (errorMessage.length) {
            const widgetName = props.friendlyId.split(".")[2];
            const message = `Configuration error in widget - ${widgetName}: ${errorMessage.join(", ")}`;

            return message;
        }

        return errorMessage.join(", ");
    }

    private setImageUrl(mxObject?: mendix.lib.MxObject) {
        if (mxObject && mxObject.get("HasContents")) {
            const url = window.mx.data.getDocumentUrl(mxObject.getGuid(), mxObject.get("changedDate") as number);
            window.mx.data.getImageUrl(url,
                imageUrl => this.setState({ imageUrl })
            );
        } else {
            this.setState({ imageUrl: "" });
        }
    }
}

export default hot(module)(ImageCropContainer);
