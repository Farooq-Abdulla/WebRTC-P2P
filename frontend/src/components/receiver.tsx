import { useEffect, useRef } from "react"
import { Socket } from "socket.io-client"
import { useSocket } from "../lib/useSocket"



export default function Receiver() {
    const socket = useSocket()
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    useEffect(() => {
        if (!socket) return
        socket.on('connect', () => {
            console.log("Receiver connected to WSS")
            socket.emit("identify-as-receiver")
        })

        InitiateConnection(socket)

    }, [socket])

    async function InitiateConnection(socket: Socket) {
        if (!socket) {
            alert("Socket not found")
            return
        }
        const pc = new RTCPeerConnection()

        mediaStreamRef.current = new MediaStream()
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStreamRef.current
        }
        socket.on("create-offer", async (message: RTCSessionDescription) => {
            await pc.setRemoteDescription(message)
            console.log("Reached reciever create offer event, and set the romote description in reciever", message)
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit("create-answer", answer)
            console.log("Sent this answer to sender and set it as LocalDescription of receiver", answer)
        })
        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit("create-offer", offer)

        }
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("forward-ice-candidate", event.candidate)
            }
        }
        pc.ontrack = (event) => {
            console.log("Track received:", event.track.kind)
            if (mediaStreamRef.current) {
                mediaStreamRef.current.addTrack(event.track)
                console.log(`Added ${event.track.kind} track to MediaStream`)
            } else {
                console.error("Video element reference not found")
            }
        }
        socket.on("forward-ice-candidate", async (candidate: RTCIceCandidate) => {
            pc.addIceCandidate(candidate)
            console.log("Added ice candidate in receiver", candidate)
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
            stream.getTracks().forEach(track => {
                pc.addTrack(track)
            })
        })

    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <p>Receiver</p>
            <div className="relative" style={{ width: '640px', height: '480px' }}>
                <video
                    ref={videoRef}
                    width="100%"
                    height="100%"
                    autoPlay
                    controls
                    playsInline
                    style={{
                        transform: 'scaleX(-1)',
                        background: '#000',
                        objectFit: 'contain'
                    }}
                />

            </div>
        </div>
    )
}