"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/lib/config";

export interface WorkflowLog {
  message: string | object;
  nodeId: string;
  type: "NODE_EXECUTED" | "TRIGGER_EXECUTED" | "ERROR" | "COMPLETED";
}

export function useWorkflowExecution(workflowId: string) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
  const isExecutingRef = useRef(isExecuting);
  isExecutingRef.current = isExecuting;

  const { data: session } = useSession();

  const executeWorkflow = async () => {
    if (!session?.accessToken) return;
    setIsExecuting(true);
    setLogs([]);
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/workflow/execute-workflow/${workflowId}`,
        {},
        { headers: { Authorization: `Bearer ${session.accessToken}` } },
      );
      setIsExecutionPanelOpen(true);
      toast.success("Workflow Initiated");
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (!isExecuting) return;

    const eventSrc = new EventSource(
      `${BACKEND_URL}/api/v1/stream/workflow/${workflowId}`,
    );

    eventSrc.onopen = () => console.log("[SSE] connected");

    eventSrc.onmessage = (event) => {
      const parsed: WorkflowLog = JSON.parse(event.data);

      setLogs((prev) => [...prev, parsed]);

      switch (parsed.type) {
        case "COMPLETED":
          setIsExecuting(false);
          toast.success("Workflow Successfully Executed ✅");
          break;
        case "ERROR":
          setIsExecuting(false);
          toast.error("Error while Executing Workflow ❌", {
            description:
              typeof parsed.message === "string"
                ? parsed.message
                : JSON.stringify(parsed.message),
          });
          break;
      }
    };

    eventSrc.onerror = () => {
      toast.error("Lost connection to execution stream");
      setIsExecuting(false);
      eventSrc.close();
    };

    return () => eventSrc.close();
  }, [workflowId, isExecuting]);

  return {
    isExecuting,
    logs,
    isExecutionPanelOpen,
    setIsExecutionPanelOpen,
    executeWorkflow,
  };
}
