import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return {
    socket: context.socket,
    isConnected: context.isConnected,
    messages: context.messages,
    roomUsers: context.roomUsers,
    connect: context.connect,
    disconnect: context.disconnect,
    sendMessage: context.sendMessage,
    clearMessages: context.clearMessages,
    wsMessages: context.messages
  }
}

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [roomUsers, setRoomUsers] = useState([])

  const connect = useCallback((roomId) => {
    if (socket) {
      socket.close()
    }


    const ws = new WebSocket(`ws://localhost/api4/ws/room/${roomId}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'message') {
        setMessages(prev => [...prev, data])
      } else if (data.type === 'user_joined') {
        setRoomUsers(prev => [...prev, { username: data.user, user_id: data.user_id }])
      } else if (data.type === 'user_left') {
        setRoomUsers(prev => prev.filter(u => u.user_id !== data.user_id))
      } else if (data.type === 'history') {
        setMessages(data.messages)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    setSocket(ws)
  }, [])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close()
      setSocket(null)
      setIsConnected(false)
      setMessages([])
      setRoomUsers([])
    }
  }, [socket])

  const sendMessage = useCallback((text) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'message',
        text: text
      }))
    }
  }, [socket, isConnected])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{
      socket,
      isConnected,
      messages,
      roomUsers,
      connect,
      disconnect,
      sendMessage,
      clearMessages
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}