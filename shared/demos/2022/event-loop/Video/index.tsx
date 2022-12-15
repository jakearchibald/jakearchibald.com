import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

interface Props {
  width: number;
  height: number;
  src: string;
  av1Src?: string;
  apiName: string;
}

const Video: FunctionalComponent<Props> = ({
  width,
  height,
  apiName,
  av1Src,
  src,
}) => {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setAPI(apiName, {
      reset: () => {
        video.current!.currentTime = 0;
        video.current!.pause();
      },
      play: () => video.current!.play(),
    });
  }, []);

  return (
    <video
      ref={video}
      playsInline
      muted
      width={width}
      height={height}
      preload="auto"
    >
      {av1Src && (
        <source type="video/webm; codecs=av01.0.05M.08" src={av1Src} />
      )}
      <source type="video/mp4" src={src} />
    </video>
  );
};

export default Video;
