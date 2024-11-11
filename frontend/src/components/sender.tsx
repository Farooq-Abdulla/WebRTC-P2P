import { useEffect } from "react"
import { useSocket } from "../lib/useSocket"


export default function Sender() {
    const socket = useSocket()
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
        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            socket.emit("create-offer", offer)
            console.log("set this as LocalDescription in sender and sent to reciver ", offer)
        }
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

        const videoElement = document.createElement('video')
        videoElement.srcObject = stream
        videoElement.style.transform = 'scaleX(-1)' // Mirror the stream
        videoElement.play()
        document.body.appendChild(videoElement)

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream)
            console.log(`Added ${track.kind} track to peer connection`)
        })
        // pc.addTrack(stream.getAudioTracks()[0])

    }
    return (
        <div>
            <button onClick={initiateConnection}>Sender</button>
        </div>
    )
}