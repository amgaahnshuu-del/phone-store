import { Link } from "wouter";
import { Smartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-wider mb-4">
              <Smartphone className="w-8 h-8" />
              ГарУтас
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Ирээдүйн технологи, хамгийн сүүлийн үеийн ухаалаг утаснуудын дэлгүүр.
            </p>
          </div>
          
          <div>
            <h4 className="text-foreground font-bold mb-4">Цэс</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Нүүр</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors text-sm">Дэлгүүр</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors text-sm">Сагс</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground font-bold mb-4">Холбоо барих</h4>
            <ul className="space-y-2">
              <li className="text-muted-foreground text-sm">Утас: +976 8055 2166</li>
              <li className="text-muted-foreground text-sm">Instagram: @garutasxeelinhudaldaa</li>
              <li className="text-muted-foreground text-sm">Хаяг: Улаанбаатар хот</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} ГарУтас. Зохиогчийн эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </div>
    </footer>
  );
}
