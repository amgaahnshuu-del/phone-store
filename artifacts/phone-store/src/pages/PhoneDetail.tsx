import { useParams } from "wouter";
import { useState } from "react";
import { useGetPhone, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function PhoneDetail() {
  const { id } = useParams();
  const phoneId = parseInt(id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: phone, isLoading } = useGetPhone(phoneId, {
    query: { enabled: !!phoneId } as any
  });

  const addToCartMutation = useAddToCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!phone) return;
    setIsAdding(true);
    
    addToCartMutation.mutate(
      { data: { phoneId: phone.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({
            title: "Сагсанд нэмэгдлээ",
            description: `${phone.name} сагсанд амжилттай орлоо.`,
          });
          setIsAdding(false);
        },
        onError: () => {
          toast({
            title: "Алдаа гарлаа",
            description: "Сагсанд нэмэх үед алдаа гарлаа. Дахин оролдоно уу.",
            variant: "destructive"
          });
          setIsAdding(false);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <h2 className="text-2xl font-bold mb-4">Бүтээгдэхүүн олдсонгүй</h2>
        <Link href="/shop">
          <Button variant="outline">Дэлгүүр рүү буцах</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Буцах
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Viewer */}
          <div className="h-[500px] md:h-[700px] rounded-3xl bg-card border border-white/5 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-40 blur-3xl pointer-events-none" />
            <img
              src={phone.imageUrl}
              alt={phone.name}
              className="relative z-10 max-h-full max-w-full object-contain p-10 drop-shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-2">
                <span className="text-sm font-bold text-primary tracking-widest uppercase">{phone.brand}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{phone.name}</h1>
              
              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">
                  ₮{phone.price.toLocaleString()}
                </span>
                {phone.originalPrice && (
                  <span className="text-xl line-through text-muted-foreground mb-1">
                    ₮{phone.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {phone.description || `${phone.brand} брэндийн шинэхэн ухаалаг утас. Хамгийн сүүлийн үеийн технологи, гайхалтай дизайн хосолсон.`}
                </p>
              </div>

              {phone.specs && (
                <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-bold mb-4">Үзүүлэлтүүд</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{phone.specs}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 bg-background border border-white/10 p-4 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-sm font-bold">1 жилийн баталгаа</div>
                    <div className="text-xs text-muted-foreground">Албан ёсны</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-background border border-white/10 p-4 rounded-xl">
                  <Truck className="w-6 h-6 text-secondary" />
                  <div>
                    <div className="text-sm font-bold">Үнэгүй хүргэлт</div>
                    <div className="text-xs text-muted-foreground">Улаанбаатар хотод</div>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl relative overflow-hidden group"
                onClick={handleAddToCart}
                disabled={isAdding || !phone.inStock}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {isAdding ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : !phone.inStock ? (
                  "Агуулахад дууссан"
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Сагсанд нэмэх
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
