import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";
import type { OrderStats, Order, Customer, BoxType } from "@/lib/types";

interface AdminDashboardProps {
  stats?: OrderStats;
  recentOrders: (Order & { customer: Customer; boxType: BoxType; orderItems: any[] })[];
  pendingOrders: number;
  completedOrders: number;
}

export default function AdminDashboard({ 
  stats, 
  recentOrders, 
  pendingOrders, 
  completedOrders 
}: AdminDashboardProps) {
  const totalOrders = pendingOrders + completedOrders;
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-sunny-yellow/20 text-sunny-yellow";
      case "confirmed":
        return "bg-blue-100 text-blue-600";
      case "delivered":
        return "bg-fresh-green/20 text-fresh-green";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-fresh-green/20 text-fresh-green";
      case "pending":
        return "bg-sunny-yellow/20 text-sunny-yellow";
      case "failed":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-fresh-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark-text">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-2">
              {completedOrders} out of {totalOrders} orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-sunny-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark-text">{pendingOrders}</div>
            <div className="flex items-center text-xs text-gray-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              Requires attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-fresh-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark-text">
              Rs. {totalOrders > 0 ? Math.round(parseFloat(stats?.totalRevenue || "0") / totalOrders).toLocaleString() : 0}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold dark-text">Recent Orders</CardTitle>
            <Badge variant="outline" className="border-fresh-green text-fresh-green">
              Last 5 Orders
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-fresh-green/10 rounded-lg flex items-center justify-center">
                      <span className="text-fresh-green font-semibold text-sm">
                        #{order.id.toString().padStart(3, "0")}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold dark-text">
                        {order.customer.firstName} {order.customer.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.boxType.name} • Rs. {order.totalAmount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentMethod === "easypaisa" ? "Easypaisa" : "JazzCash"}
                    </Badge>
                    <Badge className={getOrderStatusColor(order.orderStatus)}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-600">No orders yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-fresh-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-fresh-green w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold dark-text mb-2">View Analytics</h3>
            <p className="text-gray-600 text-sm">
              Detailed insights into sales, customer behavior, and performance metrics.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-sunny-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="text-sunny-yellow w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold dark-text mb-2">Manage Inventory</h3>
            <p className="text-gray-600 text-sm">
              Update product availability, prices, and add new seasonal items.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
