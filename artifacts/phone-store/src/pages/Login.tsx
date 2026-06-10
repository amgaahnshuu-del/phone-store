import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-card border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Нэвтрэх</h1>
            <p className="text-muted-foreground mt-2">ГарУтас дансаараа нэвтэрнэ үү</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Нэвтрэх нэр</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="pl-10 bg-background border-white/10 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-background border-white/10 focus:border-primary"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 rounded-xl"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Нэвтрэх"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Шинэ хэрэглэгч үү?</span>
            <Link href="/register" className="text-primary hover:underline font-medium">
              Бүртгүүлэх
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
