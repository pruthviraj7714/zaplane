import { useEffect, useState } from "react";
import Modal from "../Modal";
import { Send, Server, X } from "lucide-react";

interface IHttpRequestActionFormProps {
  isOpen: boolean;
  onClose: () => void;
  actionData: any;
  onSave: (data: any) => void;
}

const HttpRequestActionForm = ({
  isOpen,
  onClose,
  actionData,
  onSave,
}: IHttpRequestActionFormProps) => {
  const [formData, setFormData] = useState({
    url: actionData?.url || "",
    method: actionData?.method || "GET",
    headers: actionData?.headers || "",
    body: actionData?.body || "",
  });

  useEffect(() => {
    if (isOpen && actionData) {
      setFormData({
        url: actionData?.url || "",
        method: actionData?.method || "GET",
        headers: actionData?.headers || "",
        body: actionData?.body || "",
      });
    } else if (isOpen && !actionData) {
      setFormData({
        url: actionData?.to || "",
        method: actionData?.from || "",
        headers: actionData?.subject || "",
        body: actionData?.html || "",
      });
    }
  }, [isOpen, actionData]);

  const handleSave = () => {
    const data = {
      actionPlatform: "HTTP_REQUEST",
      url: formData.url,
      method: formData.method,
      headers: formData.headers,
      body: formData.body,
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-foreground">
              HTTP Request Action
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
              URL
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com"
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Method
            </label>
            <select
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value })
              }
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Headers
            </label>
            <textarea
              value={formData.headers}
              onChange={(e) =>
                setFormData({ ...formData, headers: e.target.value })
              }
              placeholder='{"Content-Type": "application/json"}'
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Body
            </label>
            <textarea
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder='{"name": "John Doe", "age": 30}'
              rows={6}
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground font-mono text-sm resize-none"
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

export default HttpRequestActionForm;
