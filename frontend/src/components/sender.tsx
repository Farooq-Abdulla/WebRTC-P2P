import { useEffect, useRef } from "react"
import { useSocket } from "../lib/useSocket"


export default function Sender() {
    const socket = useSocket()
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    useEffect(() => {
        if (!socket) return
        socket.on('connect', () => {
            console.log("Sender connected to WSS")
            socket.emit("identify-as-sender")
        })
    }, [socket])
    async function initiateConnection() {
        if (!socket) {
            alert("socket not found")
            return
        }


        const pc = new RTCPeerConnection()
        mediaStreamRef.current = new MediaStream()
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStreamRef.current
        }
        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit("create-offer", offer)
            console.log("set this as LocalDescription in sender and sent to reciver ", offer)
        }
        socket.on("create-offer", async (message: RTCSessionDescription) => {
            await pc.setRemoteDescription(message)
            // console.log("Reached reciever create offer event, and set the romote description in reciever", message)
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit("create-answer", answer)
            // console.log("Sent this answer to sender and set it as LocalDescription of receiver", answer)
        })

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("forward-ice-candidate", event.candidate)
            }
        }

        socket.on("create-answer", async (message: RTCSessionDescription) => {
            await pc.setRemoteDescription(message)
            console.log("sender comp is setting this as remote description", message)
        })

        socket.on("forward-ice-candidate", (candidate: RTCIceCandidate) => {
            pc.addIceCandidate(candidate)
            console.log("Added ice candidate in sender", candidate)
        })

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        console.log("logging stream ", stream)

        // const videoElement = document.createElement('video')
        // videoElement.srcObject = stream
        // videoElement.style.transform = 'scaleX(-1)' // Mirror the stream
        // videoElement.play()
        // document.body.appendChild(videoElement)

        stream.getTracks().forEach(track => {
            pc.addTrack(track)
            console.log(`Added ${track.kind} track to peer connection`)
        })
        // pc.addTrack(stream.getAudioTracks()[0])
        pc.ontrack = (event) => {
            console.log("Track received:", event.track.kind)
            if (mediaStreamRef.current) {
                mediaStreamRef.current.addTrack(event.track)
                console.log(`Added ${event.track.kind} track to MediaStream`)
            } else {
                console.error("Video element reference not found")
            }
        }

    }
    return (
        <div>
            <button onClick={initiateConnection}>Sender</button>
            <div className="relative" style={{ width: '640px', height: '480px' }}>
                <video
                    ref={videoRef}
                    width="100%"
                    height="100%"
                    autoPlay
                    controls
                    playsInline
                    style={{
                        // transform: 'scaleX(-1)',
                        background: '#000',
                        objectFit: 'contain'
                    }}
                />
            </div>
        </div>
    )
}