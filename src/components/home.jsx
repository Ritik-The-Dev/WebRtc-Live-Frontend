import React, { useCallback, useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { useSocket } from '../context/SocketProvider'

function Home() {
    const [email,setEmail] = useState('')
    const [roomid,setroomid] = useState('')
    const Navigate = useNavigate()
    const socket = useSocket()

    const handleSubmit = useCallback((e)=>{
        e.preventDefault()
        socket.emit('room:join',{email,roomid})
    },[email,roomid,socket])

    const handleJoinRoom = useCallback((data)=>{
      const {email,roomid} = data
      Navigate(`/room/${roomid}`)
    },[])

    useEffect(()=>{
      socket.on('room:join',handleJoinRoom);
      return()=>{
        socket.off('room:join', handleJoinRoom)
      }
    },[])

  return (
    <div>
      <h1>Home Screen</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <label htmlFor="room">Room Number</label>
        <input type="text" id="room" value={roomid} onChange={(e)=>setroomid(e.target.value)}/>
        <br />
        <br /><br />
        <button>Join</button>
      </form>
    </div>
  )
}

export default Home
