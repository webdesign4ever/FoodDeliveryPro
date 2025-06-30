export interface BoxType {
  id: number;
  name: string;
  price: string;
  itemsLimit: number;
  description?: string;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  category: "fruit" | "vegetable";
  price: string;
  unit: string;
  imageUrl?: string;
  description?: string;
  isAvailable: boolean;
  nutritionInfo?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface OrderData {
  customer: Customer;
  boxTypeId: number;
  totalAmount: string;
  paymentMethod: "easypaisa" | "jazzcash";
  deliveryDate?: string;
  specialInstructions?: string;
  items: Array<{
    productId: number;
    quantity: string;
    unitPrice: string;
  }>;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: string;
  totalCustomers: number;
  totalProducts: number;
}
