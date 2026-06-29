import React, { useEffect, useState, useRef, useCallback } from "react";

export default function Message({
    type = "info",
    message,
    onClose,
    duration = 4000,
}) {
    const [messages, setMessages] = useState([]);
    const timersRef = useRef({});
    const onCloseRef = useRef(onClose);

    useEffect(() => {        
        onCloseRef.current = onClose;
    }, [onClose]);

    const removeMessage = useCallback((id) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === id
                    ? { ...msg, isClosing: true }
                    : msg
            )
        );

        setTimeout(() => {
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== id)
            );

            if (timersRef.current[id]) {
                clearTimeout(timersRef.current[id]);
                delete timersRef.current[id];
            }
        }, 400); // CSS animation duration bilan bir xil bo‘lsin
    }, []);

    useEffect(() => {
        if (!message) return;


        const id =
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;

        setMessages((prev) => [
            ...prev,
            {
                id,
                type,
                message,
                isClosing: false,
            },
        ]);

        // Parent componentdagi message state ni tozalash
        if (onCloseRef.current) {
            onCloseRef.current();
        }

        timersRef.current[id] = setTimeout(() => {            
            removeMessage(id);
        }, duration);
    }, [message, type, duration, removeMessage]);

    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach((timer) =>
                clearTimeout(timer)
            );
        };
    }, []);

    return (
        <div className="message-container">
            {messages.map((item) => (
                <div
                    key={item.id}
                    className={`message message-${item.type} ${
                        item.isClosing ? "closing" : ""
                    }`}
                >
                    <div className="message-content">
                        <div className="message-icon">
                            {item.type === "success" && "✅"}
                            {item.type === "error" && "❌"}
                            {item.type === "info" && "ℹ️"}
                            {item.type === "warning" && "⚠️"}
                        </div>

                        <div className="message-text">
                            {item.message}
                        </div>

                        <button
                            type="button"
                            className="message-close"
                            onClick={() => removeMessage(item.id)}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line
                                    x1="18"
                                    y1="6"
                                    x2="6"
                                    y2="18"
                                />
                                <line
                                    x1="6"
                                    y1="6"
                                    x2="18"
                                    y2="18"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}