import axios from "axios";

async function emitEventHandler(
  event: string,
  data: any,
  socketId?: string
) {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/notify`,
      {
        socketId,
        event,
        data,
      }
    );
  } catch (error) {
    console.error("Socket event error:", error);
  }
}

export default emitEventHandler;