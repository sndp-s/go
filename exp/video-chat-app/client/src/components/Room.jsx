import React, { useRef, useEffect } from "react";

const Room = (props) => {
  const userVideo = useRef();
  const userVideoStream = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const webSocketRef = useRef();

  const openCamera = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const cameras = allDevices.filter((device) => device.kind == "videoinput");

    const constraints = {
      audio: true,
      video: {
        deviceId: cameras[0].deviceId,
      },
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    openCamera().then((stream) => {
      userVideo.current.srcObject = stream;
      userVideoStream.current = stream;

      webSocketRef.current = new WebSocket(
        `ws://localhost:8000/join?roomID=${props.match.params.roomID}`
      );

      webSocketRef.current.addEventListner("open", () => {
        webSocketRef.current.send(JSON.stringify({ join: true }));
      });

      webSocketRef.current.addEventListner("message", async () => {
        const message = JSON.parse(e.data);

        if (message.join) {
          callUser();
        }
        
        if (message.iceCandidate) {
          console.log("Receiving and Adding ICE Candidate")

          try {
            await peerRef.current.addIceCandidate(message.iceCandidate  )
          } catch (err) {
            console.log("Error Receiving ICE Candidate", err)
          }
        }

        if (message.offer) {
          
        }
      }); 
    });
  });

  const callUser = () => {
    console.log("calling other user");
    peerRef.current = createPeer();

    userVideoStream.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, userStream.current);
    });
  };

  const createPeer = () => {
    console.log("Creating Peer Connection");
    const peer = newRTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onnegotiationneeded = handleNegotiationNeeded;
    peer.onicecandidate = handleIceCandidateEvent;
    peer.ontrack = handleTrackEvent;

    return peer;
  };

  const handleNegotiationNeeded = async (e) => {
    console.log("Creating Offer")

    try {
      const myOffer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(myOffer);
      
      webSocketRef.current.send(JSON.stringify({offer: peerRef.current.localDescription}))
    } catch (err) {
      
    }
  };

  const handleIceCandidateEvent = (e) => {
    console.log("Found Ice Candidate");
    if (e.candiate) {
      console.log(e.candiate);
      webSocketRef.current.send(JSON.stringify({ iceCandidate: e.candidate }));
    }
  };

  const handleTrackEvent = (e) => {
    console.log("Received Tracks");
    partnerVideo.current.srcObject = e.streams[0];
  };

  return (
    <div className="">
      <video autoPlay controls={true} ref={userVideo}></video>
      <video autoPlay controls={true} ref={partnerVideo}></video>
    </div>
  );
};

export default Room;
