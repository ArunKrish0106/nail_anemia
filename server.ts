import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use a proxy for the FastAPI backend if it's running
  // In a real production setup, FastAPI would run on 8000
  app.get("/test-path", (req, res) => {
    res.json({ status: "ok", msg: "Express is reachable" });
  });

  app.use(
    "/diag-api",
    createProxyMiddleware({
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
      pathRewrite: {
        "^/diag-api": "",
      },
      on: {
        error: (err, req, res) => {
          console.error("Proxy Error:", err);
          if ('status' in res) {
            (res as any).status(502).json({ error: "ML Backend not reachable. Ensure Python server is running on port 8000." });
          }
        },
        proxyRes: (proxyRes, req, res) => {
          if (proxyRes.statusCode === 401) {
            console.error(`[Proxy] 401 Unauthorized received for: ${req.url}`);
          }
          console.log(`[Proxy] Response: ${proxyRes.statusCode} for ${req.url}`);
        },
        proxyReq: (proxyReq, req, res) => {
          console.log(`[Proxy] Request to: ${req.url}`);
        }
      }
    })
  );

  // Serve static assets or use Vite in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Attempt to spawn the Python FastAPI backend
  // Note: This requires python3 and the requirements installed in the environment.
  const logFile = path.join(process.cwd(), "python_logs.txt");
  const fs = await import("fs");
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // --- Python Connectivity Check ---
  const pythonCommands = ["python3", "python", "python3.11", "python3.10"];
  logStream.write(`\n--- Environment Check at ${new Date().toISOString()} ---\n`);
  
  for (const cmd of pythonCommands) {
    try {
      const check = spawn(cmd, ["--version"]);
      check.stdout.on("data", (data) => logStream.write(`[Check ${cmd} STDOUT]: ${data}`));
      check.stderr.on("data", (data) => logStream.write(`[Check ${cmd} STDERR]: ${data}`));
      check.on("error", (err) => logStream.write(`[Check ${cmd} FAILED]: ${err.message}\n`));
    } catch (e) {
      logStream.write(`[Check ${cmd} EXCEPTION]: ${e}\n`);
    }
  }
  // --- End Check ---

  // 1. Try to install requirements
  const installProcess = spawn("python3", ["-m", "pip", "install", "-r", "backend/requirements.txt"]);
  
  installProcess.stdout.on("data", (data) => logStream.write(`[Pip STDOUT]: ${data}`));
  installProcess.stderr.on("data", (data) => logStream.write(`[Pip STDERR]: ${data}`));
  
  installProcess.on("close", (code) => {
    logStream.write(`[Pip Exit]: code ${code}\n`);
    
    // 2. Start the actual backend
    logStream.write(`\n--- Starting Python Backend at ${new Date().toISOString()} ---\n`);
    const pythonProcess = spawn("python3", ["-m", "uvicorn", "backend.api.app:app", "--host", "0.0.0.0", "--port", "8000"]);

    pythonProcess.stdout.on("data", (data) => {
      const msg = `[Python STDOUT]: ${data}`;
      console.log(msg);
      logStream.write(msg);
    });

    pythonProcess.stderr.on("data", (data) => {
      const msg = `[Python STDERR]: ${data}`;
      console.error(msg);
      logStream.write(msg);
    });

    pythonProcess.on("close", (code) => {
      const msg = `[Python Exit]: Process exited with code ${code}\n`;
      logStream.write(msg);
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Main Web Server running on http://localhost:${PORT}`);
    console.log(`Proxying /api/ml to FastAPI on port 8000`);
  });
}

startServer();
