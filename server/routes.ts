import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBoxTypeSchema, insertProductSchema, insertCustomerSchema, insertOrderSchema, insertOrderItemSchema, insertContactMessageSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default data
  await initializeDefaultData();

  // Box Types API
  app.get("/api/box-types", async (req, res) => {
    try {
      const boxTypes = await storage.getBoxTypes();
      res.json(boxTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch box types" });
    }
  });

  app.post("/api/box-types", async (req, res) => {
    try {
      const boxType = insertBoxTypeSchema.parse(req.body);
      const newBoxType = await storage.createBoxType(boxType);
      res.json(newBoxType);
    } catch (error) {
      res.status(400).json({ message: "Invalid box type data" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { category, available } = req.query;
      let products;

      if (available === "true") {
        products = await storage.getAvailableProducts();
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getProducts();
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(product);
      res.json(newProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedProduct = await storage.updateProduct(id, updates);

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  // Orders API
  const createOrderSchema = z.object({
    customer: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      address: z.string(),
      city: z.string(),
    }),
    boxTypeId: z.number(),
    totalAmount: z.string(),
    paymentMethod: z.enum(["easypaisa", "jazzcash"]),
    specialInstructions: z.string().optional(),
    items: z.array(z.object({
      productId: z.number(),
      quantity: z.string(),
      unitPrice: z.string(),
    })),
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = createOrderSchema.parse(req.body);

      // Create or get customer
      let customer = await storage.getCustomerByEmail(orderData.customer.email);
      if (!customer) {
        customer = await storage.createCustomer(orderData.customer);
      }

      // Create order
      const order = await storage.createOrder({
        customerId: customer.id,
        boxTypeId: orderData.boxTypeId,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        specialInstructions: orderData.specialInstructions,
        orderStatus: "pending",
        paymentStatus: "pending",
      });

      // Create order items
      const orderItems = await storage.createOrderItems(
        orderData.items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      );

      res.json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updatedOrder = await storage.updateOrderStatus(id, status);

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: "Failed to update order status" });
    }
  });

  app.put("/api/orders/:id/payment", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updatedOrder = await storage.updatePaymentStatus(id, status);

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: "Failed to update payment status" });
    }
  });

  // Contact Messages API
  app.post("/api/contact", async (req, res) => {
    try {
      const message = insertContactMessageSchema.parse(req.body);
      const newMessage = await storage.createContactMessage(message);
      res.json(newMessage);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact message data" });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Statistics API
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Payment API (stub for now - would integrate with actual payment gateways)
  app.post("/api/payment/easypaisa", async (req, res) => {
    try {
      const { orderId, amount, phone } = req.body;

      // Simulate payment processing
      // In production, this would integrate with Easypaisa API
      setTimeout(async () => {
        await storage.updatePaymentStatus(orderId, "completed");
      }, 2000);

      res.json({
        success: true,
        transactionId: `EP${Date.now()}`,
        message: "Payment processed successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post("/api/payment/jazzcash", async (req, res) => {
    try {
      const { orderId, amount, phone } = req.body;

      // Simulate payment processing
      // In production, this would integrate with JazzCash API
      setTimeout(async () => {
        await storage.updatePaymentStatus(orderId, "completed");
      }, 2000);

      res.json({
        success: true,
        transactionId: `JC${Date.now()}`,
        message: "Payment processed successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDefaultData() {
  try {
    // Initialize box types
    const existingBoxTypes = await storage.getBoxTypes();
    if (existingBoxTypes.length === 0) {
      await storage.createBoxType({
        name: "Small Box",
        price: "799.00",
        itemsLimit: 3,
        description: "Perfect for 1-2 people, 2-3 premium items",
        isActive: true,
      });

      await storage.createBoxType({
        name: "Medium Box",
        price: "1399.00",
        itemsLimit: 6,
        description: "Great for families, 4-6 premium items",
        isActive: true,
      });

      await storage.createBoxType({
        name: "Large Box",
        price: "1999.00",
        itemsLimit: 10,
        description: "Perfect for large families, 7-10 premium items",
        isActive: true,
      });
    }

    // Initialize sample products
    const existingProducts = await storage.getProducts();
    if (existingProducts.length === 0) {
      const sampleProducts = [
        // Fruits
        { name: "Fresh Apples", category: "fruit", price: "150.00", unit: "kg", description: "Sweet and crispy red apples", isAvailable: true },
        { name: "Bananas", category: "fruit", price: "80.00", unit: "dozen", description: "Fresh yellow bananas", isAvailable: true },
        { name: "Oranges", category: "fruit", price: "120.00", unit: "kg", description: "Juicy Valencia oranges", isAvailable: true },
        { name: "Mangoes", category: "fruit", price: "200.00", unit: "kg", description: "Sweet Pakistani mangoes", isAvailable: true },
        { name: "Grapes", category: "fruit", price: "180.00", unit: "kg", description: "Fresh green grapes", isAvailable: true },

        // Vegetables
        { name: "Tomatoes", category: "vegetable", price: "60.00", unit: "kg", description: "Fresh red tomatoes", isAvailable: true },
        { name: "Onions", category: "vegetable", price: "40.00", unit: "kg", description: "Fresh white onions", isAvailable: true },
        { name: "Potatoes", category: "vegetable", price: "35.00", unit: "kg", description: "Fresh potatoes", isAvailable: true },
        { name: "Carrots", category: "vegetable", price: "70.00", unit: "kg", description: "Fresh orange carrots", isAvailable: true },
        { name: "Spinach", category: "vegetable", price: "30.00", unit: "bunch", description: "Fresh green spinach", isAvailable: true },
        { name: "Lettuce", category: "vegetable", price: "45.00", unit: "head", description: "Fresh iceberg lettuce", isAvailable: true },
        { name: "Bell Peppers", category: "vegetable", price: "90.00", unit: "kg", description: "Fresh colorful bell peppers", isAvailable: true },
      ];

      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }
    }
  } catch (error) {
    console.error("Failed to initialize default data:", error);
  }
}
