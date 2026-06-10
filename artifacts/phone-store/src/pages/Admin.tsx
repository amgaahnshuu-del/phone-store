import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Loader2, Package, ShoppingBag, CheckCircle, XCircle,
  Clock, Trash2, Plus, LogOut, LayoutDashboard, ChevronDown, ChevronUp, ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useListCategories } from "@workspace/api-client-react";
import { MODEL_OPTIONS } from "@/components/PhoneModels";

type OrderItem = {
  id: number;
  phoneId: number;
  quantity: number;
  price: number;
  phone: { name: string; brand: string; imageUrl: string };
};

type Order = {
  id: number;
  userId: number;
  username: string | null;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

type Phone = {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "accepted")
    return <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3" />Хүлээн авсан</span>;
  if (status === "rejected")
    return <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" />Татгалзсан</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock className="w-3 h-3" />Хүлээгдэж байна</span>;
};

const emptyPhone = {
  name: "", brand: "", price: "", originalPrice: "", imageUrl: "",
  description: "", specs: "", categoryId: "", featured: false, inStock: true,
  color: "", storage: "", modelType: "generic",
};

export default function Admin() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"orders" | "phones">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [form, setForm] = useState<typeof emptyPhone>(emptyPhone);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const { data: categories } = useListCategories();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [user, authLoading]);

  const fetchOrders = () =>
    fetch("/api/admin/orders", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []));

  const fetchPhones = () =>
    fetch("/api/phones", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPhones(Array.isArray(data) ? data : []));

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    setLoadingData(true);
    Promise.all([fetchOrders(), fetchPhones()]).finally(() => setLoadingData(false));
  }, [user]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const deletePhone = async (id: number) => {
    if (!confirm("Энэ утасны бүтээгдэхүүнийг устгах уу?")) return;
    await fetch(`/api/phones/${id}`, { method: "DELETE", credentials: "include" });
    setPhones((prev) => prev.filter((p) => p.id !== id));
  };

  const addPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const body = {
        name: form.name,
        brand: form.brand,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        imageUrl: form.imageUrl,
        description: form.description || null,
        specs: form.specs || null,
        categoryId: form.categoryId ? parseInt(form.categoryId) : (categories?.[0]?.id ?? 1),
        featured: form.featured,
        inStock: form.inStock,
        color: form.color || null,
        storage: form.storage || null,
        modelType: form.modelType || "generic",
      };
      const res = await fetch("/api/phones", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Утас нэмэхэд алдаа гарлаа");
      const newPhone = await res.json();
      setPhones((prev) => [...prev, newPhone]);
      setForm(emptyPhone);
      setImagePreview("");
      setShowAddPhone(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setForm((prev) => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">Админ панел</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Сайн байна уу, <span className="text-foreground font-medium">{user?.username}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => { await logout(); navigate("/login"); }}
              className="border-white/10 hover:bg-white/5"
            >
              <LogOut className="w-4 h-4 mr-1" /> Гарах
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <div className="text-3xl font-bold text-primary">{phones.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Нийт бүтээгдэхүүн</div>
          </div>
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <div className="text-3xl font-bold text-foreground">{orders.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Нийт захиалга</div>
          </div>
          <div className="bg-card border border-yellow-500/20 rounded-2xl p-5">
            <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Хүлээгдэж буй</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("orders")}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-colors ${tab === "orders" ? "bg-primary text-primary-foreground" : "bg-card border border-white/10 text-muted-foreground hover:text-foreground"}`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />Захиалгууд
            {pendingCount > 0 && <span className="ml-2 bg-yellow-400 text-black text-xs rounded-full px-1.5">{pendingCount}</span>}
          </button>
          <button
            onClick={() => setTab("phones")}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-colors ${tab === "phones" ? "bg-primary text-primary-foreground" : "bg-card border border-white/10 text-muted-foreground hover:text-foreground"}`}
          >
            <Package className="w-4 h-4 inline mr-2" />Бүтээгдэхүүнүүд
          </button>
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Одоогоор захиалга байхгүй</p>
              </div>
            )}
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-white/10 rounded-2xl overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-bold">Захиалга #{order.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.username} · {new Date(order.createdAt).toLocaleString("mn-MN")}
                        {(order as any).phoneNumber && (
                          <span className="ml-2 text-primary font-medium">📞 {(order as any).phoneNumber}</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">₮{order.total.toLocaleString()}</span>
                    {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="px-5 pb-5 border-t border-white/10 pt-4">
                    <div className="space-y-3 mb-5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.phone.imageUrl} alt={item.phone.name} className="w-10 h-10 object-contain rounded-lg bg-background p-1" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.phone.name}</div>
                            <div className="text-xs text-muted-foreground">{item.quantity}ш × ₮{item.price.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.status === "pending" && (
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateStatus(order.id, "accepted")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Хүлээн авах
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => updateStatus(order.id, "rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Татгалзах
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Phones Tab */}
        {tab === "phones" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground text-sm">{phones.length} бүтээгдэхүүн</span>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowAddPhone(!showAddPhone)}
              >
                <Plus className="w-4 h-4 mr-1" /> Утас нэмэх
              </Button>
            </div>

            {/* Add Phone Form */}
            {showAddPhone && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-primary/30 rounded-2xl p-6 mb-6"
              >
                <h3 className="font-bold text-lg mb-4">Шинэ утас нэмэх</h3>
                <form onSubmit={addPhone} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Нэр *</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="iPhone 16 Pro" required className="bg-background border-white/10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Брэнд *</label>
                    <select
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      required
                      className="w-full h-10 rounded-lg bg-background border border-white/10 px-3 text-sm text-foreground"
                    >
                      <option value="">Брэнд сонгох...</option>
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Huawei">Huawei</option>
                      <option value="Oppo">Oppo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Үнэ (₮) *</label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="3500000" required className="bg-background border-white/10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Анхны үнэ (₮)</label>
                    <Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="4000000" className="bg-background border-white/10" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Зураг *</label>
                    <div className="flex items-center gap-3">
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="w-16 h-16 object-contain rounded-xl bg-background border border-white/10 p-1 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-background border border-white/10 flex items-center justify-center shrink-0">
                          <ImagePlus className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}
                      <label className="flex-1 flex items-center justify-center h-10 rounded-lg bg-background border border-white/10 border-dashed cursor-pointer hover:border-primary/50 hover:text-primary transition-colors px-3 text-sm text-muted-foreground gap-2">
                        <ImagePlus className="w-4 h-4" />
                        {imagePreview ? "Зураг солих" : "Зураг сонгох"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          required={!form.imageUrl}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Хадгалах хэмжээ</label>
                    <Input value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} placeholder="256GB" className="bg-background border-white/10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">3D Загвар</label>
                    <select
                      value={form.modelType}
                      onChange={(e) => setForm({ ...form, modelType: e.target.value })}
                      className="w-full h-10 rounded-lg bg-background border border-white/10 px-3 text-sm text-foreground"
                    >
                      {MODEL_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Тайлбар</label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Утасны тайлбар..." className="bg-background border-white/10" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="rounded" />
                      Нөөцтэй
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                      Онцлох
                    </label>
                  </div>

                  {formError && <p className="sm:col-span-2 text-red-400 text-sm">{formError}</p>}

                  <div className="sm:col-span-2 flex gap-3">
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Хадгалах"}
                    </Button>
                    <Button type="button" variant="outline" className="border-white/10" onClick={() => { setShowAddPhone(false); setForm(emptyPhone); setImagePreview(""); }}>
                      Болих
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="space-y-3">
              {phones.map((phone) => (
                <div key={phone.id} className="bg-card border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <img src={phone.imageUrl} alt={phone.name} className="w-12 h-12 object-contain rounded-lg bg-background p-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{phone.name}</div>
                    <div className="text-sm text-muted-foreground">{phone.brand} · ₮{phone.price.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {phone.inStock
                      ? <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-0.5 rounded-full">Нөөцтэй</span>
                      : <span className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded-full">Дууссан</span>
                    }
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => deletePhone(phone.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
