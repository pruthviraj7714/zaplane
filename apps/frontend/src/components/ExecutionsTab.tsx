import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Activity,
  Zap,
  AlertTriangle,
  Calendar,
  Timer,
  Loader2,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";
import { Button } from "./ui/button";

type STATUS = "SUCCESS" | "FAILED" | "RUNNING";

interface NodeExecution {
  id: string;
  nodeId: string;
  status: STATUS;
  startedAt: Date;
  finishedAt: Date;
  result?: string;
  error?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflow: {
    title: string;
  };
  status: STATUS;
  startedAt: Date;
  finishedAt: Date;
  nodes: NodeExecution[];
}

const ExecutionsTab = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalExecutions, setTotalExecutions] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [runningCount, setRunningCount] = useState(0);
  const { data, status } = useSession();

  const fetchExecutions = async () => {
    if (status === "unauthenticated") return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/executions?page=${page}&status=${filter}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        },
      );
      setExecutions(res.data.executions);
      setTotalPages(res.data.totalPages);
      setTotalExecutions(res.data.totalExecutions);
      setSuccessCount(res.data.successCount);
      setFailedCount(res.data.failedCount);
      setRunningCount(res.data.runningCount);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchExecutions();
  }, [status, page, filter]);

  const formatTime = (dateString: Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (start: Date, end: Date) => {
    if (!start || !end) return "In progress";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.round(diff / 60)}m`;
    return `${Math.round(diff / 3600)}h`;
  };

  const getStatusBadge = (status: STATUS, isNode: boolean = false) => {
    const baseClasses = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-lg ${isNode ? "text-xs px-2 py-0.5" : ""}`;

    switch (status) {
      case "SUCCESS":
        return (
          <div
            className={`${baseClasses} bg-chart-3/10 text-chart-3 border border-chart-3/20 shadow-chart-3/5`}
          >
            <CheckCircle className={`${isNode ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
            <span>Success</span>
          </div>
        );
      case "FAILED":
        return (
          <div
            className={`${baseClasses} bg-destructive/10 text-destructive border border-destructive/20 shadow-destructive/5`}
          >
            <XCircle className={`${isNode ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
            <span>Failed</span>
          </div>
        );
      case "RUNNING":
        return (
          <div
            className={`${baseClasses} bg-chart-2/10 text-chart-2 border border-chart-2/20 shadow-chart-2/5`}
          >
            <Loader2
              className={`${isNode ? "w-3 h-3" : "w-3.5 h-3.5"} animate-spin`}
            />
            <span>Running</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: STATUS) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-chart-3" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "RUNNING":
        return <Loader2 className="w-5 h-5 text-chart-2 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-chart-4" />;
    }
  };

  const getFilterCount = (status: string) => {
    if (status === "ALL") return totalExecutions;
    else if (status === "SUCCESS") return successCount;
    else if (status === "FAILED") return failedCount;
    else if (status === "RUNNING") return runningCount;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Workflow Executions
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Monitor and track your workflow execution history with real-time
                insights
              </p>
            </div>
          </div>

          <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 px-4 py-2 animate-pulse shadow-lg shadow-primary/20">
            <Shield className="w-4 h-4 mr-2" />
            Live Monitoring
          </Badge>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {["ALL", "SUCCESS", "FAILED", "RUNNING"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 ${
                  filter === status
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 shadow-lg shadow-primary/10"
                    : "bg-card/60 text-muted-foreground border border-border/40 hover:bg-card/80 hover:text-foreground hover:border-border/60 backdrop-blur-sm"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-muted/50 text-xs">
                  {getFilterCount(status)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border border-border/40 rounded-2xl p-8 shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-4 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="text-lg">Loading executions...</span>
              </div>
            </div>
          </div>
        ) : executions.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border border-border/40 rounded-2xl p-12 shadow-2xl shadow-primary/10 max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center mb-6 border border-border/30">
                <Activity className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No executions found
              </h3>
              <p className="text-muted-foreground">
                Your workflow executions will appear here once you start running
                workflows
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {executions.map((exec, index) => (
              <div
                key={exec.id}
                className="group relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border border-border/40 rounded-2xl overflow-hidden shadow-2xl hover:shadow-accent/20 transition-all duration-500 hover:scale-[1.02] hover:border-accent/30"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "slideInUp 0.5s ease-out forwards",
                }}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    exec.status === "SUCCESS"
                      ? "bg-gradient-to-r from-chart-3/60 to-chart-3/80"
                      : exec.status === "FAILED"
                        ? "bg-gradient-to-r from-destructive/60 to-destructive/80"
                        : "bg-gradient-to-r from-chart-2/60 to-chart-2/80"
                  }`}
                />

                <div
                  className="p-6 cursor-pointer"
                  onClick={() =>
                    setExpanded(expanded === exec.id ? null : exec.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {expanded === exec.id ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
                        )}
                        {getStatusIcon(exec.status)}
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                          {exec.workflow.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          {getStatusBadge(exec.status)}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Timer className="w-3.5 h-3.5" />
                            <span>
                              {getDuration(exec.startedAt, exec.finishedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 text-card-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {formatDate(exec.startedAt)}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {formatTime(exec.startedAt)} →{" "}
                        {formatTime(exec.finishedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {expanded === exec.id && (
                  <div className="border-t border-border/30 bg-gradient-to-br from-background/20 to-background/10">
                    <div className="p-6 pt-4">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-base font-medium text-card-foreground">
                          Execution Steps ({exec.nodes?.length || 0})
                        </span>
                      </div>

                      {exec.nodes && exec.nodes.length > 0 ? (
                        <div className="space-y-4">
                          {exec.nodes.map((node, nodeIndex) => (
                            <div
                              key={node.id}
                              className="bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-4 hover:bg-card/70 transition-all duration-300 hover:border-border/50"
                              style={{
                                animationDelay: `${nodeIndex * 50}ms`,
                                animation:
                                  "slideInRight 0.3s ease-out forwards",
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-accent/30 to-primary/30 rounded-lg flex items-center justify-center">
                                      <PlayCircle className="w-3.5 h-3.5 text-accent" />
                                    </div>
                                    <span className="font-medium text-card-foreground">
                                      Node {nodeIndex + 1}
                                    </span>
                                  </div>
                                  {getStatusBadge(node.status, true)}
                                </div>
                                <div className="text-xs text-muted-foreground font-medium">
                                  {formatTime(node.startedAt)} →{" "}
                                  {formatTime(node.finishedAt)}
                                </div>
                              </div>

                              {node.result && (
                                <div className="bg-chart-3/5 border border-chart-3/20 rounded-lg p-3 mb-2 backdrop-blur-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-3.5 h-3.5 text-chart-3" />
                                    <span className="text-xs font-medium text-chart-3">
                                      Result
                                    </span>
                                  </div>
                                  <p className="text-sm text-card-foreground leading-relaxed">
                                    {typeof node.result === "string" ? (
                                      node.result
                                    ) : (
                                      <pre>
                                        {JSON.stringify(node.result, null, 2)}
                                      </pre>
                                    )}
                                  </p>
                                </div>
                              )}

                              {node.error && (
                                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 backdrop-blur-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                                    <span className="text-xs font-medium text-destructive">
                                      Error
                                    </span>
                                  </div>
                                  <p className="text-sm text-destructive leading-relaxed">
                                    {node.error}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center mb-4 border border-border/30">
                            <Activity className="w-8 h-8 text-muted-foreground opacity-50" />
                          </div>
                          <p className="text-muted-foreground">
                            No execution steps available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
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

export default ExecutionsTab;
