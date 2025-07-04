import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import express, { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
//import { nanoid } from "nanoid";
import dotenv from "dotenv";
dotenv.config();

// Polyfill __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // const serverOptions = {
  //   middlewareMode: true,
  //   hmr: { server },
  //   allowedHosts: true,
  // };

  const vite = await createViteServer({
    // ...viteConfig,
    //configFile: false,
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    root: path.resolve(__dirname, "..", "client"),
    customLogger: viteLogger,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
    // customLogger: {
    //   ...viteLogger,
    //   error: (msg, options) => {
    //     viteLogger.error(msg, options);
    //     process.exit(1);
    //   },
    // },
    // server: serverOptions,
  });

  app.use(vite.middlewares);
  // app.use("*", async (req, res, next) => {
  //app.use(/^\/(?!src\/|@fs\/|node_modules\/|assets\/).*$/, async (req, res, next) => {
  //const url = req.originalUrl;

  app.use("*", async (req, res, next) => {
    // if (req.method !== "GET" || req.originalUrl.includes(".")) {
    //   // If it's not a GET or has a dot (like .js, .css, .png), let Vite handle it
    //   return next();
    // }

    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      // if (process.env.NODE_ENV === "production") {
      //   template = template.replace(
      //     `src="/src/main.tsx"`,
      //     `src="/src/main.tsx?v=${Date.now()}`,
      //     // `src="/src/main.tsx?v=${nanoid()}"`,
      //   );
      // }
      //const page = await vite.transformIndexHtml(url, template);
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
      //res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  //app.use("*", (_req, res) => {
  app.use(/^\/(?!src\/|@fs\/|node_modules\/|assets\/).*$/, async (req, res, next) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
