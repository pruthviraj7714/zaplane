import {
  Calendar,
  MessageSquare,
  Play,
  Send,
  Server,
  Settings,
  Webhook,
  Zap,
} from "lucide-react";
import { Handle, NodeTypes, Position } from "reactflow";

const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getTriggerIcon = () => {
    switch (data.triggerType) {
      case "WEBHOOK":
        return <Webhook className="w-4 h-4" />;
      case "CRON":
        return <Calendar className="w-4 h-4" />;
      case "MANUAL":
        return <Play className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getTriggerColor = () => {
    switch (data.triggerType) {
      case "WEBHOOK":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "CRON":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      case "MANUAL":
        return "bg-primary/20 text-primary border-primary/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-2xl rounded-2xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-2 ${
        selected
          ? "border-primary shadow-primary/30 scale-105"
          : "border-border/40 hover:border-border/60"
      } min-w-[200px] transition-all duration-300 hover:scale-105 group`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`p-2.5 rounded-xl border shadow-lg ${getTriggerColor()} group-hover:scale-110 transition-transform duration-300`}
        >
          {getTriggerIcon()}
        </div>
        <div>
          <div className="font-semibold text-sm text-card-foreground">
            Trigger
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {data.triggerType?.toLowerCase() || "Manual"}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3 !border-2 !border-primary-foreground"
      />
    </div>
  );
};

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getActionIcon = () => {
    switch (data.actionPlatform) {
      case "TELEGRAM":
        return <MessageSquare className="w-4 h-4" />;
      case "RESEND":
        return <Send className="w-4 h-4" />;
      case "HTTP_REQUEST":
        return <Server className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getActionColor = () => {
    switch (data.actionPlatform) {
      case "TELEGRAM":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "RESEND":
        return "bg-chart-5/20 text-chart-5 border-chart-5/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-2xl rounded-2xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-2 ${
        selected
          ? "border-accent shadow-accent/30 scale-105"
          : "border-border/40 hover:border-border/60"
      } min-w-[200px] transition-all duration-300 hover:scale-105 group`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`p-2.5 rounded-xl border shadow-lg ${getActionColor()} group-hover:scale-110 transition-transform duration-300`}
        >
          {getActionIcon()}
        </div>
        <div>
          <div className="font-semibold text-sm text-card-foreground">
            Action
          </div>
          <div className="text-xs text-muted-foreground">
            {data.actionPlatform || "Select Platform"}
          </div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-chart-3 !w-3 !h-3 !border-2 !border-primary-foreground"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3 !border-2 !border-primary-foreground"
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

export default nodeTypes;
