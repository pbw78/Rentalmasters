import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code"),
  propertyType: text("property_type").notNull(), // apartment, house, studio, loft
  area: integer("area"), // in m²
  rooms: integer("rooms"),
  bathrooms: integer("bathrooms"),
  floor: integer("floor"),
  totalFloors: integer("total_floors"),
  rent: decimal("rent", { precision: 10, scale: 2 }).notNull(),
  deposit: decimal("deposit", { precision: 10, scale: 2 }),
  utilities: decimal("utilities", { precision: 10, scale: 2 }),
  description: text("description"),
  status: text("status").default("available"), // available, rented, maintenance, unavailable
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenants table
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  birthDate: date("birth_date"),
  nationalId: text("national_id"), // PESEL, SSN, etc.
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  deposit: decimal("deposit", { precision: 10, scale: 2 }),
  paymentDay: integer("payment_day").default(1), // day of month
  terms: text("terms"),
  status: text("status").default("active"), // active, expired, terminated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  dueDate: date("due_date").notNull(),
  paymentMethod: text("payment_method"), // transfer, cash, card
  status: text("status").default("pending"), // pending, paid, overdue
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service requests table
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"), // plumbing, electrical, heating, general
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("open"), // open, in_progress, completed, cancelled
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  assignedTo: text("assigned_to"), // service provider name
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
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

// Extended types with relations
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
