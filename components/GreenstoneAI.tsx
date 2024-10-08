import * as React from "react"
import { useState, useEffect, useRef, CSSProperties } from "react"

// ... existing code ...
const logoSrc = "/greenstone-logo.png"; // Added logo source from public folder
// ... existing code ...

const welcomeMessages = [
    "Hello! How can I assist you today?",
    "Welcome to Greenstone! What can I help you with?",
    "Hi there! Feel free to ask me anything about our services.",
]

const fallbackResponse =
    "I'm not sure how to answer that, but I'm here to help! Can you rephrase your question or ask something else?"

interface Message {
    user: string
    bot: string
    link?: string
    image?: string
}

export default function GreenstoneAI() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false) // Manage the visibility of the chat window
    const chatContainerRef = useRef<HTMLDivElement>(null)

    // State to determine if the screen width is mobile size
    const [isMobile, setIsMobile] = useState(false)

    // Set up event listener for resizing window to determine if it's mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 390)
        }

        // Initial check
        handleResize()

        // Listen for resize events
        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Disable/Enable page scrolling when the chatbot is toggled
    useEffect(() => {
        if (isChatOpen) {
            document.body.style.overflow = "hidden" // Disable page scrolling
        } else {
            document.body.style.overflow = "auto" // Enable page scrolling
        }
    }, [isChatOpen])

    useEffect(() => {
        const randomWelcomeMessage =
            welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
        setMessages([{ user: "", bot: randomWelcomeMessage }])
    }, [])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight
        }
    }, [messages])

    // Inject keyframes into the document head (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const styleSheet = document.createElement("style")
            styleSheet.type = "text/css"
            styleSheet.innerText = bounceKeyframes
            document.head.appendChild(styleSheet)
        }
    }, [])

    const toggleChat = () => setIsChatOpen((prev) => !prev)

    const sendMessage = async () => {
        if (input.trim() === "") return

        const newMessage: Message = { user: input, bot: "" }
        setMessages((prevMessages) => [...prevMessages, newMessage])
        setIsTyping(true)
        setIsLoading(true)
        setInput("")

        try {
            const apiUrl =
                "https://greenstone-chatbot-framer.vercel.app/api/chat" // Ensure the API URL is correct and accessible
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
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
                        ? {
                              ...msg,
                              bot: botResponse,
                              link: data.link,
                              image: data.image,
                          }
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
        <div>
            {/* Chatbot Icon: Displayed when the chat window is not open */}
            {!isChatOpen && (
                <div style={iconContainerStyle} onClick={toggleChat}>
                    <div style={animatedChatIconStyle}>
                        <img src={logoSrc} alt="Greenstone Logo" style={iconImageStyle} />
                    </div>
                    <span style={helpTextStyle}>Chat Us?</span>
                </div>
            )}

            {/* Overlay: Displayed when chat window is open */}
            {isChatOpen && (
                <div style={overlayStyle} onClick={toggleChat}></div>
            )}

            {/* Chat Container: Displayed when the chat window is open */}
            {isChatOpen && (
                <div style={isMobile ? mobileContainerStyle : containerStyle}>
                    {/* Header Section */}
                    <div style={headerContainerStyle}>
                        {/* Image at the top of the chatbot */}
                        <img src={logoSrc} alt="Greenstone Logo" style={headerImageStyle} />
                        <h2 style={headerStyle}>Greenstone Chatbot</h2>
                        {/* Close Button to hide the chat window */}
                        <button style={closeButtonStyle} onClick={toggleChat}>
                            ✕
                        </button>
                    </div>

                    {/* Chat Messages Section */}
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
                                        <a
                                            href={msg.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
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

                    {/* Input Section */}
                    <div style={inputContainerStyle}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={inputStyle}
                            placeholder="Type a message..."
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            style={buttonStyle}
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Style for the container holding the icon and text
const iconContainerStyle: CSSProperties = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    zIndex: 20,
}

// Animation for bouncing
const animatedChatIconStyle: CSSProperties = {
    width: "50px", // Adjusted size for the chatbot icon
    height: "50px", // Adjusted size for the chatbot icon
    background: "#0ACF83",
    borderRadius: "50%",
    border: "1px solid green",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    animation: "bounce 2s infinite ease-in-out", // Apply the bounce animation
}

// Keyframes for bounce animation
const bounceKeyframes = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`

// Style definitions for other components
const iconImageStyle: CSSProperties = {
    width: "80%",
    height: "80%",
    borderRadius: "50%",
    overflow: "hidden",
}

const helpTextStyle: CSSProperties = {
    marginLeft: "10px",
    fontSize: "16px",
    color: "#0ACF83",
    fontWeight: "bold",
}

// Remaining styles...
const headerImageStyle: CSSProperties = {
    width: "40px",
    height: "40px",
    marginRight: "10px",
    marginLeft: "5px",
    borderRadius: "50%",
    overflow: "hidden",
}

const overlayStyle: CSSProperties = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 15,
}

const containerStyle: CSSProperties = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "400px",
    height: "600px",
    background: "#1C1C1E",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    zIndex: 20,
}

const mobileContainerStyle: CSSProperties = {
    position: "fixed",
    bottom: "0",
    right: "0",
    width: "100%",
    height: "100vh",
    background: "#1C1C1E",
    borderRadius: "0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    zIndex: 20,
}

const headerContainerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "6px",
    background: "#0ACF83",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    zIndex: 30,
}

const headerStyle: CSSProperties = {
    color: "#000000",
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
    marginLeft: "10px",
}

const closeButtonStyle: CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#000000",
    cursor: "pointer",
    marginLeft: "auto",
}

const chatContainerStyle: CSSProperties = {
    width: "100%",
    height: "calc(100% - 60px)",
    overflowY: "auto",
    padding: "20px",
    flex: 1,
    zIndex: 30,
}

const messageStyle: CSSProperties = {
    marginBottom: "15px",
}

const userMessageStyle: CSSProperties = {
    backgroundColor: "#0ACF83",
    color: "#000000",
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
    padding: "10px",
    borderTop: "1px solid #4A4A4A",
    background: "#2C2C2E",
    zIndex: 30,
}

const inputStyle: CSSProperties = {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    background: "#f1f3f4",
    marginRight: "10px",
}

const buttonStyle: CSSProperties = {
    padding: "10px 20px",
    background: "#3dc270",
    border: "none",
    color: "black",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
}

const linkStyle: CSSProperties = {
    marginTop: "10px",
    color: "#0ACF83",
}
