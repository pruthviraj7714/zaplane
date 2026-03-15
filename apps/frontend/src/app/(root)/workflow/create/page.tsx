"use client";

import { useState, useCallback, useRef } from "react";
import ReactFlow, {
  type Node,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Save,
  Play,
  Settings,
  Webhook,
  Calendar,
  Zap,
  Send,
  MessageSquare,
  X,
  Sparkles,
  Activity,
  Layers,
  Server,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/Modal";
import TriggerForm from "@/components/forms/TriggerForm";
import TelegramActionForm from "@/components/forms/TelegramActionForm";
import ResendActionForm from "@/components/forms/ResendActionForm";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HttpRequestActionForm from "@/components/forms/HttpRequestActionForm";
import nodeTypes from "@/components/workflow/nodeTypes";

type ModalType = "trigger" | "action-select" | "resend" | "telegram" | "http";

const CreateWorkflowPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { data } = useSession();
  const router = useRouter();

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  const onNodeDoubleClick = useCallback((event: any, node: any) => {
    setSelectedNode(node);
    if (node.type === "trigger") {
      setModalType("trigger");
    } else if (node.type === "action") {
      if (node.data.actionPlatform === "TELEGRAM") {
        setModalType("telegram");
      } else if (node.data.actionPlatform === "RESEND") {
        setModalType("resend");
      } else if (node.data.actionPlatform === "HTTP_REQUEST") {
        setModalType("http");
      } else {
        setModalType("action-select");
      }
    }
  }, []);

  const addTriggerNode = useCallback(() => {
    const newNode: Node = {
      id: `trigger-${Date.now()}`,
      type: "trigger",
      position: { x: 250, y: 100 },
      data: {
        triggerType: "MANUAL",
        label: "Trigger Node",
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addActionNode = useCallback(() => {
    const newNode: Node = {
      id: `action-${Date.now()}`,
      type: "action",
      position: { x: 250, y: 50 },
      data: {
        actionPlatform: null,
        label: "Action Node",
        action: {},
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const handleNodeSave = (data: any) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, data);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedNode(null);
  };

  const saveWorkflow = async () => {
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

    const triggerNodes = nodes.filter((n) => n.type === "trigger");
    if (triggerNodes.length === 0) {
      toast.warning("Please add at least one trigger node", {
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const workflowData = {
        title: workflowTitle,
        enabled: isEnabled,
        nodes: nodes.map((node) => ({
          tempId: node.id,
          type: node.type?.toUpperCase() as "TRIGGER" | "ACTION",
          position: node.position,
          triggerType: node.data.triggerType || null,
          actionPlatform: node.data.actionPlatform || null,
          action: node.data.action || {},
          data: {
            ...node.data,
            label: undefined,
          },
        })),
        connections: edges.map((edge) => ({
          sourceTempId: edge.source,
          targetTempId: edge.target,
        })),
      };

      console.log("Sending workflow data:", workflowData);

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/workflow`,
        workflowData,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Workflow created successfully:", response.data);
      toast.success("Workflow Successfully Created");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error saving workflow:", error);

      if (error.response?.data?.message) {
        toast.error(`Failed to save workflow: ${error.response.data.message}`);
      } else if (error.response?.data?.error) {
        toast.error(`Failed to save workflow: ${error.response.data.error}`);
      } else {
        toast.error("Failed to save workflow. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PlatformSelectModal = () => (
    <Modal isOpen={modalType === "action-select"} onClose={closeModal}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Select Action Platform
          </h2>
          <button
            onClick={closeModal}
            className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              updateNodeData(selectedNode.id, { actionPlatform: "TELEGRAM" });
              setModalType("telegram");
            }}
            className="w-full flex items-center cursor-pointer space-x-4 p-4 border border-border/40 rounded-xl hover:bg-card/50 transition-all duration-300 hover:scale-105 hover:border-chart-2/40 backdrop-blur-sm"
          >
            <div className="p-2 bg-chart-2/20 rounded-lg border border-chart-2/30">
              <MessageSquare className="w-6 h-6 text-chart-2" />
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground">Telegram</div>
              <div className="text-sm text-muted-foreground">
                Send messages to Telegram channels and users
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              updateNodeData(selectedNode.id, { actionPlatform: "RESEND" });
              setModalType("resend");
            }}
            className="w-full flex items-center cursor-pointer space-x-4 p-4 border border-border/40 rounded-xl hover:bg-card/50 transition-all duration-300 hover:scale-105 hover:border-chart-5/40 backdrop-blur-sm"
          >
            <div className="p-2 bg-chart-5/20 rounded-lg border border-chart-5/30">
              <Send className="w-6 h-6 text-chart-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground">Resend</div>
              <div className="text-sm text-muted-foreground">
                Send professional emails via Resend API
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              updateNodeData(selectedNode.id, {
                actionPlatform: "HTTP_REQUEST",
              });
              setModalType("http");
            }}
            className="w-full flex items-center cursor-pointer space-x-4 p-4 border border-border/40 rounded-xl hover:bg-card/50 transition-all duration-300 hover:scale-105 hover:border-chart-2/40 backdrop-blur-sm"
          >
            <div className="p-2 bg-chart-7/20 rounded-lg border border-chart-7/30">
              <Server className="w-6 h-6 text-chart-7" />
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground">HTTP Request</div>
              <div className="text-sm text-muted-foreground">
                Send HTTP requests to any API
              </div>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="h-[130vh] bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-b border-border/40 px-6 py-4 relative z-10 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Create Workflow
                </h1>
                <Badge className="bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/30 px-2 py-0.5 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Visual Builder
                </Badge>
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter workflow title..."
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="px-4 py-3 bg-input/80 border border-border/40 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent/50 w-80 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all duration-300 text-base"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded-lg border-border/40 text-accent focus:ring-accent bg-input/80 w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground">
                Enabled
              </span>
            </label>

            <button
              onClick={saveWorkflow}
              disabled={isLoading}
              className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground px-6 py-3 rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-2xl shadow-accent/30 hover:shadow-accent/50 font-semibold"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Save Workflow"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full relative z-10">
        <div className="w-80 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-r border-border/40 p-6 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Add Nodes
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Drag and drop to build your automation workflow
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={addTriggerNode}
              className="w-full flex items-center space-x-4 p-4 text-left hover:bg-card/50 rounded-xl border border-border/40 transition-all duration-300 group hover:scale-105 hover:border-primary/40 backdrop-blur-sm"
            >
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl border border-primary/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-base text-foreground">
                  Trigger
                </div>
                <div className="text-sm text-muted-foreground">
                  Start your workflow automation
                </div>
              </div>
            </button>

            <button
              onClick={addActionNode}
              className="w-full flex items-center space-x-4 p-4 text-left hover:bg-card/50 rounded-xl border border-border/40 transition-all duration-300 group hover:scale-105 hover:border-accent/40 backdrop-blur-sm"
            >
              <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/30 rounded-xl border border-accent/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/10">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-base text-foreground">
                  Action
                </div>
                <div className="text-sm text-muted-foreground">
                  Perform automated actions
                </div>
              </div>
            </button>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Workflow Stats
            </h3>
            <div className="bg-gradient-to-br from-muted/10 to-muted/5 rounded-xl p-4 border border-border/30 backdrop-blur-sm">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nodes:</span>
                  <span className="font-medium text-foreground">
                    {nodes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connections:</span>
                  <span className="font-medium text-foreground">
                    {edges.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={`text-xs ${isEnabled ? "bg-chart-3/20 text-chart-3 border-chart-3/30" : "bg-muted/20 text-muted-foreground border-muted/30"}`}
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">Pro Tip</p>
                <p className="text-xs text-muted-foreground">
                  Double-click on any node to configure its settings and
                  customize the automation behavior
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-background/50 to-card/20"
          >
            <Background color="oklch(1 0 0 / 8%)" gap={24} size={1} />
            <Controls className="!bg-card/90 !border !border-border/40 !backdrop-blur-lg" />
            <MiniMap
              className="!bg-card/90 !border !border-border/40 !backdrop-blur-lg !rounded-xl"
              maskColor="oklch(0.14 0 0 / 0.8)"
              nodeColor="oklch(0.65 0.22 264)"
            />

            <Panel
              position="top-center"
              className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg rounded-xl shadow-2xl border border-border/40 px-6 py-3 mx-4"
            >
              <div className="text-sm text-muted-foreground font-medium">
                {nodes.length === 0
                  ? "Add nodes from the sidebar to start building your workflow"
                  : "Double-click nodes to configure • Drag to connect"}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <TriggerForm
        isOpen={modalType === "trigger"}
        onClose={closeModal}
        triggerData={selectedNode?.data}
        onSave={handleNodeSave}
      />

      <TelegramActionForm
        isOpen={modalType === "telegram"}
        onClose={closeModal}
        actionData={selectedNode?.data}
        onSave={handleNodeSave}
      />

      <ResendActionForm
        isOpen={modalType === "resend"}
        onClose={closeModal}
        actionData={selectedNode?.data}
        onSave={handleNodeSave}
      />

      <HttpRequestActionForm
        isOpen={modalType === "http"}
        onClose={closeModal}
        actionData={selectedNode?.data}
        onSave={handleNodeSave}
      />

      <PlatformSelectModal />
    </div>
  );
};

export default CreateWorkflowPage;
