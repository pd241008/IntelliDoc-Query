"use client";

import { LucideX, LucideZap, LucideSend, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface DocInteractionHubProps {
  doc: { title: string; imageUrl: string; expiryDate: string; id: string };
  onClose: () => void;
}

interface ChatMessage {
  role: "ai" | "user";
  content: string;
  sources?: string[];
}

export default function DocInteractionHub({
  doc,
  onClose,
}: DocInteractionHubProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content:
        "I've processed this document. Would you like me to summarize the clauses or check for specific compliance dates?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userQuery = inputValue.trim();
    setInputValue("");
    
    // Append user message and an empty AI placeholder message
    setMessages((prev) => [
      ...prev, 
      { role: "user", content: userQuery },
      { role: "ai", content: "", sources: [] }
    ]);
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, top_k: 3 }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to fetch AI response");
      }

      setIsTyping(false); // Connection established, streaming starts
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split("\n").filter((line) => line.trim() !== "");
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                const lastMsg = { ...newMessages[lastIdx] };

                if (parsed.type === "sources") {
                  lastMsg.sources = parsed.data;
                } else if (parsed.type === "chunk") {
                  lastMsg.content += parsed.data;
                }
                
                newMessages[lastIdx] = lastMsg;
                return newMessages;
              });
            } catch (e) {
              console.error("Error parsing NDJSON line:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        newMessages[lastIdx] = {
          role: "ai",
          content: "Sorry, I encountered an error communicating with the RAG service.",
        };
        return newMessages;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-8 bg-[#faf9f3]/80 backdrop-blur-xl">
      {/* Main Container */}
      <div className="relative w-full h-full max-w-7xl bg-white border-4px border-black rounded-[40px] shadow-[16px_16px_0px_black] overflow-hidden flex flex-col lg:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-210 p-2 bg-[#ff5a5a] border-2 border-black rounded-full shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <LucideX size={24} strokeWidth={3} />
        </button>

        {/* LEFT: Document Preview Area */}
        <div className="flex-1 bg-[#e1e1e1] border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              {doc.title}
            </h2>
            <div className="px-3 py-1 bg-black text-white text-xs font-black rounded-md">
              ID: {doc.id}
            </div>
          </div>

          <div className="flex-1 border-[3px] border-black bg-white rounded-2xl overflow-auto shadow-[8px_8px_0px_rgba(0,0,0,0.1)] p-4">
            <Image
              src={doc.imageUrl}
              alt="Document"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* RIGHT: AI Context Panel (RAG Interface) */}
        <div className="w-full lg:w-400px flex flex-col bg-[#faf9f3]">
          {/* Metadata/Insights Header */}
          <div className="p-6 border-b-4 border-black flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#ff5c00]">
              <LucideZap size={20} fill="currentColor" />
              <span className="font-black uppercase text-sm tracking-widest">
                AI Insights
              </span>
            </div>

            <div className="p-4 bg-[#ffde59] border-2 border-black rounded-xl shadow-[4px_4px_0px_black]">
              <p className="text-xs font-black uppercase mb-1 opacity-60">
                Calculated Expiry
              </p>
              <p className="text-xl font-black">
                {doc.expiryDate || "ANALYZING..."}
              </p>
            </div>
          </div>

          {/* AI Chat History (The RAG Interaction) */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div
                  className={`p-4 border-2 border-black rounded-2xl max-w-[90%] shadow-[4px_4px_0px_black] ${
                    msg.role === "ai"
                      ? "bg-[#cfe9ff] rounded-tl-none self-start"
                      : "bg-white rounded-tr-none self-end"
                  }`}>
                  <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
                {/* Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="self-start flex flex-col gap-1 mt-1 ml-2 max-w-[90%]">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      Sources Used:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-[#faf9f3] border-2 border-black rounded-md px-2 py-1 shadow-[2px_2px_0px_black] text-[10px] font-bold overflow-hidden text-ellipsis whitespace-nowrap max-w-full hover:whitespace-normal cursor-help"
                          title={source}>
                          "{source.substring(0, 60)}..."
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="p-4 bg-[#cfe9ff] border-2 border-black rounded-2xl rounded-tl-none self-start max-w-[90%] shadow-[4px_4px_0px_black] flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <p className="text-sm font-bold">Analyzing documents...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t-4 border-black bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask IntelliDoc..."
                className="flex-1 border-2 border-black px-4 py-2 rounded-xl font-bold focus:outline-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="p-3 bg-black text-white rounded-xl hover:bg-[#ffde59] hover:text-black transition-colors shadow-[3px_3px_0px_rgba(0,0,0,0.3)] disabled:opacity-50">
                <LucideSend size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
