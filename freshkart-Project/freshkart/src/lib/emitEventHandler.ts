import axios from "axios";

export interface EmitEventOptions {
  socketId?: string;
  userId?: string;
  room?: string;
}

/**
 * emitEventHandler supports three target types:
 * - string: treated as socketId
 * - { socketId, userId, room }: options object
 * - undefined: broadcast to all connected clients
 */
async function emitEventHandler(
  event: string,
  data: unknown,
  target?: string | EmitEventOptions,
) {
  const socketServerUrl =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  let payloadTarget: { socketId?: string; userId?: string; room?: string } = {};

  if (typeof target === "string") {
    payloadTarget = { socketId: target };
  } else if (target && typeof target === "object") {
    payloadTarget = target;
  }

  console.log("================================");
  console.log("📡 SOCKET NOTIFICATION");
  console.log("Server:", socketServerUrl);
  console.log("Event:", event);
  console.log("Target:", payloadTarget);
  console.log("Data:", data);
  console.log("================================");

  if (!socketServerUrl) {
    console.error(
      "❌ NEXT_PUBLIC_SOCKET_SERVER_URL is missing",
    );

    return false;
  }

  try {
    const response = await axios.post(
      `${socketServerUrl}/notify`,
      {
        ...payloadTarget,
        event,
        data,
      },
      {
        timeout: 2500,
      },
    );

    console.log(
      "✅ Socket server response:",
      response.status,
      response.data,
    );

    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Socket notification failed",
      );

      console.error("URL:", `${socketServerUrl}/notify`);

      console.error("Status:", error.response?.status);

      console.error("Response:", error.response?.data);

      console.error("Message:", error.message);
    } else {
      console.error("❌ Socket notification error:", error);
    }

    return false;
  }
}

export default emitEventHandler;