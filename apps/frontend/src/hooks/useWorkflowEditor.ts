"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Connection,
} from "reactflow";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";

export type ModalType =
  | "trigger"
  | "action-select"
  | "resend"
  | "telegram"
  | "http"
  | null;

export interface WorkflowLog {
  message: string | object;
  nodeId: string;
  type: "NODE_EXECUTED" | "TRIGGER_EXECUTED" | "ERROR" | "COMPLETED";
}

export function useWorkflowEditor(workflowId: string) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [workflowTitle, setWorkflowTitle] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(true);
  const [originalWorkflow, setOriginalWorkflow] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [webhookData, setWebhookData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!workflowId || !session?.accessToken) return;

    const loadWorkflow = async () => {
      setIsLoadingWorkflow(true);
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/workflow/${workflowId}`,
          { headers: { Authorization: `Bearer ${session.accessToken}` } },
        );

        const wf = response.data.data;
        setOriginalWorkflow(wf);
        setWorkflowTitle(wf.title);
        setIsEnabled(wf.enabled);
        setWebhookUrl(wf.webhook?.path ?? null);
        setWebhookData(wf.webhook ?? null);

        setNodes(
          wf.nodes.map((dbNode: any) => ({
            id: dbNode.id,
            type: dbNode.type.toLowerCase(),
            position: dbNode.position,
            data: {
              triggerType: dbNode.triggerType,
              actionPlatform: dbNode.data.actionPlatform,
              action: dbNode.data.action ?? {},
              label: dbNode.type === "TRIGGER" ? "Trigger Node" : "Action Node",
              ...dbNode.data,
            },
          })),
        );

        setEdges(
          wf.connections.map((conn: any, index: number) => ({
            id: conn.id ?? `edge-${index}`,
            source: conn.sourceId,
            target: conn.targetId,
            type: "default",
          })),
        );
      } catch (error) {
        console.error("Error loading workflow:", error);
        toast.error("Failed to load workflow");
        router.push("/dashboard");
      } finally {
        setIsLoadingWorkflow(false);
      }
    };

    loadWorkflow();
  }, [workflowId, session?.accessToken, setNodes, setEdges, router]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addTriggerNode = useCallback(() => {
    const newNode: Node = {
      id: `trigger-${Date.now()}`,
      type: "trigger",
      position: { x: 250, y: 100 },
      data: { triggerType: "MANUAL", label: "Trigger Node" },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const addActionNode = useCallback(() => {
    const newNode: Node = {
      id: `action-${Date.now()}`,
      type: "action",
      position: { x: 250, y: 250 },
      data: { actionPlatform: null, label: "Action Node", action: {} },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) =>
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node,
        ),
      ),
    [setNodes],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
      );
    },
    [setNodes, setEdges],
  );

  const openNodeModal = useCallback((node: any) => {
    setSelectedNode(node);
    if (node.type === "trigger") {
      setModalType("trigger");
    } else if (node.type === "action") {
      const platform = node.data.actionPlatform;
      if (platform === "TELEGRAM") setModalType("telegram");
      else if (platform === "RESEND") setModalType("resend");
      else if (platform === "HTTP_REQUEST") setModalType("http");
      else setModalType("action-select");
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedNode(null);
  }, []);

  const handleNodeSave = useCallback(
    (data: any) => {
      if (selectedNode) updateNodeData(selectedNode.id, data);
    },
    [selectedNode, updateNodeData],
  );

  const handleCopy = useCallback(() => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [webhookUrl]);

  const updateWorkflow = async () => {
    if (!workflowTitle.trim()) {
      toast.warning("Please enter a workflow title", {
        position: "top-center",
      });
      return;
    }
    if (nodes.length === 0) {
      toast.warning("Please add at least one node to the workflow", {
        position: "top-center",
      });
      return;
    }
    if (!nodes.some((n) => n.type === "trigger")) {
      toast.warning("Please add at least one trigger node", {
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);
    try {
      const deletedNodeIds =
        originalWorkflow?.nodes
          ?.filter((dbNode: any) => !nodes.some((n) => n.id === dbNode.id))
          ?.map((dbNode: any) => dbNode.id) ?? [];

      const payload = {
        title: workflowTitle,
        enabled: isEnabled,
        nodes: nodes.map((node) => {
          const isExisting = originalWorkflow?.nodes?.some(
            (db: any) => db.id === node.id,
          );
          return {
            ...(isExisting ? { id: node.id } : { tempId: node.id }),
            type: node.type?.toUpperCase() as "TRIGGER" | "ACTION",
            position: node.position,
            triggerType: node.data.triggerType ?? null,
            actionPlatform: node.data.actionPlatform ?? null,
            action: node.data.action ?? {},
            data: { ...node.data, label: undefined },
          };
        }),
        connections: edges.map((edge) => ({
          sourceTempId: edge.source,
          targetTempId: edge.target,
        })),
        deletedNodeIds,
      };

      await axios.put(`${BACKEND_URL}/api/v1/workflow/${workflowId}`, payload, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Workflow Successfully Updated");
      router.push("/dashboard");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Failed to update workflow. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const hasManualTrigger = nodes.some((n) => n.data.triggerType === "MANUAL");

  return {
    // ReactFlow state
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    // Workflow meta
    workflowTitle,
    setWorkflowTitle,
    isEnabled,
    setIsEnabled,
    isLoadingWorkflow,
    // Nodes
    addTriggerNode,
    addActionNode,
    updateNodeData,
    deleteNode,
    // Modal
    selectedNode,
    modalType,
    openNodeModal,
    closeModal,
    handleNodeSave,
    // Webhook
    webhookUrl,
    webhookData,
    copied,
    handleCopy,
    // Save
    isLoading,
    updateWorkflow,
    // Derived
    hasManualTrigger,
  };
}
