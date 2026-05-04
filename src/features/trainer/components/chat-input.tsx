"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex gap-2 items-end border-t border-white/10 pt-4">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask your trainer anything..."
        disabled={disabled}
        rows={2}
        className="flex-1 resize-none border-white/10 bg-white/5 text-sm placeholder:text-zinc-500"
        autoFocus
      />
      <Button
        onClick={submit}
        disabled={disabled || !value.trim()}
        size="icon"
        className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
