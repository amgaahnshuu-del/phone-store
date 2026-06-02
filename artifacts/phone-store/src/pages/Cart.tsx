import { useState } from "react";
import { useGetCart, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ArrowRight, ShoppingBag, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function Cart() {
  const { data: cartItems, isLoading } = useGetCart();
  const removeMutation = useRemoveFromCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [placing, setPlacing] = useState(false);

  const handleRemove = (id: number) => {
    removeMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Устгагдлаа" });
        }
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Захиалга хийхэд алдаа гарлаа");
      }
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      toast({
        title: "Захиалга амжилттай хийгдлээ!",
        description: "Таны захиалга хүлээгдэж байна. Захиалгуудаас мөрдөж болно.",
      });
      navigate("/orders");
    } catch (err: any) {
      toast({ title: "Алдаа", description: err.message, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const isEmpty = !cartItems || cartItems.length === 0;
  const subtotal = cartItems?.reduce((acc, item) => acc + (item.phone.price * item.quantity), 0) || 0;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Сагс</h1>

        {isEmpty ? (
          <div className="bg-card border border-white/5 rounded-3xl p-16 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mb-6 border border-white/10">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Таны сагс хоосон байна</h2>
            <p className="text-muted-foreground mb-8">Дэлгүүрээс хүссэн утсаа сонгож сагсандаа нэмээрэй.</p>
            <Link href="/shop">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground font-bold px-8">
                Дэлгүүр хэсэх
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-white/5 rounded-2xl p-4 flex gap-4 md:gap-6 items-center"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-background flex-shrink-0 flex items-center justify-center p-2">
                    <img
                      src={item.phone.imageUrl}
                      alt={item.phone.name}
                      className="max-h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/phone/${item.phoneId}`} className="hover:text-primary transition-colors">
                      <h3 className="font-bold text-lg md:text-xl truncate">{item.phone.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">{item.phone.brand}</p>
                    <div className="text-primary font-bold">₮{item.phone.price.toLocaleString()} x {item.quantity}</div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(item.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <div className="font-bold text-lg">
                      ₮{(item.phone.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-white/5 rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Захиалгын мэдээлэл</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Нийт үнэ</span>
                    <span className="font-medium">₮{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Хүргэлт</span>
                    <span className="text-primary font-medium">Үнэгүй</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-center">
                  <span className="font-bold text-lg">Төлөх дүн</span>
                  <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    ₮{subtotal.toLocaleString()}
                  </span>
                </div>

                {!user && (
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Захиалга хийхийн тулд{" "}
                    <Link href="/login" className="text-primary underline">нэвтэрнэ үү</Link>
                  </p>
                )}

                <Button
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl relative overflow-hidden group"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {placing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Package className="w-5 h-5 mr-2" />
                      {user ? "Захиалга хийх" : "Нэвтрэн захиалах"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
