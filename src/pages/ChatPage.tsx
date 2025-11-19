import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, Image, Camera, User, Users } from "lucide-react";
import "./CommonPage.css";
import "./ChatPage.css";

interface Message {
  id: string;
  sender: "user" | "other";
  senderName?: string;
  text: string;
  imageUrl?: string;
  timestamp: Date;
}

type ChatType = "supervisor" | "team";

export default function ChatPage() {
  const { t } = useTranslation("app");
  const [activeChat, setActiveChat] = useState<ChatType>("supervisor");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock-Daten für Demo-Zwecke
  useEffect(() => {
    if (activeChat === "supervisor") {
      setMessages([
        {
          id: "1",
          sender: "other",
          senderName: "Hr. Schmidt",
          text: "Guten Morgen! Wie kann ich Ihnen helfen?",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "2",
          sender: "user",
          text: "Ich hätte eine Frage zum Dienstplan nächste Woche.",
          timestamp: new Date(Date.now() - 3000000),
        },
      ]);
    } else {
      setMessages([
        {
          id: "1",
          sender: "other",
          senderName: "Maria",
          text: "Hallo Team! Wer kann morgen die Schicht übernehmen?",
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: "2",
          sender: "other",
          senderName: "Thomas",
          text: "Ich könnte ab 14 Uhr einspringen.",
          timestamp: new Date(Date.now() - 5400000),
        },
      ]);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll zu letzter Nachricht wenn Tastatur eingeblendet wird (iOS)
  useEffect(() => {
    const handleResize = () => {
      // Timeout damit die Tastatur-Animation abgeschlossen ist
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    // visualViewport API für bessere iOS Keyboard Detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: message,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simuliere Antwort nach 2 Sekunden
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: "other",
        senderName:
          activeChat === "supervisor" ? "Hr. Schmidt" : "Team Mitglied",
        text: t("chat.autoResponse"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simuliere Upload
    const reader = new FileReader();
    reader.onload = () => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: "",
        imageUrl: reader.result as string,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    try {
      // Prüfe ob getUserMedia verfügbar ist
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(t("chat.cameraNotSupported"));
        return;
      }

      // Starte Kamera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Erstelle Video-Element für Vorschau
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Warte bis Video bereit ist
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Erstelle Canvas und mache Screenshot
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      // Stoppe Kamera
      stream.getTracks().forEach((track) => track.stop());

      // Konvertiere zu Bild
      const imageUrl = canvas.toDataURL("image/jpeg");

      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: "",
        imageUrl,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error("Camera error:", error);
      alert(t("chat.cameraError"));
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="page-container chat-page-container">
      <header className="page-header">
        <h1 className="page-title">{t("chat.title")}</h1>
      </header>

      <div className="chat-container">
        {/* Chat Type Tabs */}
        <div className="chat-tabs">
          <button
            type="button"
            className={`chat-tab ${
              activeChat === "supervisor" ? "active" : ""
            }`}
            onClick={() => setActiveChat("supervisor")}
          >
            <User size={18} />
            <span>{t("chat.supervisor")}</span>
          </button>
          <button
            type="button"
            className={`chat-tab ${activeChat === "team" ? "active" : ""}`}
            onClick={() => setActiveChat("team")}
          >
            <Users size={18} />
            <span>{t("chat.team")}</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender === "user" ? "message-user" : "message-other"
              }`}
            >
              {msg.sender === "other" && msg.senderName && (
                <div className="message-sender">{msg.senderName}</div>
              )}
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Uploaded"
                  className="message-image"
                />
              )}
              {msg.text && <div className="message-text">{msg.text}</div>}
              <div className="message-time">{formatTime(msg.timestamp)}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <button
            type="button"
            className="chat-action-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title={t("chat.uploadImage")}
          >
            <Image size={20} />
          </button>
          <button
            type="button"
            className="chat-action-button"
            onClick={handleCameraCapture}
            disabled={isUploading}
            title={t("chat.takePhoto")}
          >
            <Camera size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("chat.messagePlaceholder")}
            className="chat-input"
            disabled={isUploading}
          />
          <button
            type="button"
            className="chat-send-button"
            onClick={handleSendMessage}
            disabled={!message.trim() || isUploading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
