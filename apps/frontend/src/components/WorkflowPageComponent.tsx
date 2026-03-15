"use client";

import { useRef, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, Panel } from "reactflow";
import "reactflow/dist/style.css";
import {
  Save,
  Play,
  Settings,
  Activity,
  Layers,
  Copy,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useWorkflowEditor } from "@/hooks/useWorkflowEditor";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import nodeTypes from "@/components/workflow/nodeTypes";
import { PlatformSelectModal } from "@/components/PlatformSelectModal";
import Modal from "@/components/Modal";
import TriggerForm from "@/components/forms/TriggerForm";
import TelegramActionForm from "@/components/forms/TelegramActionForm";
import ResendActionForm from "@/components/forms/ResendActionForm";
import HttpRequestActionForm from "@/components/forms/HttpRequestActionForm";
import ExecutionPanel from "@/components/ExecutionPanel";

// ─── Component ────────────────────────────────────────────────────────────────

interface EditWorkflowPageProps {
  workflowId: string;
}

export default function EditWorkflowPage({
  workflowId,
}: EditWorkflowPageProps) {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // All state + API logic lives in the hook
  const editor = useWorkflowEditor(workflowId);

  // All execution + SSE logic lives in this hook
  const execution = useWorkflowExecution(workflowId);

  // ── Platform-select handler ────────────────────────────────────────────────
  // Selects the platform on the node, then immediately opens the right form
  const handlePlatformSelect = (
    platform: "TELEGRAM" | "RESEND" | "HTTP_REQUEST",
  ) => {
    if (!editor.selectedNode) return;
    editor.updateNodeData(editor.selectedNode.id, { actionPlatform: platform });
    const next =
      platform === "TELEGRAM"
        ? "telegram"
        : platform === "RESEND"
          ? "resend"
          : "http";
    editor.closeModal();
    setTimeout(() => {
      editor.openNodeModal({
        ...editor.selectedNode,
        data: { ...editor.selectedNode.data, actionPlatform: platform },
      });
    }, 0);
  };

  if (editor.isLoadingWorkflow) {
    return (
      <div className="h-screen bg-slate-800/50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading workflow...</span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-[130vh] bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <header className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-b border-border/40 px-6 py-4 relative z-10 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Edit Workflow
                </h1>
                <Badge className="bg-gradient-to-r from-chart-2/20 to-primary/20 text-chart-2 border border-chart-2/30 px-2 py-0.5 text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Live Editor
                </Badge>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter workflow title..."
              value={editor.workflowTitle}
              onChange={(e) => editor.setWorkflowTitle(e.target.value)}
              className="px-4 py-3 bg-input/80 border border-border/40 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent/50 w-full max-w-80 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all duration-300 text-base"
            />
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0">
            {editor.hasManualTrigger ? (
              <button
                onClick={execution.executeWorkflow}
                disabled={execution.isExecuting}
                className="bg-gradient-to-r from-chart-3 to-chart-3/90 hover:from-chart-3/90 hover:to-chart-3/80 text-primary-foreground px-4 py-2.5 rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-lg shadow-chart-3/20 font-medium whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                <span>
                  {execution.isExecuting ? "Executing…" : "Execute Workflow"}
                </span>
              </button>
            ) : editor.webhookUrl ? (
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={editor.webhookUrl}
                  className="w-64 bg-background text-primary-foreground px-4 py-3 rounded-xl font-medium shadow-lg"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={editor.handleCopy}
                  className="rounded-xl shadow-md transition-all duration-300 hover:scale-110 flex-shrink-0"
                >
                  <Copy className="h-5 w-5" />
                </Button>
                {editor.copied && (
                  <span className="text-sm text-green-500 font-medium animate-pulse whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </div>
            ) : null}

            <label className="flex items-center space-x-3 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={editor.isEnabled}
                onChange={(e) => editor.setIsEnabled(e.target.checked)}
                className="rounded-lg border-border/40 text-accent focus:ring-accent bg-input/80 w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                Enabled
              </span>
            </label>

            <button
              onClick={editor.updateWorkflow}
              disabled={editor.isLoading}
              className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground px-6 py-2.5 rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-2xl shadow-accent/30 font-semibold whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{editor.isLoading ? "Updating…" : "Update Workflow"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-full relative z-10">
        <aside className="w-80 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-r border-border/40 p-6 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Add Nodes
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Enhance your workflow with additional nodes
            </p>
          </div>

          <div className="space-y-4">
            <SidebarButton
              icon={<Activity className="w-5 h-5 text-primary" />}
              colorClass="from-primary/20 to-primary/30 border-primary/30 shadow-primary/10"
              title="Trigger"
              description="Start your workflow automation"
              onClick={editor.addTriggerNode}
            />
            <SidebarButton
              icon={<Settings className="w-5 h-5 text-accent" />}
              colorClass="from-accent/20 to-accent/30 border-accent/30 shadow-accent/10"
              title="Action"
              description="Perform automated actions"
              onClick={editor.addActionNode}
            />
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Workflow Stats
            </h3>
            <div className="bg-gradient-to-br from-muted/10 to-muted/5 rounded-xl p-4 border border-border/30 backdrop-blur-sm space-y-3 text-sm">
              <StatRow label="Nodes" value={String(editor.nodes.length)} />
              <StatRow
                label="Connections"
                value={String(editor.edges.length)}
              />
              <StatRow
                label="Status"
                value={
                  <Badge
                    className={`text-xs ${editor.isEnabled ? "bg-chart-3/20 text-chart-3 border-chart-3/30" : "bg-muted/20 text-muted-foreground border-muted/30"}`}
                  >
                    {editor.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                }
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  Editor Tips
                </p>
                <p className="text-xs text-muted-foreground">
                  Double-click nodes to configure • Right-click to delete • Drag
                  to connect nodes
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={editor.nodes}
            edges={editor.edges}
            onNodesChange={editor.onNodesChange}
            onEdgesChange={editor.onEdgesChange}
            onConnect={editor.onConnect}
            onNodeDoubleClick={(_event, node) => editor.openNodeModal(node)}
            onNodeContextMenu={(event, node) => {
              event.preventDefault();
              if (
                window.confirm("Are you sure you want to delete this node?")
              ) {
                editor.deleteNode(node.id);
              }
            }}
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
              <p className="text-sm text-muted-foreground font-medium">
                {editor.nodes.length === 0
                  ? "Add nodes from the sidebar to enhance your workflow"
                  : "Double-click nodes to configure • Right-click to delete"}
              </p>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <TriggerForm
        isOpen={editor.modalType === "trigger"}
        onClose={editor.closeModal}
        triggerData={editor.selectedNode?.data}
        webhookData={editor.webhookData}
        onSave={editor.handleNodeSave}
      />
      <TelegramActionForm
        isOpen={editor.modalType === "telegram"}
        onClose={editor.closeModal}
        actionData={editor.selectedNode?.data}
        onSave={editor.handleNodeSave}
      />
      <ResendActionForm
        isOpen={editor.modalType === "resend"}
        onClose={editor.closeModal}
        actionData={editor.selectedNode?.data}
        onSave={editor.handleNodeSave}
      />
      <HttpRequestActionForm
        isOpen={editor.modalType === "http"}
        onClose={editor.closeModal}
        actionData={editor.selectedNode?.data}
        onSave={editor.handleNodeSave}
      />

      <PlatformSelectModal
        isOpen={editor.modalType === "action-select"}
        onClose={editor.closeModal}
        onSelect={handlePlatformSelect}
      />

      <ExecutionPanel
        isOpen={execution.isExecutionPanelOpen}
        onClose={() => execution.setIsExecutionPanelOpen(false)}
        isExecuting={execution.isExecuting}
        logs={execution.logs}
        workflowTitle="My Automation Workflow"
      />
    </div>
  );
}

function SidebarButton({
  icon,
  colorClass,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-4 p-4 text-left hover:bg-card/50 rounded-xl border border-border/40 transition-all duration-300 group hover:scale-105 backdrop-blur-sm"
    >
      <div
        className={`p-3 bg-gradient-to-br ${colorClass} rounded-xl border group-hover:scale-110 transition-transform duration-300 shadow-lg`}
      >
        {icon}
      </div>
      <div>
        <div className="font-semibold text-base text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </button>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
