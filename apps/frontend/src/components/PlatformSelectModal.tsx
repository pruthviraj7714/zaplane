import { MessageSquare, Send, Server, X } from "lucide-react";
import Modal from "@/components/Modal";

interface PlatformSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (platform: "TELEGRAM" | "RESEND" | "HTTP_REQUEST") => void;
}

// BUG FIX: defined outside EditWorkflowPage so it is never re-created on every
// parent render, which previously caused the modal to unmount/remount while open.
export function PlatformSelectModal({
  isOpen,
  onClose,
  onSelect,
}: PlatformSelectModalProps) {
  const options = [
    {
      platform: "TELEGRAM" as const,
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      label: "Telegram",
      description: "Send messages to Telegram",
    },
    {
      platform: "RESEND" as const,
      icon: <Server className="w-6 h-6 text-orange-500" />,
      label: "Resend",
      description: "Send emails via Resend",
    },
    {
      platform: "HTTP_REQUEST" as const,
      icon: <Send className="w-6 h-6 text-purple-500" />,
      label: "HTTP",
      description: "Send HTTP requests to any endpoint",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Select Action Platform
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {options.map(({ platform, icon, label, description }) => (
            <button
              key={platform}
              onClick={() => onSelect(platform)}
              className="w-full flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {icon}
              <div className="text-left">
                <div className="font-medium text-foreground">{label}</div>
                <div className="text-sm text-muted-foreground">
                  {description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
