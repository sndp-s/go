import React, {useRef, useEffect} from "react";


const Room = (props) => {
  const userVideo = useRef()
  const userVideoStream = useRef()
  const partnerVideo = useRef()
  const peerRef = useRef()
  const webSocketRef = useRef()
  
  const openCamera = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const cameras = allDevices.filter((device) => device.kind == "videooutput");

    const constraints = {
      audio: true,
      video: {
        deviceId: cameras[1].deviceId,
      }
    }

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch(err) {
      console.log(err);
    }
  }
  
  useEffect(() => {
    openCamera().then((stream) => {
      userVideo.current.srcObject = stream
      userVideoStream.current = stream
    })


  })

  return (
    <div className="">
      <video autoPlay controls={true} ref={userVideo}></video>
      <video autoPlay controls={true} ref={partnerVideo}></video>
    </div>
  );
};

export default Room;
 