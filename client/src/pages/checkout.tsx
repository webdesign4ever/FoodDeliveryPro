import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { BoxType, Product, CartItem, Customer, OrderData } from "@/lib/types";
import { Download, FileText, ArrowLeft } from "lucide-react";

const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(11, "Valid phone number is required"),
  address: z.string().min(10, "Complete address is required"),
  city: z.string().min(1, "City is required"),
  paymentMethod: z.enum(["easypaisa", "jazzcash"]),
  specialInstructions: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Receipt {
  id: number;
  orderNumber: string;
  customer: Customer;
  boxType: BoxType;
  items: CartItem[];
  subtotal: string;
  boxPrice: string;
  total: string;
  paymentMethod: string;
  orderDate: string;
  deliveryDate: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get cart data from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const boxId = urlParams.get('boxId');
  const cartData = localStorage.getItem('cartItems');
  const cartItems: CartItem[] = cartData ? JSON.parse(cartData) : [];

  const { data: boxTypes = [] } = useQuery<BoxType[]>({
    queryKey: ["/api/box-types"],
  });

  const selectedBox = boxTypes.find(box => box.id === parseInt(boxId || '0'));

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      paymentMethod: "easypaisa",
      specialInstructions: "",
    },
  });

  const calculateTotal = () => {
    // Only calculate the cost of added items, no box price
    return cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderData) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      const newReceipt: Receipt = {
        id: data.id,
        orderNumber: `FB${String(data.id).padStart(6, '0')}`,
        customer: {
          firstName: form.getValues('firstName'),
          lastName: form.getValues('lastName'),
          email: form.getValues('email'),
          phone: form.getValues('phone'),
          address: form.getValues('address'),
          city: form.getValues('city'),
        },
        boxType: selectedBox!,
        items: cartItems,
        subtotal: calculateSubtotal(),
        boxPrice: "0.00",
        total: calculateTotal(),
        paymentMethod: form.getValues('paymentMethod'),
        orderDate: new Date().toLocaleDateString(),
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      };
      
      setReceipt(newReceipt);
      localStorage.removeItem('cartItems');
      
      // Invalidate stats cache to update counters on home page
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your fresh box order has been confirmed.",
      });
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (!selectedBox || cartItems.length === 0) {
      toast({
        title: "Invalid Order",
        description: "Please add items to your cart first.",
        variant: "destructive",
      });
      return;
    }

    const orderData: OrderData = {
      customer: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
      },
      boxTypeId: selectedBox.id,
      totalAmount: calculateTotal(),
      paymentMethod: data.paymentMethod,
      specialInstructions: data.specialInstructions,
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity.toString(),
        unitPrice: item.product.price,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const generatePDF = async () => {
    if (!receipt) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create a print window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }
      
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FreshBox Receipt - ${receipt.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { color: #22c55e; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .order-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            .items-table th { background: #f1f5f9; }
            .total-section { border-top: 2px solid #22c55e; padding-top: 15px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .final-total { font-size: 18px; font-weight: bold; color: #22c55e; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🥬 FreshBox</div>
            <h2>Order Receipt</h2>
            <p>Thank you for choosing fresh, organic produce!</p>
          </div>
          
          <div class="order-info">
            <h3>Order Information</h3>
            <p><strong>Order Number:</strong> ${receipt.orderNumber}</p>
            <p><strong>Order Date:</strong> ${receipt.orderDate}</p>
            <p><strong>Estimated Delivery:</strong> ${receipt.deliveryDate}</p>
            <p><strong>Payment Method:</strong> ${receipt.paymentMethod.toUpperCase()}</p>
          </div>
          
          <div class="customer-info">
            <h3>Delivery Information</h3>
            <p><strong>Name:</strong> ${receipt.customer.firstName} ${receipt.customer.lastName}</p>
            <p><strong>Email:</strong> ${receipt.customer.email}</p>
            <p><strong>Phone:</strong> ${receipt.customer.phone}</p>
            <p><strong>Address:</strong> ${receipt.customer.address}, ${receipt.customer.city}</p>
          </div>
          
          <h3>Order Details</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${receipt.boxType.name}</strong></td>
                <td>1</td>
                <td>Rs. ${receipt.boxPrice}</td>
                <td>Rs. ${receipt.boxPrice}</td>
              </tr>
              ${receipt.items.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.quantity} ${item.product.unit}</td>
                  <td>Rs. ${item.product.price}</td>
                  <td>Rs. ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Items Subtotal:</span>
              <span>Rs. ${receipt.subtotal}</span>
            </div>
            <div class="total-row final-total">
              <span>Total Amount:</span>
              <span>Rs. ${receipt.total}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>🌱 Fresh • Organic • Delivered to Your Door</p>
            <p>Contact us: info@freshbox.pk | +92-300-FRESHBOX</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!selectedBox || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-light-green-tint py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold dark-text mb-4">No Items in Cart</h2>
              <p className="text-gray-600 mb-6">Please add items to your cart before proceeding to checkout.</p>
              <Button onClick={() => setLocation('/products')} className="bg-fresh-green text-white hover:bg-fresh-green/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (receipt) {
    return (
      <div className="min-h-screen bg-light-green-tint py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold fresh-green">🥬 FreshBox</CardTitle>
              <p className="text-xl font-semibold dark-text">Order Receipt</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Info */}
              <div className="bg-light-green-tint p-4 rounded-lg">
                <h3 className="font-semibold dark-text mb-2">Order Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Order Number:</span> {receipt.orderNumber}</p>
                  <p><span className="font-medium">Order Date:</span> {receipt.orderDate}</p>
                  <p><span className="font-medium">Estimated Delivery:</span> {receipt.deliveryDate}</p>
                  <p><span className="font-medium">Payment Method:</span> {receipt.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold dark-text mb-2">Delivery Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {receipt.customer.firstName} {receipt.customer.lastName}</p>
                  <p><span className="font-medium">Email:</span> {receipt.customer.email}</p>
                  <p><span className="font-medium">Phone:</span> {receipt.customer.phone}</p>
                  <p><span className="font-medium">Address:</span> {receipt.customer.address}, {receipt.customer.city}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold dark-text mb-2">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{receipt.boxType.name}</span>
                      <p className="text-sm text-gray-600">Box container</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs. {receipt.boxPrice}</p>
                      <p className="text-sm text-gray-600">Qty: 1</p>
                    </div>
                  </div>
                  
                  {receipt.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.product.name}</span>
                        <p className="text-sm text-gray-600">{item.product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs. {(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} {item.product.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>Rs. {receipt.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold fresh-green">
                    <span>Total Amount:</span>
                    <span>Rs. {receipt.total}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6">
                <Button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                  className="flex-1 bg-fresh-green text-white hover:bg-fresh-green/90"
                >
                  {isGeneratingPDF ? (
                    "Generating..."
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setLocation('/products')}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </div>

              <div className="text-center pt-6 border-t">
                <p className="text-gray-600">🌱 Thank you for choosing FreshBox!</p>
                <p className="text-sm text-gray-500 mt-1">Fresh • Organic • Delivered to Your Door</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-green-tint py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold dark-text mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your fresh box order</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      className="mt-1"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      className="mt-1"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="mt-1"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="03XX-XXXXXXX"
                    className="mt-1"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea
                    id="address"
                    {...form.register("address")}
                    placeholder="House/Flat number, Street, Area"
                    className="mt-1"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    className="mt-1"
                  />
                  {form.formState.errors.city && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={form.watch("paymentMethod")}
                    onValueChange={(value) => form.setValue("paymentMethod", value as "easypaisa" | "jazzcash")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easypaisa">Easypaisa</SelectItem>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    {...form.register("specialInstructions")}
                    placeholder="Any special delivery instructions"
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-fresh-green text-white hover:bg-fresh-green/90"
                >
                  {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-light-green-tint rounded">
                  <div>
                    <span className="font-medium">{selectedBox.name}</span>
                  </div>
                  <span className="font-semibold text-gray-500">Container</span>
                </div>
                
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.product.name}</span>
                      <p className="text-sm text-gray-600">{item.quantity} {item.product.unit}</p>
                    </div>
                    <span className="font-semibold">Rs. {(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>Rs. {calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold fresh-green">
                    <span>Total:</span>
                    <span>Rs. {calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setLocation('/products')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}