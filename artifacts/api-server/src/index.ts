import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

logger.info({ envPORT: process.env["PORT"], resolvedPort: port, nodeEnv: process.env["NODE_ENV"] }, "Starting server");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port, host: "0.0.0.0" }, "Server listening");
});
