import React, { useCallback, useEffect ,useState} from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../context/SocketProvider'
import peer from '../service/peer'

function WebRtc() {
  const socket = useSocket()
  const [remoteSocketId,setremoteSocketId] = useState(null)
  const [myStream,setmyStream] = useState()
  const [remoteStream,setremoteStream] = useState()
  const handleUserJoined = useCallback(({email,id})=>{
    console.log(`Email ${email} joined room`)
    setremoteSocketId(id)
  },[])

  const handleCallUser = useCallback(async()=>{
    const stream = await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    });
    const offer = await peer.getOffer();
    socket.emit("user:call",{to: remoteSocketId,offer})
    setmyStream(stream)
  },[remoteSocketId,socket])

  const handleIncomingCall = useCallback(async ({from,offer})=>{
    setremoteSocketId(from)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    });
    setmyStream(stream)
    console.log('Incoming Call', from,offer)
    const ans = await peer.getAnswer(offer)
    socket.emit('call:accepted',{to: from,ans});
  },[socket])

  const sendStream = useCallback(()=>{
    for (const track of myStream.getTracks()){
      peer.peer.addTrack(track,myStream)
    }
  },[myStream])

  const handleCallAccepted = useCallback(({from,ans})=>{
    peer.setLocalDescription(ans);
    console.log("Call Accepted")
    sendStream()
  },[sendStream])

  const handleFinalNego = useCallback(async({ans})=>{
    await peer.setLocalDescription(ans)
  },[])

  const handleNegotiationNeeded = useCallback(async()=>{
      const offer = await peer.getOffer();
      socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
},[remoteSocketId, socket])

const handleIncomingNego = useCallback(async({from,offer})=>{
const ans = await peer.getAnswer(offer)
socket.emit('peer:nego:done',{to:from,ans})
},[socket])


  useEffect(()=>{
    peer.peer.addEventListener('negotiationneeded',handleNegotiationNeeded);
    return()=> peer.peer.removeEventListener('negotiationneeded',handleNegotiationNeeded);
  },[handleNegotiationNeeded])

  useEffect(()=>{
    peer.peer.addEventListener('track',async ev=>{
      const Streamss = ev.streams
      setremoteStream(Streamss[0])
    })
  },[])

  useEffect(()=>{
    socket.on("user:joined",handleUserJoined)
    socket.on('incoming:call',handleIncomingCall)
    socket.on('call:accepted',handleCallAccepted)
    socket.on('peer:nego:needed',handleIncomingNego)
    socket.on('peer:nego:final',handleFinalNego)

    return ()=>{
      socket.off('user:joined',handleUserJoined)
      socket.off('incoming:call',handleIncomingCall)
      socket.off('call:accepted',handleCallAccepted)
      socket.off('peer:nego:needed',handleIncomingNego)
      socket.off('peer:nego:final',handleFinalNego)
    }; 
  },[socket,handleUserJoined,handleCallAccepted,handleIncomingCall,handleIncomingNego,handleFinalNego])
  return (
    <div>
      <h1>Web RTC Page</h1>
      <h4>{remoteSocketId ? " Connected Successfully" : "No One in the Room"}</h4>
      {myStream && <button onClick={sendStream}>Send Stream</button>}
      {
        remoteSocketId && <button onClick={handleCallUser}>Call</button>
      }
      {
        myStream && (
          <>
          <h1>My stream</h1>
          <ReactPlayer muted playing height={"200px"} width={"300px"}  url={myStream}/>
          </>
        )
      }
      {
        remoteStream && (
          <>
          <h1>Remote stream</h1>
          <ReactPlayer muted playing height={"400px"} width={"600px"}  url={remoteStream}/>
          </>
        )
      }
    </div>
  )
}

export default WebRtc
