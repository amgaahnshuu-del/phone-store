import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Battery } from "lucide-react";
import { useGetFeaturedPhones, useGetPhoneStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Phone3DModel } from "@/components/Phone3DModel";
import { ParticleBackground } from "@/components/ParticleBackground";
import { WebGLErrorBoundary } from "@/components/WebGLErrorBoundary";
import { PhoneCard } from "@/components/PhoneCard";
import { isWebGLAvailable } from "@/hooks/use-webgl";

const webglAvailable = isWebGLAvailable();

export default function Home() {
  const { data: featuredPhones } = useGetFeaturedPhones();
  const { data: stats } = useGetPhoneStats();

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {webglAvailable && (
            <WebGLErrorBoundary>
              <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
                <ambientLight intensity={0.25} color="#FFFFFF" />
                <directionalLight position={[4, 8, 5]} intensity={2.2} color="#FFF6EE" />
                <directionalLight position={[-5, 3, 2]} intensity={1.0} color="#A0D8FF" />
                <directionalLight position={[2, -4, -6]} intensity={0.7} color="#8030FF" />
                <spotLight position={[0, 6, 4]} intensity={2.5} color="#FFFFFF" angle={0.5} penumbra={1} />
                <Suspense fallback={null}>
                  <ParticleBackground />
                  <Phone3DModel interactive={false} scale={0.82} />
                  <Environment preset="studio" />
                </Suspense>
              </Canvas>
            </WebGLErrorBoundary>
          )}
        </div>

        <div className="container relative z-10 mx-auto px-4 grid md:grid-cols-2 gap-8 items-center h-full pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <div className="inline-block mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
              <span className="text-primary text-xs font-bold tracking-wider uppercase">Ирээдүй энд байна</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Хязгааргүй <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Боломж
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Хамгийн сүүлийн үеийн ухаалаг утаснуудыг нэг дороос. Технологийн гайхамшгийг бидэнтэй хамт мэдэр.
            </p>
            <div className="flex gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide rounded-full px-8">
                  Дэлгүүр рүү орох
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-20 border-b border-white/5 relative z-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-card border border-white/5 shadow-lg"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalProducts}+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Гар утас</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-card border border-white/5 shadow-lg"
              >
                <div className="text-4xl font-bold text-secondary mb-2">{stats.totalBrands}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Брэнд</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-card border border-white/5 shadow-lg"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stats.inStockCount}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Бэлэн байгаа</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-card border border-white/5 shadow-lg"
              >
                <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Хүргэлт</div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredPhones && featuredPhones.length > 0 && (
        <section className="py-24 relative z-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Онцлох бүтээгдэхүүн</h2>
                <p className="text-muted-foreground">Шилдэг үзүүлэлттэй ухаалаг утаснууд</p>
              </div>
              <Link href="/shop">
                <Button variant="outline" className="hidden md:flex rounded-full border-primary/50 hover:bg-primary/10 hover:text-primary">
                  Бүгдийг харах
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPhones.map((phone, index) => (
                <motion.div
                  key={phone.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PhoneCard phone={phone} />
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link href="/shop">
                <Button variant="outline" className="rounded-full w-full border-primary/50 hover:bg-primary/10 hover:text-primary">
                  Бүгдийг харах
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-24 relative z-20 bg-card border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Яагаад биднийг сонгох вэ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Бид хэрэглэгчиддээ хамгийн чанартай үйлчилгээ, шилдэг бүтээгдэхүүнийг санал болгодог.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-10 h-10 text-primary" />,
                title: "Хурдан хүргэлт",
                description: "Улаанбаатар хот дотор 24 цагийн дотор хүргэж өгнө."
              },
              {
                icon: <Shield className="w-10 h-10 text-secondary" />,
                title: "Баталгаат хугацаа",
                description: "Бүх утсанд 1-2 сарийн албан ёсны баталгаа олгоно."
              },
              {
                icon: <Battery className="w-10 h-10 text-primary" />,
                title: "Оригинал бүтээгдэхүүн",
                description: "Зөвхөн албан ёсны эрхтэй, оригинал утаснууд худалдаалдаг."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-background p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:border-primary/30 transition-colors"
              >
                <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
