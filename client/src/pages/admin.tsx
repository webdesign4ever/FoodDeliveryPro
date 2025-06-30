import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminDashboard from "@/components/admin/admin-dashboard";
import OrdersTable from "@/components/admin/orders-table";
import { ShoppingCart, Users, DollarSign, Package, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderStats, Product, Order, Customer, BoxType } from "@/lib/types";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: stats, isLoading: statsLoading } = useQuery<OrderStats>({
    queryKey: ["/api/stats"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<
    (Order & { customer: Customer; boxType: BoxType; orderItems: any[] })[]
  >({
    queryKey: ["/api/orders"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/contact"],
  });

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter(order => order.orderStatus === "processing").length;
  const completedOrders = orders.filter(order => order.orderStatus === "delivered").length;

  const handleExportData = () => {
    // Create CSV content
    const csvContent = [
      ["Order ID", "Customer", "Email", "Phone", "Box Type", "Amount", "Payment Method", "Status", "Date"].join(","),
      ...orders.map(order => [
        `FB-${order.id.toString().padStart(3, "0")}`,
        `${order.customer.firstName} ${order.customer.lastName}`,
        order.customer.email,
        order.customer.phone,
        order.boxType.name,
        `Rs. ${order.totalAmount}`,
        order.paymentMethod,
        order.orderStatus,
        new Date(order.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freshbox-orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (statsLoading || ordersLoading || productsLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fresh-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-green-yellow rounded-lg flex items-center justify-center">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold dark-text">FreshBox Admin</h1>
              <p className="text-gray-500">Dashboard Overview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleExportData}
              variant="outline" 
              className="border-fresh-green text-fresh-green hover:bg-fresh-green hover:text-white"
            >
              <Download className="mr-2 w-4 h-4" />
              Export Data
            </Button>
            <Button className="bg-fresh-green text-white hover:bg-fresh-green/90">
              <Plus className="mr-2 w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-fresh-green/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-fresh-green w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-fresh-green/10 text-fresh-green">
                  +{Math.round((pendingOrders / Math.max(orders.length, 1)) * 100)}%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold dark-text">{stats?.totalOrders || 0}</h3>
              <p className="text-gray-600">Total Orders</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sunny-yellow/10 rounded-xl flex items-center justify-center">
                  <Users className="text-sunny-yellow w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-sunny-yellow/10 text-sunny-yellow">
                  +8%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold dark-text">{stats?.totalCustomers || 0}</h3>
              <p className="text-gray-600">Customers</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-fresh-green/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-fresh-green w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-fresh-green/10 text-fresh-green">
                  +15%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold dark-text">Rs. {parseFloat(stats?.totalRevenue || "0").toLocaleString()}</h3>
              <p className="text-gray-600">Revenue</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sunny-yellow/10 rounded-xl flex items-center justify-center">
                  <Package className="text-sunny-yellow w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-sunny-yellow/10 text-sunny-yellow">
                  +5%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold dark-text">{stats?.totalProducts || 0}</h3>
              <p className="text-gray-600">Products</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard 
              stats={stats}
              recentOrders={recentOrders}
              pendingOrders={pendingOrders}
              completedOrders={completedOrders}
            />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold dark-text">All Orders</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="border-fresh-green text-fresh-green">
                      {pendingOrders} Pending
                    </Badge>
                    <Badge variant="outline" className="border-sunny-yellow text-sunny-yellow">
                      {completedOrders} Completed
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={orders} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold dark-text">Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold dark-text">{product.name}</h4>
                          <Badge 
                            variant={product.isAvailable ? "default" : "secondary"}
                            className={product.isAvailable ? "bg-fresh-green" : "bg-gray-400"}
                          >
                            {product.isAvailable ? "Available" : "Out of Stock"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Category: {product.category}</p>
                          <p className="text-sm text-gray-600">Unit: {product.unit}</p>
                          <p className="text-lg font-bold fresh-green">Rs. {product.price}</p>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold dark-text">Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message: any) => (
                    <Card key={message.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold dark-text">
                              {message.firstName} {message.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{message.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={message.isReplied ? "default" : "secondary"}>
                              {message.isReplied ? "Replied" : "Pending"}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-gray-800">{message.subject}</p>
                          <p className="text-gray-600 text-sm">{message.message}</p>
                        </div>
                        {!message.isReplied && (
                          <div className="mt-4">
                            <Button size="sm" className="bg-fresh-green text-white hover:bg-fresh-green/90">
                              Reply
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
