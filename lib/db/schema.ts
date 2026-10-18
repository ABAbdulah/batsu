// Database schema (plan §3.2). Prices are integer PKR. Order lines snapshot title/size/price so
// later catalogue edits never rewrite past orders. Better Auth tables live in ./auth-schema.ts.
import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSequence,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export type ImageJson = { src: string; width: number; height: number; alt: string };
export type DetailJson = { label: string; value: string };
export type AddressJson = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postal?: string;
};

export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);
export const imageKind = pgEnum("image_kind", ["lifestyle", "flat", "detail"]);
export const paymentMethod = pgEnum("payment_method", ["cod", "online"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const fulfillmentStatus = pgEnum("fulfillment_status", [
  "unconfirmed",
  "confirmed",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  title: text("title").notNull(),
  navLabel: text("nav_label"),
  tagline: text("tagline"),
  description: text("description"),
  heroImage: jsonb("hero_image").$type<ImageJson>(),
  /** Dark editorial tile inside the grid. */
  feature: jsonb("feature").$type<{ productHandle: string; imageIndex: number; text: string; emphasis: string; rest: string }>(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    handle: text("handle").notNull().unique(),
    title: text("title").notNull(),
    mythLine: text("myth_line"),
    mythShort: text("myth_short"),
    description: jsonb("description").$type<string[]>().notNull().default([]),
    details: jsonb("details_json").$type<DetailJson[]>().notNull().default([]),
    fitNote: text("fit_note"),
    sizeChart: jsonb("size_chart").$type<ImageJson>(),
    pricePkr: integer("price_pkr").notNull(),
    compareAtPkr: integer("compare_at_pkr"),
    status: productStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [index("products_status_idx").on(t.status)]
);

export const productCollections = pgTable(
  "product_collections",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.collectionId] })]
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("blob_url").notNull(),
    alt: text("alt").notNull().default(""),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    blurDataUrl: text("blur_data_url"),
    position: integer("position").notNull().default(0),
    kind: imageKind("kind").notNull().default("lifestyle"),
  },
  (t) => [index("product_images_product_idx").on(t.productId, t.position)]
);

export const variants = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    sku: text("sku").notNull().unique(),
    stock: integer("stock").notNull().default(0),
    position: integer("position").notNull().default(0),
  },
  (t) => [uniqueIndex("variants_product_size_idx").on(t.productId, t.size)]
);

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  token: text("token").notNull().unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: integer("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.cartId, t.variantId] })]
);

export const orderNumberSeq = pgSequence("order_number_seq", { startWith: 1001 });

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number")
      .notNull()
      .unique()
      .default(sql`'BT' || nextval('order_number_seq')`),
    userId: text("user_id"),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    shippingAddress: jsonb("shipping_address_json").$type<AddressJson>().notNull(),
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull(),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),
    discountCode: text("discount_code"),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentStatus: paymentStatus("payment_status").notNull().default("pending"),
    fulfillmentStatus: fulfillmentStatus("fulfillment_status").notNull().default("unconfirmed"),
    trackingNumber: text("tracking_number"),
    courier: text("courier"),
    metaEventId: text("meta_event_id"),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [index("orders_user_idx").on(t.userId), index("orders_email_idx").on(t.email)]
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").references(() => variants.id, { onDelete: "set null" }),
  productHandle: text("product_handle").notNull(),
  titleSnapshot: text("title_snapshot").notNull(),
  sizeSnapshot: text("size_snapshot").notNull(),
  priceSnapshot: integer("price_snapshot").notNull(),
  imageSnapshot: text("image_snapshot"),
  qty: integer("qty").notNull(),
});

/** Status timeline shown on the account and tracking pages. */
export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  /** Gateway's own reference; unique so a replayed webhook can't apply twice. */
  providerRef: text("provider_ref").notNull().unique(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  raw: jsonb("raw_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postal: text("postal"),
  isDefault: boolean("is_default").notNull().default(false),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  email: text("email").primaryKey(),
  source: text("source").notNull(),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull().defaultNow(),
  /** Members get 24h early access to drops (plan §5C). */
  earlyAccess: boolean("early_access").notNull().default(false),
});

export const discountCodes = pgTable("discount_codes", {
  code: text("code").primaryKey(),
  type: text("type", { enum: ["percent", "fixed", "free_shipping"] }).notNull(),
  value: integer("value").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
});

/** First-party analytics (plan §5A) for the Phase 2 "Top products" dashboard. */
export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
    productHandle: text("product_handle"),
    sessionId: text("session_id"),
    userId: text("user_id"),
    props: jsonb("props"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_name_created_idx").on(t.name, t.createdAt), index("events_product_idx").on(t.productHandle)]
);

/** Store settings edited in the Phase 2 admin. One row per key; value shape per key in lib/settings. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
