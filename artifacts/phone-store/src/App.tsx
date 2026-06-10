import { Switch, Route, Router as WouterRouter } from "wouter";
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

const queryClient = new QueryClient();

function Router() {
  return (
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
