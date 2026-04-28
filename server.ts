import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import * as dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/ping", (req, res) => {
    res.json({ 
      pong: true, 
      time: new Date().toISOString(),
      env: { 
        hasResendKey: !!process.env.RESEND_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0
      } 
    });
  });

  // Lazy initialization of Resend
  let resend: Resend | null = null;
  const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY no está configurada");
    }
    if (!resend) {
      resend = new Resend(key);
    }
    return resend;
  };

  // API route for suggestions
  app.post("/api/suggestion", async (req, res) => {
    console.log("POST /api/suggestion hit:", req.body);
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email y mensaje son obligatorios" });
    }

    try {
      const client = getResend();
      const { data, error } = await client.emails.send({
        from: "CalculApp Suggestion <onboarding@resend.dev>",
        to: ["bautista.cancino@gmail.com"],
        subject: "Nueva Sugerencia - CalculApp.pro",
        replyTo: email,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #334155;">
            <h2 style="color: #0ea5e9;">Nueva Sugerencia Recibida</h2>
            <p><strong>De:</strong> ${email}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              Enviado desde el formulario de sugerencias de CalculApp.pro
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return res.status(error.name === 'validation_error' ? 400 : 500).json({ 
          error: error.message || "Error al enviar el correo a través de Resend" 
        });
      }

      console.log("Email sent successfully:", data);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error("Server Internal Error:", err);
      res.status(500).json({ error: err.message || "Error interno del servidor" });
    }
  });

  // Catch-all for API routes to prevent falling back to SPA for missing API endpoints
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `La ruta API ${req.method} ${req.url} no existe.` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Global Error:", err);
    res.status(500).json({ error: "Un error inesperado ocurrió en el servidor." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
