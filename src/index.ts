import { serve, type ServerWebSocket } from "bun";
import index from "./index.html";
type toSend = {
  text: string;
  mine: boolean;
}
const clients = new Set<ServerWebSocket<unknown>>();
const server = serve({
  hostname: "0.0.0.0",
  port: 3000,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    "/chat": req => {
      if (server.upgrade(req)) {
        return;
      }

      return new Response("ugarde failed", { status: 500 });
    }

  },

  websocket: {
    open(ws) {
      console.log("client connected");
      console.log(clients.size);
      clients.add(ws);
    },

    message(ws, message) {
      const text = message.toString();
      console.log("received:", text);
      // send to all connected users
      for (const client of clients) {

        const toSend: toSend = {
          text,
          mine: client === ws,
        };

        client.send(JSON.stringify(toSend));
      }
    },

    close(ws) {
      console.log("client disconnected");

      clients.delete(ws);
    },
  },
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
