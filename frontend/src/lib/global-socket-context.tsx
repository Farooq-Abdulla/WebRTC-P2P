import { ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "./socket-context";

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    useEffect(() => {
        const newSocket = io('http://localhost:8080')
        setSocket(newSocket)
        console.log("Socket connected in provider")

        newSocket.on("connect", () => {
            console.log("Socket connected event")
        })

        return () => {
            newSocket.disconnect()
        }

    }, [])
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

