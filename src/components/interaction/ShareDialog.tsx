"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface ShareDialogProps {
  url: string;
  title: string;
}

export function ShareDialog({ url, title }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 text-75 hover:text-90 transition-colors"
          aria-label="分享"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享内容</DialogTitle>
          <DialogDescription>
            复制链接分享给朋友
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                复制
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
