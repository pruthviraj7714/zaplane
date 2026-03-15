"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  Grid3x3,
  List,
  Zap,
  Activity,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkflowCard from "@/components/workflow-card";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import CredentialsTab from "@/components/tabs/CredentialsTab";
import ExecutionsTab from "@/components/ExecutionsTab";
import { useRouter } from "next/navigation";

type TABS = "WORKFLOWS" | "CREDENTIALS" | "EXECUTIONS";

const tabs: TABS[] = ["WORKFLOWS", "CREDENTIALS", "EXECUTIONS"];

interface INode {
  id: string;
  type: "TRIGGER" | "ACTION";
  triggerType?: string;
  position: { x: string; y: string };
  actionPlatform: "MANUAL" | "WEBHOOK" | "CRON";
  action?: any;
  data?: any;
  workflowId: string;
}

interface IConnection {
  id: string;
  sourceId: string;
  targetId: string;
  workflowId: string;
}

interface IWorkflow {
  id: string;
  title: string;
  enabled: boolean;
  userId: string;
  connections: IConnection[];
  executions: any;
  nodes: INode[];
  updatedAt?: string;
  createdAt?: string;
}

const Dashboard = () => {
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TABS>("WORKFLOWS");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();
  const { data } = useSession();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/v1/workflow`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      setWorkflows(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (id: string, enabled: boolean) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/v1/workflow/toggle/${id}`,
        { enabled },
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        },
      );

      setWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, enabled } : w)),
      );
      toast.success(`Workflow ${enabled ? "activated" : "deactivated"}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/workflow/${id}`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success(`Workflow Successfully Removed!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    }
  };

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (data && data.accessToken) {
      fetchWorkflows();
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-chart-2/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Personal Workspace
              </h1>
              <Badge className="bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/30 px-3 py-1">
                <Sparkles className="w-4 h-4 mr-1" />
                Pro
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground">
              Manage your workflows, credentials, and executions with powerful
              automation tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-10 bg-card/50 backdrop-blur-sm rounded-2xl p-2 border border-border/30 w-fit shadow-lg shadow-primary/5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 capitalize relative ${
                activeTab === tab
                  ? "bg-gradient-to-r from-accent to-primary text-accent-foreground shadow-lg shadow-accent/25 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              {tab.toLowerCase()}
              {activeTab === tab && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {activeTab === "WORKFLOWS" ? (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-card/50 border-border/30 text-foreground placeholder-muted-foreground w-80 h-12 rounded-xl backdrop-blur-sm focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Select defaultValue="last-updated">
                  <SelectTrigger className="bg-card/50 border-border/30 text-foreground w-56 h-12 rounded-xl backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-lg border-border/30">
                    <SelectItem value="last-updated">
                      Sort by last updated
                    </SelectItem>
                    <SelectItem value="name">Sort by name</SelectItem>
                    <SelectItem value="created">Sort by created</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center bg-card/50 border border-border/30 rounded-xl p-1 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-card/50 p-3 rounded-xl transition-all duration-300"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }`}
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-card/30 rounded-2xl p-6 border border-border/20">
                      <div className="h-6 bg-border/40 rounded-lg mb-4"></div>
                      <div className="h-4 bg-border/40 rounded-lg mb-3"></div>
                      <div className="h-4 bg-border/40 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : filteredWorkflows.length > 0 ? (
                filteredWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onView={() => router.push(`/workflows/${workflow.id}`)}
                    onDeleteWorkflow={handleDeleteWorkflow}
                    onToggleWorkflow={handleToggleWorkflow}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="w-20 h-20 bg-card/50 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-border/30">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No workflows found
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Create your first workflow to get started"}
                  </p>
                  <Button
                    onClick={() => router.push("/workflow/create")}
                    className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 cursor-pointer hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "CREDENTIALS" ? (
          <CredentialsTab />
        ) : activeTab === "EXECUTIONS" ? (
          <ExecutionsTab />
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-foreground">
              Invalid Tab Selected
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
