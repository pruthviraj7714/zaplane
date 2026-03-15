import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import prisma from "@repo/db";
import type { WorkflowExecutionStatus } from "@repo/db/generated/prisma/enums";

const executionRouter = Router();

executionRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const pageNumber = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const status = req.query.status as WorkflowExecutionStatus;

    const skip = (pageNumber - 1) * limit;

    const workflowExecutions = await prisma.workflowExecution.findMany({
      where: {
        userId,
        ...(status === "FAILED" || status === "RUNNING" || status === "SUCCESS"
          ? { status }
          : {}),
      },
      include: {
        nodes: true,
        workflow: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: limit,
      skip,
    });

    const totalExecutions = await prisma.workflowExecution.count({
      where: {
        userId,
      },
    });

    const successCount = await prisma.workflowExecution.count({
      where: {
        userId,
        status: "SUCCESS",
      },
    });

    const failedCount = await prisma.workflowExecution.count({
      where: {
        userId,
        status: "FAILED",
      },
    });

    const runningCount = await prisma.workflowExecution.count({
      where: {
        userId,
        status: "RUNNING",
      },
    });

    res.status(200).json({
      executions: workflowExecutions,
      totalExecutions,
      page: pageNumber,
      limit,
      totalPages: Math.floor(totalExecutions / limit),
      successCount,
      failedCount,
      runningCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default executionRouter;
