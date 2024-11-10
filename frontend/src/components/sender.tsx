import { useEffect } from "react"
import { useSocket } from "../lib/global-socket-context"

export default function Sender() {
    const socket = useSocket()
    useEffect(() => {
        if (!socket) return
        socket.on('connect', () => {
            console.log("Sender connected to WSS")
            socket.emit("identify-as-sender", socket)
        })
    }, [socket])
    async function initiateConnection() {
        if (!socket) {
            alert("socket not found")
            return
        }

        const pc = new RTCPeerConnection()
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit("create-offer", offer)

        socket.on("create-answer", async (message) => {
            await pc.setRemoteDescription(message)
        })

    }
    return (
        <button onClick={initiateConnection}>Sender</button>
    )
}