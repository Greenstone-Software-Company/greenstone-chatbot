import * as React from "react"
import { useState, useEffect, useRef, CSSProperties } from "react"

const greenstoneLogo = "/greenstone-logo.png" // Make sure to add this image to your public folder

const welcomeMessages = [
    "Hello! How can I assist you today?",
    "Welcome to Greenstone! What can I help you with?",
    "Hi there! Feel free to ask me anything about our services.",
]

const fallbackResponse = "I'm not sure how to answer that, but I'm here to help! Can you rephrase your question or ask something else?"

interface Message {
  user: string;
  bot: string;
  link?: string;
  image?: string;
}

export default function GreenstoneAI() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const randomWelcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
        setMessages([{ user: "", bot: randomWelcomeMessage }])
    }, [])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async () => {
        if (input.trim() === "") return

        const newMessage: Message = { user: input, bot: "" }
        setMessages((prevMessages) => [...prevMessages, newMessage])
        setIsTyping(true)
        setIsLoading(true)
        setInput("")

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/chat'
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            const botResponse = data.response || fallbackResponse

            setMessages((prev) =>
                prev.map((msg, index) =>
                    index === prev.length - 1
                        ? { ...msg, bot: botResponse, link: data.link, image: data.image }
                        : msg
                )
            )
        } catch (error) {
            console.error("Error fetching chatbot response:", error)
            setMessages((prev) =>
                prev.map((msg, index) =>
                    index === prev.length - 1
                        ? { ...msg, bot: "Error getting response from server." }
                        : msg
                )
            )
        }

        setIsLoading(false)
        setIsTyping(false)
    }

    return (
        <div style={containerStyle}>
            <div style={headerContainerStyle}>
                <img src={greenstoneLogo} alt="Greenstone Logo" style={logoStyle} />
                <h2 style={headerStyle}>Greenstone Chatbot</h2>
            </div>

            <div style={chatContainerStyle} ref={chatContainerRef}>
                {messages.map((msg: Message, index: number) => (
                    <div key={index} style={messageStyle}>
                        {msg.user && (
                            <p style={userMessageStyle}>
                                <strong>You:</strong> {msg.user}
                            </p>
                        )}
                        {msg.bot && (
                            <div style={botMessageContainerStyle}>
                                <div style={botMessageStyle}>
                                    <strong>Bot:</strong> {msg.bot}
                                </div>
                            </div>
                        )}
                        {msg.link && (
                            <p style={linkStyle}>
                                <strong>Link:</strong>{" "}
                                <a href={msg.link} target="_blank" rel="noopener noreferrer">
                                    {msg.link}
                                </a>
                            </p>
                        )}
                        {msg.image && (
                            <div>
                                <strong>Image:</strong>
                                <img
                                    src={msg.image}
                                    alt="Chatbot Response"
                                    style={{
                                        maxWidth: "100%",
                                        border: "1px solid #ddd",
                                        marginTop: "10px",
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div style={typingIndicatorStyle}>
                        <em>Bot is typing...</em>
                    </div>
                )}
            </div>
            <div style={inputContainerStyle}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={inputStyle}
                    placeholder="Type a message..."
                    disabled={isLoading}
                />
                <button onClick={sendMessage} style={buttonStyle} disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    )
}

const containerStyle: CSSProperties = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    backgroundColor: "#1C1C1E",
    color: "#ffffff",
}

const headerContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
}

const logoStyle: CSSProperties = {
    width: "50px",
    height: "50px",
    marginRight: "10px",
}

const headerStyle: CSSProperties = {
    fontSize: "24px",
    fontWeight: "bold",
}

const chatContainerStyle: CSSProperties = {
    width: "100%",
    maxWidth: "600px",
    height: "calc(100vh - 200px)",
    overflowY: "auto",
    border: "1px solid #4A4A4A",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    scrollbarWidth: "thin",
    scrollbarColor: "#0ACF83 #1C1C1E",
}

const messageStyle: CSSProperties = {
    marginBottom: "15px",
}

const userMessageStyle: CSSProperties = {
    backgroundColor: "#0ACF83",
    color: "#ffffff",
    padding: "10px 15px",
    borderRadius: "18px 18px 0 18px",
    maxWidth: "80%",
    alignSelf: "flex-end",
    marginLeft: "auto",
}

const botMessageContainerStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "10px",
}

const botMessageStyle: CSSProperties = {
    backgroundColor: "#2C2C2E",
    color: "#ffffff",
    padding: "10px 15px",
    borderRadius: "18px 18px 18px 0",
    maxWidth: "80%",
}

const typingIndicatorStyle: CSSProperties = {
    color: "#0ACF83",
    fontStyle: "italic",
    marginBottom: "10px",
}

const inputContainerStyle: CSSProperties = {
    display: "flex",
    width: "100%",
    maxWidth: "600px",
    justifyContent: "space-between",
}

const inputStyle: CSSProperties = {
    width: "80%",
    padding: "15px",
    borderRadius: "25px",
    border: "1px solid #4A4A4A",
    backgroundColor: "#2C2C2E",
    color: "#ffffff",
    fontSize: "16px",
}

const buttonStyle: CSSProperties = {
    padding: "15px 25px",
    borderRadius: "25px",
    backgroundColor: "#0ACF83",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
}

const linkStyle: CSSProperties = {
    marginTop: "10px",
    color: "#0ACF83",
}