import { MessageSquare, X } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "../Modal";

interface ITelegramActionFormProps {
  isOpen: boolean;
  onClose: () => void;
  actionData: any;
  onSave: (data: any) => void;
}

const TelegramActionForm = ({
  isOpen,
  onClose,
  actionData,
  onSave,
}: ITelegramActionFormProps) => {
  const [formData, setFormData] = useState({
    chatId: "",
    message: "",
  });

  useEffect(() => {
    if (isOpen && actionData) {
      setFormData({
        chatId: actionData?.chatId || "",
        message: actionData?.message || "",
      });
    } else if (isOpen && !actionData) {
      setFormData({
        chatId: "",
        message: "",
      });
    }
  }, [isOpen, actionData]);

  const handleSave = () => {
    const data = {
      actionPlatform: "TELEGRAM",
      chatId: formData.chatId,
      message: formData.message,
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-foreground">
              Telegram Action
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chat ID
            </label>
            <input
              type="text"
              value={formData.chatId}
              onChange={(e) =>
                setFormData({ ...formData, chatId: e.target.value })
              }
              placeholder="1234567890"
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter the Telegram chat ID or channel ID
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Enter your message here..."
              rows={4}
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Action
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TelegramActionForm;