import { Component, createElement } from "react";
import ImageCrop from "./ImageCrop";
import { Alert } from "./Alert";
import { UrlHelper } from "../utils/UrlHelper";

export interface WrapperProps {
    class: string;
    friendlyId: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    style?: string;
}

export interface ImageCropContainerProps extends WrapperProps {
    source: DataSource;
    dynamicUrlAttribute: string;
    urlStatic: string;
    imageStatic: string;
    afterCropMicroflow: string;
    afterCropNanoflow: mx.Nanoflow;
    afterCrop: AfterCropOption;
    keepSelection: boolean;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
}

export interface ImageCropContainerState {
    alertMessage: string;
    imageUrl: string;
    croppedImage: Blob;
}

type DataSource = "staticImage" | "urlAttribute" | "staticUrl";
type AfterCropOption = "doNothing" | "callMicroflow" | "callNanoflow";
export default class ImageCropContainer extends Component<ImageCropContainerProps, ImageCropContainerState> {

    private subscriptionHandles: number[] = [];
    private attributeCallback: (mxObject: mendix.lib.MxObject) => () => void;
    private formHandle?: number;

    constructor(props: ImageCropContainerProps) {
        super(props);

        this.state = {
            alertMessage: ImageCropContainer.validateProps(props),
            croppedImage: {} as Blob,
            imageUrl: ""
        };

        this.formHandle = 0;
        this.attributeCallback = mxObject => () => this.setImageUrl(mxObject);
    }

    render() {
        if (this.state.alertMessage) {
            return createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-image-crop-alert",
                message: this.state.alertMessage
            });
        }

        return createElement(ImageCrop, {
            className: this.props.class,
            imageSource: this.props.source,
            imageUrl: this.state.imageUrl,
            keepSelection: this.props.keepSelection,
            maxHeight: this.props.maxHeight,
            maxWidth: this.props.maxWidth,
            minHeight: this.props.minHeight,
            minWidth: this.props.minWidth,
            handleCropEnd: this.handleCropEnd,
            style: UrlHelper.parseStyle(this.props.style)
        });
    }

    componentDidMount() {
        this.formHandle = this.props.mxform.listen("commit", callback => this.saveImageDocument(callback));
    }

    componentWillReceiveProps(newProps: ImageCropContainerProps) {
        this.setImageUrl(newProps.mxObject);
        this.resetSubscriptions(newProps.mxObject);
    }

    componentDidUpdate() {
        this.resetSubscriptions(this.props.mxObject);
    }

    componentWillUnmount() {
        if (this.formHandle) {
            this.props.mxform.unlisten(this.formHandle);
        }
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.props.dynamicUrlAttribute,
                callback: this.attributeCallback(mxObject),
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.attributeCallback(mxObject),
                guid: mxObject.getGuid()
            }));
        }
    }

    private handleCropEnd = (croppedImage: Blob) => {
        this.setState({ croppedImage });
    }

    private saveImageDocument = (callback: () => void) => {
        const { mxObject } = this.props;
        const filename = `imageCrop${Math.floor(Math.random() * 1000000)}.png`;

        if (this.state.croppedImage && mxObject.inheritsFrom("System.Image")) {
            mx.data.saveDocument(mxObject.getGuid(), filename, {},
                this.state.croppedImage,
                callback,
                error => mx.ui.error("Error saving image crop: " + error.message)
            );
            this.executeAction();
        } else {
            callback();
        }
    }

    private executeAction() {
        const { afterCropNanoflow, afterCrop, afterCropMicroflow, mxform, mxObject } = this.props;
        const context = new mendix.lib.MxContext();
        if (mxObject) {
            context.setContext(mxObject.getEntity(), mxObject.getGuid());
        }

        if (afterCrop === "callMicroflow" && afterCropMicroflow) {
            window.mx.ui.action(afterCropMicroflow, {
                error: (error) =>
                    window.mx.ui.error(`An error occured while executing microflow ${afterCropMicroflow}: ${error.message}`),
                params: {
                    applyto: "selection",
                    guids: [ mxObject.getGuid() ]
                }
            });
        } else if (afterCrop === "callNanoflow" && afterCropNanoflow.nanoflow) {
            window.mx.data.callNanoflow({
                nanoflow: afterCropNanoflow,
                origin: mxform,
                context,
                error: (error) => window.mx.ui.error(`An error occurred while executing nanoflow ${afterCropNanoflow}: ${error.message}`)
            });
        }
    }

    public static validateProps(props: ImageCropContainerProps): string {
        const errorMessage: string[] = [];
        if (props.source === "urlAttribute" && !props.dynamicUrlAttribute) {
            errorMessage.push("for data source option 'Dynamic URL' the Dynamic image URL attribute should be configured");
        }
        if (props.source === "staticUrl" && !props.urlStatic) {
            errorMessage.push("for data source option 'Static URL' a static image url should be configured");
        }
        if (props.afterCrop === "callMicroflow" && !props.afterCropMicroflow) {
            errorMessage.push("After crop event is set to 'Call a microflow' but no microflow is selected");
        } else if (props.afterCrop === "callNanoflow" && !props.afterCropNanoflow.nanoflow) {
            errorMessage.push("After crop event is set to 'Call a nanoflow' but no nanoflow is selected");
        }
        if (props.source === "staticImage" && props.mxObject && !props.mxObject.inheritsFrom("System.Image")) {
            errorMessage.push(`${props.friendlyId}: ${props.mxObject.getEntity()} does not inherit from "System.Image.`);
        }
        if (errorMessage.length > 0) {
            const widgetName = props.friendlyId.split(".")[2];
            const message = `Configuration error in widget - ${widgetName}: ${errorMessage.join(", ")}`;

            return message;
        }

        return errorMessage.join(", ");
    }

    private setImageUrl(mxObject?: mendix.lib.MxObject) {
        if (mxObject && this.props.source === "urlAttribute") {
            mxObject.fetch(this.props.dynamicUrlAttribute, (imageUrl: string) => {
                this.setState({ imageUrl });
            });
        } else if (!mxObject && (this.props.source === "staticImage" || this.props.source === "urlAttribute")) {
            this.setState({ imageUrl: "" });
        } else if (this.props.source === "staticUrl") {
            this.setState({ imageUrl: this.props.urlStatic });
        } else if (this.props.source === "staticImage") {
            this.setState({ imageUrl: UrlHelper.getStaticResourceUrl(this.props.imageStatic) });
        }
    }
}
