import { useEffect } from "react"
import { useSocket } from "../lib/global-socket-context"


export default function Receiver() {
    const socket = useSocket()
    useEffect(() => {
        if (!socket) return
        socket.on('connect', () => {
            console.log("Receiver connected to WSS")
            socket.emit("identify-as-receiver", socket)
        })
    }, [socket])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function formConnection() {
        if (!socket) {
            alert("Socket not found")
            return
        }
        const pc = new RTCPeerConnection()
        socket.on("create-offer", async (message) => {
            await pc.setRemoteDescription(message)
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit("create-answer", answer)
        })
    }
    return (
        <p>Receiver</p>
    )
}