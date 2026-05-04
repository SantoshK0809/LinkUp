import { useEffect, useRef } from "react";

const RemoteVideo = ({ stream, userName }) => {
  const ref = useRef();

  //   useEffect(() => {
  //     console.log("Assigning stream to video", stream);
  //     if (ref.current && stream) {
  //       ref.current.srcObject = stream;
  //     }
  //   }, [stream]);

  useEffect(() => {
    if (!ref.current || !stream) return;

    ref.current.srcObject = null; // 🔥 reset
    ref.current.srcObject = stream;

    ref.current.onloadedmetadata = () => {
      ref.current.play().catch(() => {});
    };
  }, [stream]);

  return (
    <>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {/* <div className="absolute bottom-1 left-1 text-[10px] bg-black/60 px-2 py-0.5 rounded">
        {userName || "User"}
      </div> */}
    </>
  );
};

export default RemoteVideo;
