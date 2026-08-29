declare module 'scrolly-video/dist/ScrollyVideo.esm.jsx' {
  import type { ForwardRefExoticComponent, RefAttributes } from 'react';

  type ScrollyVideoProps = {
    src: string;
    transitionSpeed?: number;
    frameThreshold?: number;
    cover?: boolean;
    sticky?: boolean;
    full?: boolean;
    trackScroll?: boolean;
    lockScroll?: boolean;
    useWebCodecs?: boolean;
    videoPercentage?: number;
    debug?: boolean;
    onReady?: () => void;
    onChange?: (percentage: number) => void;
  };

  const ScrollyVideo: ForwardRefExoticComponent<ScrollyVideoProps & RefAttributes<unknown>>;
  export default ScrollyVideo;
}
