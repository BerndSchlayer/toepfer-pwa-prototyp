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

interface ChatPageProps {
  onKeyboardVisibilityChange?: (visible: boolean) => void;
}

export default function ChatPage({
  onKeyboardVisibilityChange,
}: ChatPageProps) {
  const { t } = useTranslation("app");
  const [activeChat, setActiveChat] = useState<ChatType>("supervisor");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {
        /* Autoplay might be blocked; ignore */
      });
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
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
      setMessages((prev) => [...prev, newMessage]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(t("chat.cameraNotSupported"));
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      setIsCameraModalOpen(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert(t("chat.cameraError"));
    }
  };

  const closeCameraModal = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setIsCameraModalOpen(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    const imageUrl = canvas.toDataURL("image/jpeg");
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: "",
      imageUrl,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    closeCameraModal();
  };

  const handleInputFocus = () => {
    onKeyboardVisibilityChange?.(true);
  };

  const handleInputBlur = () => {
    onKeyboardVisibilityChange?.(false);
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
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
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
      {isCameraModalOpen && (
        <div className="camera-modal" role="dialog" aria-modal="true">
          <div className="camera-modal-content">
            <h2>{t("chat.cameraModalTitle")}</h2>
            <p>{t("chat.cameraModalDescription")}</p>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              className="camera-video"
            />
            <div className="camera-modal-actions">
              <button type="button" onClick={closeCameraModal}>
                {t("chat.cameraCancel")}
              </button>
              <button type="button" onClick={handleCapturePhoto}>
                {t("chat.cameraCapture")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
