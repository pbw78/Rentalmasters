# Shared Schema Backup - RentalMaster

## shared/schema.ts
```typescript
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  address: text("address").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // apartment, house, office, etc.
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: decimal("area", { precision: 10, scale: 2 }), // in square meters
  rent: decimal("rent", { precision: 10, scale: 2 }).notNull(), // monthly rent
  deposit: decimal("deposit", { precision: 10, scale: 2 }),
  description: text("description"),
  amenities: text("amenities").array(),
  status: varchar("status", { length: 20 }).default("available"), // available, rented, maintenance
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenants table
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  birthDate: varchar("birth_date"),
  nationalId: varchar("national_id", { length: 50 }),
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  startDate: varchar("start_date").notNull(),
  endDate: varchar("end_date").notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  deposit: decimal("deposit", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("active"), // active, expired, terminated
  terms: text("terms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: varchar("payment_date").notNull(),
  dueDate: varchar("due_date"),
  paymentMethod: varchar("payment_method", { length: 50 }), // cash, bank_transfer, card, etc.
  reference: varchar("reference", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, failed
  type: varchar("type", { length: 50 }).default("rent"), // rent, deposit, utilities, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service requests table
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id").references(() => tenants.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }), // plumbing, electrical, heating, etc.
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  status: varchar("status", { length: 20 }).default("open"), // open, in_progress, completed, cancelled
  assignedTo: varchar("assigned_to", { length: 255 }),
  completedDate: varchar("completed_date"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  contracts: many(contracts),
  serviceRequests: many(serviceRequests),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  contracts: many(contracts),
  serviceRequests: many(serviceRequests),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  property: one(properties, {
    fields: [contracts.propertyId],
    references: [properties.id],
  }),
  tenant: one(tenants, {
    fields: [contracts.tenantId],
    references: [tenants.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  contract: one(contracts, {
    fields: [payments.contractId],
    references: [contracts.id],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  property: one(properties, {
    fields: [serviceRequests.propertyId],
    references: [properties.id],
  }),
  tenant: one(tenants, {
    fields: [serviceRequests.tenantId],
    references: [tenants.id],
  }),
}));

// Insert schemas
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;

// Relations types
export type PropertyWithRelations = Property & {
  contracts?: Contract[];
  serviceRequests?: ServiceRequest[];
};

export type TenantWithRelations = Tenant & {
  contracts?: Contract[];
  serviceRequests?: ServiceRequest[];
};

export type ContractWithRelations = Contract & {
  property?: Property;
  tenant?: Tenant;
  payments?: Payment[];
};

export type PaymentWithRelations = Payment & {
  contract?: ContractWithRelations;
};

export type ServiceRequestWithRelations = ServiceRequest & {
  property?: Property;
  tenant?: Tenant;
};
```