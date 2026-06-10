import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Package, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type OrderItem = {
  id: number;
  phoneId: number;
  quantity: number;
  price: number;
  phone: { name: string; brand: string; imageUrl: string };
};

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "accepted")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
        <CheckCircle className="w-3 h-3" /> Хүлээн авсан
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle className="w-3 h-3" /> Татгалзсан
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
      <Clock className="w-3 h-3" /> Хүлээгдэж байна
    </span>
  );
};

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (!user) return;

    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Нүүр хуудас руу
        </Link>

        <h1 className="text-3xl font-bold mb-8">Миний захиалгууд</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Одоогоор захиалга байхгүй байна.</p>
            <Link href="/shop">
              <Button className="mt-6 bg-primary hover:bg-primary/90">Дэлгүүрт очих</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Захиалга #{order.id}</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleString("mn-MN")}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.phone.imageUrl} alt={item.phone.name} className="w-12 h-12 object-contain rounded-lg bg-background p-1" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.phone.name}</div>
                        <div className="text-sm text-muted-foreground">{item.quantity}ш × ₮{item.price.toLocaleString()}</div>
                      </div>
                      <div className="font-bold text-primary">₮{(item.quantity * item.price).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-muted-foreground">Нийт дүн</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">
                    ₮{order.total.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
