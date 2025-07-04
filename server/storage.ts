import {
  users, boxTypes, products, customers, orders, orderItems, contactMessages,
  type User, type InsertUser, type BoxType, type InsertBoxType,
  type Product, type InsertProduct, type Customer, type InsertCustomer,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type ContactMessage, type InsertContactMessage
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Box Types
  getBoxTypes(): Promise<BoxType[]>;
  createBoxType(boxType: InsertBoxType): Promise<BoxType>;
  updateBoxType(id: number, boxType: Partial<InsertBoxType>): Promise<BoxType | undefined>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getAvailableProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Customers
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(orderItems: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrders(): Promise<(Order & { customer: Customer; boxType: BoxType; orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrderById(id: number): Promise<(Order & { customer: Customer; boxType: BoxType; orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Order | undefined>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  markMessageAsReplied(id: number): Promise<ContactMessage | undefined>;

  // Statistics
  getOrderStats(): Promise<{ totalOrders: number; totalRevenue: string; totalCustomers: number; totalProducts: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getBoxTypes(): Promise<BoxType[]> {
    return await db.select().from(boxTypes).where(eq(boxTypes.isActive, true)).orderBy(boxTypes.price);
  }

  async createBoxType(boxType: InsertBoxType): Promise<BoxType> {
    const [newBoxType] = await db.insert(boxTypes).values(boxType).returning();
    return newBoxType;
  }

  async updateBoxType(id: number, boxType: Partial<InsertBoxType>): Promise<BoxType | undefined> {
    const [updated] = await db.update(boxTypes).set(boxType).where(eq(boxTypes.id, id)).returning();
    return updated || undefined;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.category, products.name);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category)).orderBy(products.name);
  }

  async getAvailableProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isAvailable, true)).orderBy(products.category, products.name);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItems(orderItemsData: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(orderItemsData).returning();
  }

  async getOrders(): Promise<(Order & { customer: Customer; boxType: BoxType; orderItems: (OrderItem & { product: Product })[] })[]> {
    const ordersWithDetails = await db.query.orders.findMany({
      with: {
        customer: true,
        boxType: true,
        orderItems: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });
    return ordersWithDetails;
  }

  async getOrderById(id: number): Promise<(Order & { customer: Customer; boxType: BoxType; orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const orderWithDetails = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        customer: true,
        boxType: true,
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });
    return orderWithDetails || undefined;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set({ paymentStatus: status }).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async markMessageAsReplied(id: number): Promise<ContactMessage | undefined> {
    const [updated] = await db.update(contactMessages).set({ isReplied: true }).where(eq(contactMessages.id, id)).returning();
    return updated || undefined;
  }

  async getOrderStats(): Promise<{ totalOrders: number; totalRevenue: string; totalCustomers: number; totalProducts: number }> {
    const [orderStats] = await db.select({
      totalOrders: sql<number>`count(*)`,
      totalRevenue: sql<string>`sum(${orders.totalAmount})`,
    }).from(orders);

    const [customerCount] = await db.select({
      totalCustomers: sql<number>`count(*)`,
    }).from(customers);

    const [productCount] = await db.select({
      totalProducts: sql<number>`count(*)`,
    }).from(products);

    return {
      totalOrders: orderStats.totalOrders || 0,
      totalRevenue: orderStats.totalRevenue || "0",
      totalCustomers: customerCount.totalCustomers || 0,
      totalProducts: productCount.totalProducts || 0,
    };
  }
}

export const storage = new DatabaseStorage();
