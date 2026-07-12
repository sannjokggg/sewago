"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
  BellOff,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { playMessageNotification } from "@/lib/notification-sound";
import ConfirmDialog from "@/components/confirm-dialog";

interface Message {
  id: number;
  text: string;
  image_url: string | null;
  sender_id: number;
  sender_name: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: number;
  otherId: number;
  name: string;
  email: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

const avatarColors = [
  "bg-accent text-text-primary",
  "bg-[#60A5FA] text-white",
  "bg-[#A78BFA] text-white",
  "bg-[#F472B6] text-white",
  "bg-[#34D399] text-white",
  "bg-[#FBBF24] text-text-primary",
  "bg-[#F87171] text-white",
  "bg-[#818CF8] text-white",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: "mute" | "block" | "delete" }>({ open: false, type: "mute" });
  const [actionLoading, setActionLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragCounter = useRef(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const messagesLenRef = useRef(0);
  const selectedIdRef = useRef<number | null>(null);

  useEffect(() => { messagesLenRef.current = messages.length; }, [messages.length]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const myId = session?.user ? Number((session.user as { id: string }).id) : 0;

  async function loadConvos() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        return data as Conversation[];
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
    return [];
  }

  async function loadConversationSettings(convId: number) {
    try {
      const res = await fetch(`/api/messages/conversation?conversationId=${convId}`);
      const data = await res.json();
      setMuted(data.muted || false);
      setBlocked(data.blocked || false);
    } catch {
      setMuted(false);
      setBlocked(false);
    }
  }

  async function handleMute() {
    if (!selectedConvo) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/messages/conversation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConvo.id, action: "mute" }),
      });
      const data = await res.json();
      setMuted(data.muted);
    } catch {
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: "mute" });
    }
  }

  async function handleBlock() {
    if (!selectedConvo) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/messages/conversation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConvo.id, action: "block" }),
      });
      const data = await res.json();
      setBlocked(data.blocked);
    } catch {
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: "block" });
    }
  }

  async function handleDelete() {
    if (!selectedConvo) return;
    setActionLoading(true);
    try {
      await fetch("/api/messages/conversation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConvo.id }),
      });
      setConversations((prev) => prev.filter((c) => c.id !== selectedConvo.id));
      setSelectedId(null);
      setMessages([]);
    } catch {
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: "delete" });
    }
  }

  async function loadMessages(convId: number) {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/messages/${convId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (e) {
      console.error("Failed to load messages:", e);
    } finally {
      setLoadingMsgs(false);
    }
  }

  async function handleFirstMessage(receiverId: number) {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, text: "Hi! I'm interested in your listing." }),
      });
      const data = await res.json();
      if (data.conversation_id || data.id) {
        const convos = await loadConvos();
        const newConv = (convos as Conversation[]).find((c) => c.otherId === receiverId);
        if (newConv) {
          setSelectedId(newConv.id);
          setShowMobileList(false);
        }
      }
    } catch (e) {
      console.error("Failed to start conversation:", e);
    }
  }

  useEffect(() => {
    loadConvos().then((convos) => {
      setLoadingConvos(false);
      const userId = searchParams.get("userId");
      if (userId) {
        const existing = (convos as Conversation[]).find((c) => c.otherId === Number(userId));
        if (existing) {
          setSelectedId(existing.id);
          setShowMobileList(false);
        } else {
          handleFirstMessage(Number(userId));
        }
      } else if ((convos as Conversation[]).length > 0) {
        setSelectedId((convos as Conversation[])[0].id);
        setShowMobileList(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedId) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      const currentId = selectedIdRef.current;
      if (!currentId) return;
      try {
        const res = await fetch(`/api/messages/${currentId}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > messagesLenRef.current) {
          const prevLen = messagesLenRef.current;
          setMessages(data);
          messagesLenRef.current = data.length;
          fetch(`/api/messages/${currentId}`, { method: "PATCH" });
          loadConvos();
          const hasNewFromOther = data.slice(prevLen).some((m: Message) => m.sender_id !== myId);
          if (hasNewFromOther) playMessageNotification();
        }
      } catch {
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
      loadConversationSettings(selectedId);
    }
  }, [selectedId]);

  const selectedConvo = conversations.find((c) => c.id === selectedId) || null;

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPreviewImage(data.url);
      }
    } catch (e) {
      console.error("Image upload failed:", e);
    } finally {
      setUploadingImage(false);
    }
  };

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;
      handleImageUpload(file);
    }
  }

  const filteredConvos = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if ((!newMessage.trim() && !previewImage) || !selectedConvo || sending) return;

    setSending(true);
    const text = newMessage;
    const image = previewImage;
    setNewMessage("");
    setPreviewImage(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConvo.id, text, imageUrl: image }),
      });
      const msg = await res.json();
      if (msg.id) {
        setMessages((prev) => [...prev, msg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvo.id
              ? { ...c, lastMessage: text || "[Image]", lastTime: "Just now" }
              : c
          )
        );
      }
    } catch (e) {
      console.error("Send failed:", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 gap-0 overflow-hidden md:rounded-[24px] bg-surface md:shadow-sm" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Conversations List */}
      <div className={`w-full md:w-[340px] lg:w-[360px] flex flex-col min-h-0 border-r border-border-light ${showMobileList ? "flex" : "hidden md:flex"}`}>
        <div className="flex items-center justify-between px-4 py-3.5 md:px-5 md:py-4 lg:px-6 lg:py-5">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary">Messages</h2>
          <button
            onClick={() => router.push("/dashboard/marketplace")}
            className="text-[11px] md:text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Browse listings
          </button>
        </div>

        <div className="px-3 pb-3 md:px-4 md:pb-4 lg:px-5 lg:pb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-full bg-surface-alt py-2.5 pl-10 pr-4 text-sm md:text-base text-text-primary outline-none transition-all placeholder:text-[#B0B0B0] focus:bg-border-light focus:ring-1 focus:ring-gray-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 md:px-3 chat-scrollbar">
          {loadingConvos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-text-muted" />
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-muted">No conversations yet</p>
              <p className="mt-1 text-xs text-[#B0B0B0]">Click Message on any listing to start chatting</p>
            </div>
          ) : (
            filteredConvos.map((convo) => {
              const isActive = selectedId === convo.id;
              return (
                <button
                  key={convo.id}
                  onClick={() => {
                    setSelectedId(convo.id);
                    setShowMobileList(false);
                  }}
                  className={`flex w-full items-center gap-2.5 md:gap-3 rounded-[14px] md:rounded-[16px] px-3 py-3 md:px-4 md:py-3.5 text-left transition-all ${
                    isActive ? "bg-text-primary/5" : "hover:bg-surface-alt"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`flex h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 items-center justify-center rounded-full text-xs md:text-sm font-semibold ${getColor(convo.name)}`}>
                      {getInitials(convo.name)}
                    </div>
                    <div className="absolute -bottom-[3px] -right-[3px] flex h-[22px] w-[22px] md:h-6 md:w-6 items-center justify-center rounded-full bg-accent ring-[2px] ring-surface z-10">
                      <Check size={12} strokeWidth={3} className="text-text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm md:text-base font-semibold text-text-primary truncate">{convo.name}</span>
                      <span className="text-[10px] md:text-xs text-text-muted ml-2 flex-shrink-0">{convo.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-xs md:text-sm truncate ${convo.unread > 0 ? "font-semibold text-text-primary" : "text-text-muted"}`}>
                        {convo.lastMessage}
                      </span>
                      {convo.unread > 0 && (
                        <span className="flex h-4.5 min-w-[18px] md:h-5 md:min-w-5 items-center justify-center rounded-full bg-accent px-1 md:px-1.5 text-[9px] md:text-[10px] font-bold text-text-primary ml-2 flex-shrink-0">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConvo ? (
        <div
          className={`relative flex flex-1 min-h-0 flex-col ${!showMobileList ? "flex" : "hidden md:flex"}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[18px] lg:rounded-[24px] bg-accent/10 backdrop-blur-sm border-2 border-dashed border-accent m-2">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={40} className="text-accent" />
                <p className="text-base lg:text-lg font-semibold text-text-primary">Drop images here</p>
              </div>
            </div>
          )}
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border-light px-3 py-2.5 md:px-5 md:py-3 lg:px-6 lg:py-4">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setShowMobileList(true)}
                className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-text-secondary hover:bg-border-light"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="relative flex-shrink-0">
                <div className={`flex h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full text-xs md:text-sm font-semibold ${getColor(selectedConvo.name)}`}>
                  {getInitials(selectedConvo.name)}
                </div>
                <div className="absolute -bottom-[2px] -right-[2px] flex h-[18px] w-[18px] md:h-5 md:w-5 items-center justify-center rounded-full bg-accent ring-[2px] ring-surface z-10">
                  <Check size={10} strokeWidth={3} className="text-text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-text-primary">{selectedConvo.name}</h3>
                <p className="text-[10px] md:text-xs text-text-muted">{selectedConvo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-border-light hover:text-text-primary"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 md:w-52 rounded-[14px] md:rounded-[16px] border border-border-light bg-surface py-1.5 md:py-2 shadow-lg">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setConfirmDialog({ open: true, type: "mute" });
                      }}
                      className="flex w-full items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base text-text-primary hover:bg-surface-alt transition-colors"
                    >
                      <BellOff size={14} className={muted ? "text-accent" : "text-text-muted"} />
                      {muted ? "Unmute" : "Mute"}
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setConfirmDialog({ open: true, type: "block" });
                      }}
                      className="flex w-full items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base text-text-primary hover:bg-surface-alt transition-colors"
                    >
                      <UserX size={14} className={blocked ? "text-red-500" : "text-text-muted"} />
                      {blocked ? "Unblock" : "Block"}
                    </button>
                    <div className="my-1 border-t border-border-light" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setConfirmDialog({ open: true, type: "delete" });
                      }}
                      className="flex w-full items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 flex flex-col chat-scrollbar">
            {loadingMsgs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-text-muted" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-sm text-text-muted">No messages yet</p>
                <p className="text-xs text-[#B0B0B0]">Send a message to start chatting</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 md:gap-3">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === myId;
                  const showAvatar = i === 0 || messages[i - 1].sender_id !== msg.sender_id;

                  return (
                    <div key={msg.id} className={`flex items-end gap-1.5 md:gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && showAvatar && (
                        <div className={`flex h-6 w-6 md:h-7 md:w-7 flex-shrink-0 items-center justify-center rounded-full text-[8px] md:text-[9px] font-semibold ${getColor(msg.sender_name)}`}>
                          {getInitials(msg.sender_name)}
                        </div>
                      )}
                      {!isMe && !showAvatar && <div className="w-6 md:w-7 flex-shrink-0" />}

                      <div className="max-w-[75%] md:max-w-[65%]">
                        {msg.image_url && (
                          <img
                            src={msg.image_url}
                            alt="Shared image"
                            className="mb-1 max-h-[200px] md:max-h-[280px] rounded-xl md:rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}
                        {msg.text && (
                          <div className={`rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base leading-relaxed ${
                            isMe
                              ? "bg-accent text-text-primary rounded-br-md"
                              : "bg-border-light text-text-primary rounded-bl-md"
                          }`}>
                            {msg.text}
                          </div>
                        )}
                        <div className={`mt-0.5 flex items-center gap-0.5 md:gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] md:text-xs text-[#B0B0B0]">{timeAgo(msg.created_at)}</span>
                          {isMe && (
                            msg.read ? (
                              <CheckCheck size={13} className="text-accent stroke-[2.5]" />
                            ) : (
                              <Check size={13} className="text-[#B0B0B0] stroke-[2.5]" />
                            )
                          )}
                        </div>
                      </div>

                      {isMe && showAvatar && (
                        <div className="flex h-6 w-6 md:h-7 md:w-7 flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-[8px] md:text-[9px] font-semibold text-white">
                          {session?.user?.name?.charAt(0)?.toUpperCase() || "Y"}
                        </div>
                      )}
                      {isMe && !showAvatar && <div className="w-6 md:w-7 flex-shrink-0" />}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border-light px-3 py-2.5 md:px-5 md:py-3 lg:px-6 lg:py-4">
            {previewImage && (
              <div className="mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <img src={previewImage} alt="Preview" className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover" />
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute -right-1.5 -top-1.5 md:-right-2 md:-top-2 flex h-5 w-5 items-center justify-center rounded-full bg-nav-active text-white text-[10px]"
                  >
                    ✕
                  </button>
                </div>
                <span className="text-xs md:text-sm text-text-muted">Ready to send</span>
              </div>
            )}
            <div className="flex items-end gap-2 md:gap-3">
              <div className="flex items-center gap-0.5 md:gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border-light hover:text-text-primary disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border-light hover:text-text-primary disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="flex flex-1 items-end rounded-xl md:rounded-2xl bg-surface-alt px-3 py-2 md:px-4 md:py-2.5 transition-all focus-within:bg-border-light focus-within:ring-1 focus-within:ring-gray-100">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm md:text-base text-text-primary outline-none placeholder:text-[#B0B0B0]"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={(!newMessage.trim() && !previewImage) || sending}
                className={`flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                  (newMessage.trim() || previewImage) && !sending
                    ? "bg-accent text-text-primary shadow-sm hover:shadow-md"
                    : "bg-border-light text-[#B0B0B0]"
                }`}
              >
                {sending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center md:flex">
          <div className="flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-full bg-border-light">
            <Send size={28} className="text-text-muted lg:hidden" />
            <Send size={32} className="text-text-muted hidden lg:block" />
          </div>
          <p className="mt-3 lg:mt-4 text-lg lg:text-xl font-medium text-text-muted">Select a conversation</p>
          <p className="mt-0.5 lg:mt-1 text-sm lg:text-base text-[#B0B0B0]">Click Message on any listing to start chatting</p>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: "mute" })}
        onConfirm={() => {
          if (confirmDialog.type === "mute") handleMute();
          else if (confirmDialog.type === "block") handleBlock();
          else if (confirmDialog.type === "delete") handleDelete();
        }}
        title={
          confirmDialog.type === "mute"
            ? muted ? "Unmute notifications?" : "Mute notifications?"
            : confirmDialog.type === "block"
            ? blocked ? "Unblock this user?" : "Block this user?"
            : "Delete this conversation?"
        }
        description={
          confirmDialog.type === "mute"
            ? muted
              ? "You will start receiving message notifications from this conversation again."
              : "You won't receive message notifications from this conversation."
            : confirmDialog.type === "block"
            ? blocked
              ? "This user will be able to message you again."
              : "This user won't be able to message you anymore. You can unblock them later."
            : "All messages in this conversation will be permanently deleted. This action cannot be undone."
        }
        confirmText={
          confirmDialog.type === "mute"
            ? muted ? "Unmute" : "Mute"
            : confirmDialog.type === "block"
            ? blocked ? "Unblock" : "Block"
            : "Delete"
        }
        cancelText="Cancel"
        variant={confirmDialog.type === "mute" ? "warning" : "danger"}
        loading={actionLoading}
      />
    </div>
  );
}
