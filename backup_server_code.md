# Backend Code Backup - RentalMaster

## server/index.ts
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (body) {
    const duration = Date.now() - start;
    console.log(`${new Date().toLocaleTimeString()} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    if (res.statusCode >= 400) {
      console.log(`:: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }
    return originalSend.call(this, body);
  };

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Important: This comes after setupRoutes so the API routes are already registered
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
```

## server/routes.ts
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertPropertySchema,
  insertTenantSchema,
  insertContractSchema,
  insertPaymentSchema,
  insertServiceRequestSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Simple middleware to allow demo access
  const allowDemo = (req: any, res: any, next: any) => {
    if (req.session && req.session.demoUser) {
      req.user = { claims: { sub: "demo-user" } };
      return next();
    }
    return isAuthenticated(req, res, next);
  };

  // Test auth route for development
  app.get('/api/auth/demo-login', async (req: any, res) => {
    try {
      // Create or get demo user
      let user = await storage.getUser("demo-user");
      if (!user) {
        user = await storage.upsertUser({
          id: "demo-user",
          email: "demo@test.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        });
      }
      
      // Set session for demo user
      req.session.demoUser = true;
      req.session.userId = "demo-user";
      
      res.json(user);
    } catch (error) {
      console.error("Error in demo login:", error);
      res.status(500).json({ message: "Failed to create demo user" });
    }
  });

  // Auth routes  
  app.get('/api/auth/user', allowDemo, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", allowDemo, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Property routes
  app.get("/api/properties", allowDemo, async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", allowDemo, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const propertyData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, propertyData);
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProperty(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Tenant routes
  app.get("/api/tenants", allowDemo, async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  app.get("/api/tenants/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tenant = await storage.getTenant(id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });

  app.post("/api/tenants", allowDemo, async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);
      res.status(201).json(tenant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tenant data", errors: error.errors });
      }
      console.error("Error creating tenant:", error);
      res.status(500).json({ message: "Failed to create tenant" });
    }
  });

  app.put("/api/tenants/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tenantData = insertTenantSchema.partial().parse(req.body);
      const tenant = await storage.updateTenant(id, tenantData);
      res.json(tenant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tenant data", errors: error.errors });
      }
      console.error("Error updating tenant:", error);
      res.status(500).json({ message: "Failed to update tenant" });
    }
  });

  app.delete("/api/tenants/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTenant(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      res.status(500).json({ message: "Failed to delete tenant" });
    }
  });

  // Contract routes
  app.get("/api/contracts", allowDemo, async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/active", allowDemo, async (req, res) => {
    try {
      const contracts = await storage.getActiveContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching active contracts:", error);
      res.status(500).json({ message: "Failed to fetch active contracts" });
    }
  });

  app.get("/api/contracts/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contract = await storage.getContract(id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post("/api/contracts", allowDemo, async (req, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.put("/api/contracts/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contractData = insertContractSchema.partial().parse(req.body);
      const contract = await storage.updateContract(id, contractData);
      res.json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.error("Error updating contract:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  app.delete("/api/contracts/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContract(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract:", error);
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Payment routes
  app.get("/api/payments", allowDemo, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  app.get("/api/payments/contract/:contractId", allowDemo, async (req, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const payments = await storage.getPaymentsByContract(contractId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments by contract:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", allowDemo, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, paymentData);
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.delete("/api/payments/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePayment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Service request routes
  app.get("/api/service-requests", allowDemo, async (req, res) => {
    try {
      const serviceRequests = await storage.getServiceRequests();
      res.json(serviceRequests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.get("/api/service-requests/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceRequest = await storage.getServiceRequest(id);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }
      res.json(serviceRequest);
    } catch (error) {
      console.error("Error fetching service request:", error);
      res.status(500).json({ message: "Failed to fetch service request" });
    }
  });

  app.post("/api/service-requests", allowDemo, async (req, res) => {
    try {
      const serviceRequestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(serviceRequestData);
      res.status(201).json(serviceRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service request data", errors: error.errors });
      }
      console.error("Error creating service request:", error);
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.put("/api/service-requests/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceRequestData = insertServiceRequestSchema.partial().parse(req.body);
      const serviceRequest = await storage.updateServiceRequest(id, serviceRequestData);
      res.json(serviceRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service request data", errors: error.errors });
      }
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Failed to update service request" });
    }
  });

  app.delete("/api/service-requests/:id", allowDemo, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceRequest(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service request:", error);
      res.status(500).json({ message: "Failed to delete service request" });
    }
  });

  // Users routes (for admin panel)
  app.get("/api/users", allowDemo, async (req, res) => {
    try {
      // Mock users data for now - in production this would come from database
      const users = [
        {
          id: "demo-user",
          email: "demo@test.com",
          firstName: "Demo",
          lastName: "User",
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

## server/db.ts
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

## server/vite.ts
```typescript
import type { Express } from "express";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import type { Server } from "http";

export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  console.log(`${time} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server } },
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  app.use(express.static("dist/public"));
  app.use("*", (req, res) => {
    res.sendFile(resolve("dist/public/index.html"));
  });
}
```