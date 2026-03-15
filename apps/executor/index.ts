import { Worker } from "bullmq";
import redisclient from "@repo/redisclient";
import prisma from "@repo/db";
import { sendTelegramMessage } from "./actionNodes/telegram";
import { sendResendEmail } from "./actionNodes/resend";
import { sendHttpRequest } from "./actionNodes/http-request";

type NodeResult = Record<string, any>;

type WorkflowRunResponse = {
  executionId: string | null;
  results: Record<string, NodeResult> | null;
};

const runWorkerFlow = async (
  workflowId: string,
  userId: string,
): Promise<WorkflowRunResponse> => {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        webhook: true,
        connections: true,
      },
    });

    if (!workflow) {
      console.error("Workflow not found");
      return {
        executionId: null,
        results: null,
      };
    }

    const { nodes, connections } = workflow;
    const triggerNode = nodes.find((n) => n.type === "TRIGGER");

    if (!triggerNode) {
      console.error("No trigger node found");
      return {
        executionId: null,
        results: null,
      };
    }

    const workflowExecution = await prisma.workflowExecution.create({
      data: {
        status: "RUNNING",
        workflowId,
        userId,
      },
    });

    const results: Record<string, NodeResult> = {};
    const executed = new Set<string>();
    const queue: string[] = [triggerNode.id];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      console.log(`Executing node: ${JSON.stringify(node)} (${node.type})`);

      const nodeExecution = await prisma.workflowNodeExecution.create({
        data: {
          nodeId: node.id,
          status: "RUNNING",
          executionId: workflowExecution.id,
        },
      });

      console.log(node);

      const output = await executeNode(node, results, userId);
      results[node.id] = output;
      executed.add(node.id);

      if (!output.success) {
        await prisma.workflowNodeExecution.update({
          where: {
            id: nodeExecution.id,
          },
          data: {
            error: output.result,
            status: "FAILED",
            finishedAt: new Date(),
          },
        });
        await prisma.workflowExecution.update({
          where: {
            id: workflowExecution.id,
          },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
          },
        });
        await publisher.publish(
          `workflow:${workflowId}`,
          JSON.stringify({
            type: "ERROR",
            message: output.result,
            nodeId: node.id,
          }),
        );
        break;
      }

      await prisma.workflowNodeExecution.update({
        where: {
          id: nodeExecution.id,
        },
        data: {
          result: output.result,
          status: "SUCCESS",
          finishedAt: new Date(),
        },
      });

      await publisher.publish(
        `workflow:${workflowId}`,
        JSON.stringify({
          type: node.type === "TRIGGER" ? "TRIGGER_EXECUTED" : "NODE_EXECUTED",
          message: output.result,
          nodeId: node.id,
        }),
      );

      const outgoing = connections.filter((c) => c.sourceId === node.id);
      for (const conn of outgoing) {
        const targetParents = connections
          .filter((c) => c.targetId === conn.targetId)
          .map((node) => node.sourceId);

        if (targetParents.every((pid) => executed.has(pid))) {
          queue.push(conn.targetId);
        }
      }
    }
    console.log("Workflow execution finished", results);
    return {
      executionId: workflowExecution.id,
      results,
    };
  } catch (error) {
    console.error("Error in runWorkerFlow:", error);
    return {
      executionId: null,
      results: null,
    };
  }
};

const publisher = redisclient.duplicate();

async function executeNode(
  node: any,
  results: Record<string, NodeResult>,
  userId: string,
): Promise<{
  success: boolean;
  result: any;
}> {
  switch (node.type) {
    case "TRIGGER":
      switch (node.triggerType) {
        case "MANUAL":
          return { success: true, result: "manually triggered" };
        case "WEBHOOK":
          return { success: true, result: "webhook triggered" };
      }
      break;

    case "ACTION": {
      switch (node.actionPlatform) {
        case "TELEGRAM":
          const res1 = await sendTelegramMessage(node, userId);
          return { success: res1.success, result: res1.message };

        case "RESEND":
          const res2 = await sendResendEmail(node, userId);
          return { success: res2.success, result: res2.message };

        case "HTTP_REQUEST":
          const res3 = await sendHttpRequest(node);
          return { success: res3.success, result: res3.message };
      }
      break;
    }

    default:
      console.warn(`Unknown node type: ${node.type}`);
      return { success: false, result: null };
  }

  return {
    success: false,
    result: null,
  };
}

const worker = new Worker(
  "workflow-executions",
  async (job) => {
    const { workflowId, userId } = job.data;
    console.log("Processing execution", workflowId, "for user", userId);

    const { executionId, results } = await runWorkerFlow(workflowId, userId);

    if (!executionId) {
      console.error("Execution did not start properly");
      return;
    }

    const nodeResults = Object.values(results || {});
    const isFailed = nodeResults.some((res) => res.success === false);

    await prisma.workflowExecution.update({
      where: {
        id: executionId,
      },
      data: {
        status: isFailed ? "FAILED" : "SUCCESS",
        finishedAt: new Date(),
      },
    });
  },
  { connection: redisclient, concurrency: 50 },
);

worker.on("completed", async (job) => {
  console.log("Workflow completed:", job.id);
  await publisher.publish(
    `workflow:${job.data.workflowId}`,
    JSON.stringify({
      type: "COMPLETED",
    }),
  );
});

worker.on("error", async (error) => {
  console.error("Worker error:", error.message);
});
