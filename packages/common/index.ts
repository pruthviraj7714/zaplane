import { z } from "zod";

export const PlatformSchema = z.enum(["TELEGRAM", "RESEND", "HTTP_REQUEST"], {
  error: "Invalid platform",
});

export const HttpMethodSchema = z.enum(["GET", "POST"], {
  error: "Invalid HTTP method",
});

export const NodeTypeSchema = z.enum(["TRIGGER", "ACTION"], {
  error: "Invalid node type",
});

export const TriggerTypeSchema = z.enum(["MANUAL", "WEBHOOK", "CRON"], {
  error: "Invalid trigger type",
});

export const WorkflowExecutionStatusSchema = z.enum(
  ["RUNNING", "SUCCESS", "FAILED", "CANCELLED"],
  {
    error: "Invalid workflow execution status",
  },
);

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid ObjectId format",
});

export const UserSchema = z.object({
  id: ObjectIdSchema,
  email: z.email("Invalid email format"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const CreateUserSchema = UserSchema.omit({ id: true });

export const UpdateUserSchema = UserSchema.partial().omit({ id: true });

export const WebhookSchema = z.object({
  id: ObjectIdSchema,
  path: z.string().min(1, "Path is required"),
  method: HttpMethodSchema,
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  nodeId: ObjectIdSchema,
  workflowId: ObjectIdSchema,
});

export const CreateWebhookSchema = WebhookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  active: z.boolean().optional().default(true),
});

export const UpdateWebhookSchema = WebhookSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const BaseNodeSchema = z.object({
  type: NodeTypeSchema,
  triggerType: TriggerTypeSchema.nullable(),
  position: z.record(z.string(), z.number()),
  actionPlatform: PlatformSchema.nullable(),
  action: z.record(z.string(), z.any()).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const NewNodeSchema = BaseNodeSchema.extend({
  tempId: z.string(),
});

export const PrevNodeSchema = BaseNodeSchema.extend({
  id: z.string(),
});

export const NodeUnionSchema = z.union([NewNodeSchema, PrevNodeSchema]);

export const ConnectionSchema = z.object({
  sourceTempId: z.string(),
  targetTempId: z.string(),
});

export const NodeWithWebhookSchema = PrevNodeSchema.extend({
  webhook: WebhookSchema.optional(),
});

export const WorkflowSchema = z.object({
  title: z.string().min(1, "Title is required"),
  enabled: z.boolean(),
  nodes: z.array(NodeUnionSchema),
  connections: z.array(ConnectionSchema),
  workflowExecutions: z.array(z.any()),
});

export const CreateWorkflowSchema = WorkflowSchema.omit({
  workflowExecutions: true,
});

export const UpdateWorkflowSchema = WorkflowSchema.partial()
  .omit({
    workflowExecutions: true,
  })
  .extend({
    deletedNodeIds: z.array(z.string()),
  });

export const WorkflowWithNodesSchema = WorkflowSchema.extend({
  nodes: z.array(NodeWithWebhookSchema),
  webhook: WebhookSchema.optional(),
});

export const WorkflowExecutionsSchema = z.object({
  id: ObjectIdSchema,
  status: WorkflowExecutionStatusSchema,
  startedAt: z.date(),
  finishedAt: z.date().optional(),
  workflowId: ObjectIdSchema,
});

export const CreateWorkflowExecutionsSchema = WorkflowExecutionsSchema.omit({
  id: true,
  startedAt: true,
}).extend({
  startedAt: z.date().optional(),
});

export const UpdateWorkflowExecutionsSchema =
  WorkflowExecutionsSchema.partial().omit({
    id: true,
    startedAt: true,
  });

export const CredentialsSchema = z.object({
  id: ObjectIdSchema,
  platform: PlatformSchema,
  data: z.record(z.string(), z.any()),
});

export const CreateCredentialsSchema = CredentialsSchema.omit({
  id: true,
});

export const UpdateCredentialsSchema = CredentialsSchema.partial().omit({
  id: true,
  platform: true,
});

export const AvailableCredentialsApplicationsSchema = z.object({
  id: ObjectIdSchema,
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  platform: PlatformSchema,
});

export const CreateAvailableCredentialsApplicationsSchema =
  AvailableCredentialsApplicationsSchema.omit({
    id: true,
  });

export const UpdateAvailableCredentialsApplicationsSchema =
  AvailableCredentialsApplicationsSchema.partial().omit({
    id: true,
  });

export const UserWithRelationsSchema = UserSchema.extend({
  workflows: z.array(WorkflowSchema).optional(),
  credentials: z.array(CredentialsSchema).optional(),
});

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const UserQuerySchema = PaginationSchema.extend({
  email: z.string().optional(),
  username: z.string().optional(),
});

export const WorkflowQuerySchema = PaginationSchema.extend({
  title: z.string().optional(),
  enabled: z.coerce.boolean().optional(),
  userId: ObjectIdSchema.optional(),
});

export const NodeQuerySchema = PaginationSchema.extend({
  type: NodeTypeSchema.optional(),
  triggerType: TriggerTypeSchema.optional(),
  actionPlatform: PlatformSchema.optional(),
  workflowId: ObjectIdSchema.optional(),
});

export const CredentialsQuerySchema = PaginationSchema.extend({
  title: z.string().optional(),
  platform: PlatformSchema.optional(),
  userId: ObjectIdSchema.optional(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const PaginatedResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    items: z.array(z.any()),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});
