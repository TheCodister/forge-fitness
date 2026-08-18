"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ConversationList } from "./conversation-list";

interface MobileSidebarProps {
  activeId?: string;
}

export function MobileSidebar({ activeId }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-zinc-200" />
        }
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open conversations</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-zinc-900 border-white/10 p-4">
        <SheetHeader>
          <SheetTitle className="text-zinc-200">Conversations</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ConversationList activeId={activeId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
