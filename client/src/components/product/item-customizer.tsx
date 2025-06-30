import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import type { Product, CartItem } from "@/lib/types";

interface ItemCustomizerProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  cartItems: CartItem[];
  maxItems: number;
}

export default function ItemCustomizer({ products, onAddToCart, cartItems, maxItems }: ItemCustomizerProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const currentItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const remainingSlots = maxItems - currentItemCount;

  const getQuantity = (productId: number) => quantities[productId] || 1;

  const setQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = getQuantity(product.id);
    onAddToCart(product, quantity);
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const isInCart = (productId: number) => {
    return cartItems.some(item => item.product.id === productId);
  };

  const getCartQuantity = (productId: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products available in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium dark-text">Items in your box:</span>
          <span className={`font-bold ${remainingSlots > 0 ? 'fresh-green' : 'text-red-500'}`}>
            {currentItemCount} / {maxItems}
          </span>
        </div>
        {remainingSlots <= 0 && (
          <p className="text-sm text-red-500 mt-2">Your box is full! Remove items to add more.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-6xl">
                {product.category === 'fruit' ? '🍎' : '🥬'}
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold dark-text">{product.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.category === 'fruit' 
                    ? 'bg-sunny-yellow/20 text-sunny-yellow' 
                    : 'bg-fresh-green/20 text-fresh-green'
                }`}>
                  {product.category}
                </span>
              </div>
              
              {product.description && (
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold fresh-green">
                  Rs. {product.price}
                </span>
                <span className="text-gray-500 text-sm">per {product.unit}</span>
              </div>

              {isInCart(product.id) ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">In Cart</span>
                    <span className="text-green-700 font-bold">
                      {getCartQuantity(product.id)} {product.unit}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => setQuantity(product.id, getQuantity(product.id) - 1)}
                        disabled={getQuantity(product.id) <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={getQuantity(product.id)}
                        onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                        disabled={getQuantity(product.id) >= 10}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={remainingSlots < getQuantity(product.id)}
                    className="w-full bg-fresh-green hover:bg-fresh-green/90 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Box
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
