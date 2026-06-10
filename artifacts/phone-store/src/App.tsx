import { Component, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import PhoneDetail from "@/pages/PhoneDetail";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Orders from "@/pages/Orders";
import Admin from "@/pages/Admin";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends Component<
  { children: ReactNode; locationKey: string },
  { hasError: boolean; message: string; prevKey: string }
> {
  constructor(props: { children: ReactNode; locationKey: string }) {
    super(props);
    this.state = { hasError: false, message: "", prevKey: props.locationKey };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message ?? String(error) };
  }

  static getDerivedStateFromProps(
    props: { locationKey: string },
    state: { hasError: boolean; message: string; prevKey: string }
  ) {
    if (props.locationKey !== state.prevKey) {
      return { hasError: false, message: "", prevKey: props.locationKey };
    }
    return null;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Алдаа гарлаа</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Хуудас ачааллахад алдаа гарлаа. Дахин оролдоно уу.
            </p>
            <pre className="text-xs text-left bg-card border border-white/10 rounded-xl p-4 overflow-auto text-red-400 mb-6">
              {this.state.message}
            </pre>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90"
            >
              Нүүр хуудас руу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function RouterWithBoundary() {
  const [location] = useLocation();
  return (
    <ErrorBoundary locationKey={location}>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/shop" component={Shop} />
                <Route path="/phone/:id" component={PhoneDetail} />
                <Route path="/cart" component={Cart} />
                <Route path="/orders" component={Orders} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
        </Route>
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <RouterWithBoundary />
            <Toaster />
          </WouterRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
