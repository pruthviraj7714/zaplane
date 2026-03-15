interface IResponse {
  success: boolean;
  message: string | object;
}

interface INode {
  id: string;
  type: "TRIGGER" | "ACTION";
  triggerType: "MANUAL" | "WEBHOOK" | "CRON" | null;
  actionPlatform: "TELEGRAM" | "RESEND" | "HTTP_REQUEST" | null;
  action: any;
  data: any;
  workflowId: string;
}

export const sendHttpRequest = async (node: INode): Promise<IResponse> => {
  try {
    console.log("Sending HTTP Request ...");

    const response = await fetch(node.data.url, {
      method: node.data.method,
      headers: JSON.parse(node.data.headers),
      body: node.data.body,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: response.statusText,
      };
    }

    return {
      success: true,
      message: {
        success: true,
        data: JSON.parse((data as any).data),
      },
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message: error.message,
    };
  }
};
