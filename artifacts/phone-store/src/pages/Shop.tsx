import { useState } from "react";
import { useListPhones, useListCategories } from "@workspace/api-client-react";
import { PhoneCard } from "@/components/PhoneCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const { data: categories } = useListCategories();
  const categoryList = Array.isArray(categories) ? categories : [];
  
  const { data: phones, isLoading } = useListPhones({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined
  });
  const phoneList = Array.isArray(phones) ? phones : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Дэлгүүр</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Хамгийн сүүлийн үеийн ухаалаг утаснуудаас сонголтоо хийнэ үү.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-card border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Хайх..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-white/10 rounded-full h-12"
            />
          </form>

          <div className="w-full md:w-auto flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select 
              value={categoryId ? categoryId.toString() : "all"} 
              onValueChange={(val) => setCategoryId(val === "all" ? null : parseInt(val))}
            >
              <SelectTrigger className="w-full md:w-[200px] h-12 bg-background border-white/10 rounded-full">
                <SelectValue placeholder="Бүх ангилал" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх ангилал</SelectItem>
                {categoryList.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : phoneList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {phoneList.map((phone, index) => (
              <motion.div
                key={phone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <PhoneCard phone={phone} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-foreground mb-2">Илэрц олдсонгүй</h3>
            <p className="text-muted-foreground">Таны хайлтанд тохирох утас олдсонгүй.</p>
            <Button 
              variant="outline" 
              className="mt-6 border-primary/50"
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setCategoryId(null);
              }}
            >
              Шүүлтүүр цэвэрлэх
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
