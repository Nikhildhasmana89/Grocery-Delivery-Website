import axios from "axios";

async function emitEventHandler(
  event: string,
  data: unknown,
  socketId?: string,
) {
  const socketServerUrl =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  console.log("================================");
  console.log("📡 SOCKET NOTIFICATION");
  console.log("Server:", socketServerUrl);
  console.log("Event:", event);
  console.log("Socket ID:", socketId);
  console.log("Data:", data);
  console.log("================================");

  if (!socketServerUrl) {
    console.error(
      "❌ NEXT_PUBLIC_SOCKET_SERVER_URL is missing",
    );

    return false;
  }

  if (!socketId) {
    console.error(
      "❌ Socket ID is missing",
    );

    return false;
  }

  try {
    const response = await axios.post(
      `${socketServerUrl}/notify`,
      {
        socketId,
        event,
        data,
      },
      {
        timeout: 3000,
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

      console.error(
        "URL:",
        `${socketServerUrl}/notify`,
      );

      console.error(
        "Status:",
        error.response?.status,
      );

      console.error(
        "Response:",
        error.response?.data,
      );

      console.error(
        "Message:",
        error.message,
      );
    } else {
      console.error(
        "❌ Socket notification error:",
        error,
      );
    }

    return false;
  }
}

export default emitEventHandler;