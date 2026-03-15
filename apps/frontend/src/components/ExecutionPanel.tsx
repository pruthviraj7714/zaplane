import React, { useState } from "react";
import {
  X,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  Monitor,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ILog {
  message: string | object;
  nodeId: string;
  type: "NODE_EXECUTED" | "TRIGGER_EXECUTED" | "ERROR" | "COMPLETED";
  timestamp?: string;
}

interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isExecuting: boolean;
  logs: ILog[];
  workflowTitle: string;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  isOpen,
  onClose,
  isExecuting,
  logs,
  workflowTitle,
}) => {
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const getStatusIcon = () => {
    if (isExecuting) {
      return <Activity className="w-5 h-5 text-chart-2 animate-pulse" />;
    }

    const hasErrors = logs.some((log) => log.type === "ERROR");
    const isCompleted = logs.some((log) => log.type === "COMPLETED");

    if (hasErrors) {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-chart-3" />;
    }
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isExecuting) return "Executing...";

    if (logs.some((log) => log.type === "COMPLETED")) {
      return "Completed";
    }

    if (logs.some((log) => log.type === "ERROR")) {
      return "Failed";
    }

    return "Ready";
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "TRIGGER_EXECUTED":
        return <Zap className="w-4 h-4 text-primary" />;
      case "NODE_EXECUTED":
        return <CheckCircle className="w-4 h-4 text-chart-3" />;
      case "ERROR":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-accent" />;
      default:
        return <Activity className="w-4 h-4 text-chart-2" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "TRIGGER_EXECUTED":
        return "border-primary/20 bg-primary/5 hover:bg-primary/10";
      case "NODE_EXECUTED":
        return "border-chart-3/20 bg-chart-3/5 hover:bg-chart-3/10";
      case "ERROR":
        return "border-destructive/20 bg-destructive/5 hover:bg-destructive/10";
      case "COMPLETED":
        return "border-accent/20 bg-accent/5 hover:bg-accent/10";
      default:
        return "border-chart-2/20 bg-chart-2/5 hover:bg-chart-2/10";
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return new Date().toLocaleTimeString();
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl border-l border-border/40 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border/40 bg-gradient-to-r from-background/20 to-card/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            {getStatusIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-card-foreground">
                Execution Panel
              </h2>
              {isExecuting && (
                <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 px-2 py-0.5 text-xs animate-pulse">
                  <Monitor className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{workflowTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-all duration-300 p-2 rounded-xl hover:bg-muted/50 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 border-b border-border/40 bg-gradient-to-br from-muted/5 to-background/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-card-foreground">
              Status:
            </span>
            <Badge
              className={`text-sm font-medium ${
                isExecuting
                  ? "bg-chart-2/20 text-chart-2 border-chart-2/30"
                  : logs.some((log) => log.type === "ERROR")
                    ? "bg-destructive/20 text-destructive border-destructive/30"
                    : logs.some((log) => log.type === "COMPLETED")
                      ? "bg-chart-3/20 text-chart-3 border-chart-3/30"
                      : "bg-muted/20 text-muted-foreground border-muted/30"
              }`}
            >
              {getStatusText()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              {logs.length} events
            </span>
          </div>
        </div>

        {isExecuting && (
          <div className="bg-gradient-to-r from-chart-2/10 to-chart-2/5 rounded-xl p-4 border border-chart-2/20 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-3">
              <Activity className="w-4 h-4 text-chart-2 animate-pulse" />
              <span className="text-sm font-medium text-chart-2">
                Processing workflow...
              </span>
            </div>
            <div className="w-full bg-background/50 rounded-full h-2 backdrop-blur-sm border border-border/20">
              <div
                className="bg-gradient-to-r from-chart-2 to-accent h-2 rounded-full animate-pulse transition-all duration-1000"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center mb-6 border border-border/30">
              <Play className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              No execution logs yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Execute the workflow to see real-time logs and monitoring data
              here
            </p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`border rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] ${getLogColor(log.type)}`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slideInRight 0.5s ease-out forwards",
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-background/20 to-background/10 border border-border/30 flex items-center justify-center">
                    {getLogIcon(log.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-card-foreground capitalize">
                      {log.type.replace("_", " ").toLowerCase()}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  <pre className="text-sm text-muted-foreground mb-3 overflow-y-auto">
                    {typeof log.message === "string" ? (
                      log.message
                    ) : (
                      <div>
                        <p>Status: {getStatusText()}</p>
                        <pre>{JSON.stringify(log.message?.data, null, 2)}</pre>
                      </div>
                    )}
                  </pre>

                  {log.nodeId && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLogExpansion(index)}
                        className="flex items-center space-x-2 text-xs text-accent hover:text-accent/90 transition-all duration-300 hover:scale-105 font-medium"
                      >
                        {expandedLogs.has(index) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        <span>Node Details</span>
                      </button>
                    </div>
                  )}

                  {expandedLogs.has(index) && log.nodeId && (
                    <div className="mt-3 p-3 bg-gradient-to-br from-background/40 to-background/20 rounded-xl border border-border/30 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          Node Information
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Node ID:
                      </div>
                      <code className="text-xs text-foreground font-mono break-all bg-input/50 px-2 py-1 rounded border border-border/20">
                        {log.nodeId}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-border/40 bg-gradient-to-r from-background/20 to-card/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Real-time execution monitoring
            </span>
          </div>
          {isExecuting && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-chart-3 rounded-full animate-ping"></div>
              <span className="text-xs font-medium text-chart-3">
                Live Updates
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ExecutionPanel;
