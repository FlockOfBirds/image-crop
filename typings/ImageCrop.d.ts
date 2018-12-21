declare module "react-image-crop" {
    interface Crop {
        aspect?: number;
        x: number;
        y: number;
        width?: number;
        height?: number;
    }

    interface PixelCrop {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export function makeAspectCrop(crop: Crop, imageAspect: number): Crop;

    export interface ReactCropProps {
        src: string;
        crop?: Crop;
        imageAlt?: string;
        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
        keepSelection?: boolean;
        onChange: (crop: Crop, pixelCrop: PixelCrop) => void;
        onComplete?: (crop: Crop, pixelCrop: PixelCrop) => void;
        onImageLoaded?: (target: HTMLImageElement, pixelCrop: PixelCrop) => void;
        onImageError?: (event: Event) => void;
        onDragStart?: () => void;
        onDragEnd?: () => void;
        disabled?: boolean;
        crossorigin?: string;
        children?: ReactNode;
        style?: CSSProperties;
        imageStyle?: CSSProperties;
        className?: string;
    }

    export const ReactCrop: React.ComponentClass<ReactCropProps>;

    export { ReactCrop as default };
}
