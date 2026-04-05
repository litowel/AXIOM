import express from "express";
import { createServer as createViteServer } from "vite";
import { ethers } from "ethers";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/faucet", async (req, res) => {
    const { address, token, chainId } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    try {
      // Simulate a successful faucet request as requested by the user
      // since real public gateways require CAPTCHAs or API keys.
      const txHash = "0x15f266c00dd14069da0b20d2c68b798e2391d1603bc50120856dc72a4dcbabff";
      
      // Add a small delay to make it feel like a real network request
      await new Promise(resolve => setTimeout(resolve, 2000));

      res.json({ success: true, txHash });
    } catch (error: any) {
      console.error("Public gateway failed:", error.message);
      res.status(500).json({ error: error.message || "Public gateway blocked the request. Please try again later or use an alternative faucet." });
    }
  });

  // Vite middleware for development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
