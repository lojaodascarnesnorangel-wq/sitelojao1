/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react';
import { 
  MessageCircle, 
  Menu, 
  X, 
  CheckCircle2, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Sun, 
  Glasses, 
  Contact, 
  Home, 
  Truck, 
  ShieldCheck, 
  Award,
  ArrowRight,
  Instagram,
  Facebook,
  MapPin,
  Clock,
  Phone,
  Plus,
  Trash2,
  Edit,
  Save,
  LogOut,
  Settings,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Camera,
  Upload
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

// --- Types ---
interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  isOffer?: boolean;
  imagePosition?: string;
  createdAt?: any;
}

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  initials: string;
  color: string;
}

// --- Constants ---
const WHATSAPP_NUMBER = "5583993043877";
const WHATSAPP_MESSAGE = "Olá! Vim pelo site e quero conhecer os óculos 😊";
const ADMIN_EMAIL = "Anndrefrazao@gmail.com";
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "1410597223535332";

const PRODUCTS_FALLBACK: Product[] = [
  { id: '1', name: "Armação Clássica Feminina", price: "189,90", category: "Grau", image: "https://placehold.co/400x400/1a1a1a/30bcf0?text=Armação+Feminina" },
  { id: '2', name: "Óculos de Sol Retrô", price: "249,90", category: "Sol", image: "https://placehold.co/400x400/1a1a1a/b91e8f?text=Sol+Retrô", isOffer: true },
  { id: '3', name: "Armação Esportiva Masculina", price: "219,90", category: "Grau", image: "https://placehold.co/400x400/1a1a1a/f5ba58?text=Esportiva+Masculina" },
  { id: '4', name: "Lentes de Contato Mensal", price: "89,90", category: "Lentes", image: "https://placehold.co/400x400/1a1a1a/30bcf0?text=Lentes+Contato" },
  { id: '5', name: "Óculos Multifocal Premium", price: "399,90", category: "Grau", image: "https://placehold.co/400x400/1a1a1a/b91e8f?text=Multifocal+Premium", isOffer: true },
  { id: '6', name: "Armação Infantil Colorida", price: "159,90", category: "Grau", image: "https://placehold.co/400x400/1a1a1a/f5ba58?text=Infantil+Colorida" },
  { id: '7', name: "Óculos de Sol Oversized", price: "279,90", category: "Sol", image: "https://placehold.co/400x400/1a1a1a/30bcf0?text=Sol+Oversized" },
  { id: '8', name: "Armação Fio de Nylon", price: "199,90", category: "Grau", image: "https://placehold.co/400x400/1a1a1a/b91e8f?text=Fio+de+Nylon" },
];

const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: "Maria Silva", text: "Atendimento impecável! Adorei a facilidade de escolher os óculos em casa.", rating: 5, initials: "MS", color: "bg-blue-500" },
  { id: 2, name: "João Santos", text: "Ótima variedade de modelos e o preço é muito justo. Recomendo!", rating: 5, initials: "JS", color: "bg-magenta-500" },
  { id: 3, name: "Ana Oliveira", text: "A entrega foi super rápida e os óculos são de excelente qualidade.", rating: 5, initials: "AO", color: "bg-amber-500" },
  { id: 4, name: "Pedro Lima", text: "O atendimento em domicílio é um diferencial incrível. Muito prático.", rating: 5, initials: "PL", color: "bg-blue-600" },
  { id: 5, name: "Carla Souza", text: "Fiquei muito satisfeita com minhas novas lentes. Atendimento nota 10!", rating: 5, initials: "CS", color: "bg-magenta-600" },
];

const FAQ_ITEMS = [
  { q: "Como funciona o atendimento em domicílio?", a: "Você entra em contato conosco pelo WhatsApp, agendamos um horário e levamos uma maleta com diversos modelos para você provar no conforto da sua casa." },
  { q: "Quais são as formas de pagamento?", a: "Aceitamos cartões de crédito (parcelamento em até 10x), débito, PIX e dinheiro." },
  { q: "Vocês fazem óculos de grau completo?", a: "Sim! Trabalhamos com as melhores lentes do mercado (Essilor, Zeiss, Hoya) e montamos seus óculos completos com a sua receita." },
  { q: "Quanto tempo demora para ficar pronto?", a: "O prazo médio para óculos de grau é de 3 a 7 dias úteis, dependendo da complexidade da lente." },
  { q: "Tem garantia?", a: "Sim, todos os nossos produtos possuem garantia contra defeitos de fabricação e adaptação das lentes." },
  { q: "Atendem em toda João Pessoa?", a: "Sim, atendemos em todos os bairros de João Pessoa e também em Cabedelo e Santa Rita." },
];

// --- Helper Functions ---
const trackWhatsAppClick = (label: string) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Contact', { content_name: label });
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  window.open(url, '_blank');
};

const trackProductView = (product: Product) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'ViewContent', {
      content_name: product.name,
      content_category: 'Óculos',
      value: parseFloat(product.price.replace(',', '.')),
      currency: 'BRL'
    });
  }
};

const trackInitiateCheckout = (product: Product) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      content_name: product.name,
      value: parseFloat(product.price.replace(',', '.')),
      currency: 'BRL'
    });
  }
  trackWhatsAppClick(`Pedido: ${product.name}`);
};

// --- Components ---

const Counter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const ProductCard = ({ product }: { product: Product; key?: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="perspective-1000 group h-[450px]"
      onMouseEnter={() => {
        setIsFlipped(true);
        trackProductView(product);
      }}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div 
        className="relative w-full h-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden glass-card overflow-hidden flex flex-col">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ objectPosition: product.imagePosition || 'center' }}
              referrerPolicy="no-referrer"
            />
            {product.isOffer && (
              <div className="absolute top-4 right-4 bg-brand-gold text-brand-dark px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                OFERTA
              </div>
            )}
          </div>
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <p className="text-brand-blue text-xs font-bold uppercase tracking-wider mb-1">{product.category}</p>
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-brand-gold">R$ {product.price}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  trackInitiateCheckout(product);
                }}
                className="p-2 bg-brand-blue/20 hover:bg-brand-blue text-brand-blue hover:text-white rounded-full transition-colors"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-brand-blue/20 to-brand-magenta/20">
          <h3 className="text-2xl font-bold mb-4">{product.name}</h3>
          <p className="text-gray-300 mb-6">Modelo premium com acabamento de alta qualidade e design exclusivo para seu estilo.</p>
          <button 
            onClick={() => trackInitiateCheckout(product)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Pedir no WhatsApp
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAtFooter, setIsAtFooter] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  // --- Auth & Admin State ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Check if user is at the bottom (footer)
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // If we are within 300px of the bottom, hide the floating button
      if (scrollTop + windowHeight > documentHeight - 300) {
        setIsAtFooter(true);
      } else {
        setIsAtFooter(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser?.email);
      setUser(currentUser);
      if (currentUser) {
        // Check if user is admin (by email or Firestore role)
        if (currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          console.log("Master admin detected via email");
          setIsAdmin(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
              console.log("Admin detected via Firestore");
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
        setShowAdmin(false);
      }
    });

    // Products Listener
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData.length > 0 ? productsData : PRODUCTS_FALLBACK);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setProducts(PRODUCTS_FALLBACK);
      setLoading(false);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("Starting login...");
      const result = await signInWithPopup(auth, provider);
      console.log("Login successful:", result.user.email);
      // If the logged in user is the master admin, open the panel immediately
      if (result.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log("Opening admin panel for master admin");
        setIsAdmin(true);
        setShowAdmin(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Erro ao fazer login. Verifique se você selecionou a conta correta.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredProducts = activeCategory === "Todos" 
    ? products 
    : products.filter(p => {
        if (activeCategory === "Óculos de Grau") return p.category === "Grau";
        if (activeCategory === "Óculos de Sol") return p.category === "Sol";
        if (activeCategory === "Lentes de Contato") return p.category === "Lentes";
        return true;
      });

  if (showAdmin && isAdmin) {
    return <AdminPanel products={products} onClose={() => setShowAdmin(false)} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-brand-dark selection:bg-brand-blue selection:text-white">
      
      {/* --- Navbar --- */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-brand-dark/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 relative flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo Espaço dos Óculos" 
                className="w-full h-full object-contain relative z-10 scale-110"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/100x100/transparent/white?text=E";
                }}
              />
            </div>
            <span className="text-[10px] font-black tracking-tighter font-sans uppercase leading-none drop-shadow-[0_0_8px_rgba(48,188,240,0.3)]">
              <span className="text-white">Espaço dos</span> <br /> 
              <span className="text-brand-blue">Óculos</span>
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Início', 'Produtos', 'Catálogo', 'Como Funciona', 'Contato'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-gray-300 hover:text-brand-blue transition-colors"
              >
                {item}
              </a>
            ))}
            <button 
              onClick={() => trackWhatsAppClick('Navbar')}
              className="btn-wa"
            >
              Falar no WhatsApp
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-dark border-b border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {['Início', 'Produtos', 'Catálogo', 'Como Funciona', 'Contato'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-gray-300"
                  >
                    {item}
                  </a>
                ))}
                <button 
                  onClick={() => trackWhatsAppClick('Mobile Menu')}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Falar no WhatsApp
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      <section id="início" ref={heroRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-[#1a0a2e] to-[#0a1a2e] opacity-50" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-magenta/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          
          {/* Particles Simulation (CSS) */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: Math.random()
                }}
                animate={{ 
                  y: [null, Math.random() * 100 + "%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-extrabold leading-tight mb-4 tracking-tight">
              Sua visão merece o melhor. <br />
              <span className="text-gradient">A gente leva até você.</span>
            </h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-[1px] w-8 bg-brand-blue/50" />
              <span className="text-brand-blue text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
                Ótica Premium em João Pessoa
              </span>
            </motion.div>
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              Óculos de grau, sol e lentes com atendimento personalizado em domicílio. Estilo e conforto sem sair de casa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#catálogo" className="btn-primary flex items-center justify-center gap-2">
                Ver Catálogo
              </a>
              <button 
                onClick={() => trackWhatsAppClick('Hero CTA')}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                Atendimento VIP
              </button>
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroY }}
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <div className="relative z-10 organic-shape overflow-hidden shadow-2xl shadow-brand-magenta/30 border border-white/10 bg-brand-dark flex items-center justify-center group">
              <img 
                src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800" 
                alt="Modelo usando óculos de grau Vogue" 
                className="w-full h-full object-cover filter brightness-90 transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
            </div>
            {/* Glow Dots */}
            <div className="absolute top-[20%] right-[10%] w-3 h-3 bg-brand-blue rounded-full blur-[5px] animate-pulse z-20" />
            <div className="absolute bottom-[10%] left-0 w-3 h-3 bg-brand-blue rounded-full blur-[5px] animate-pulse z-20" style={{ animationDelay: '1s' }} />
            
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-10 -right-10 glass p-4 rounded-2xl z-20 shadow-2xl border-brand-blue/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-blue/20 rounded-lg">
                  <Glasses className="text-brand-blue" size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Premium</p>
                  <p className="text-sm font-bold">Vogue Eyewear</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-10 -right-10 glass p-4 rounded-2xl z-20 shadow-2xl border-brand-magenta/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-magenta/20 rounded-lg">
                  <Star className="text-brand-magenta" size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Confiança</p>
                  <p className="text-sm font-bold">5.0 Estrelas</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl z-20 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-blue/20 rounded-lg">
                  <Truck className="text-brand-blue" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Delivery</p>
                  <p className="text-lg font-bold">Em Domicílio</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- Brands Marquee --- */}
      <div className="relative py-12 bg-brand-dark border-y border-white/5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-20 px-10">
              {['Ray-Ban', 'Vogue', 'Oakley', 'Prada', 'Gucci', 'Dolce & Gabbana', 'Armani', 'Tiffany & Co.'].map((brand) => (
                <span key={brand} className="text-3xl md:text-5xl font-black text-white/10 hover:text-brand-blue/40 transition-colors cursor-default uppercase tracking-tighter">
                  {brand}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- Stats Section --- */}
      <section className="py-20 bg-brand-darker border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Clientes Atendidos", value: 500, suffix: "+" },
              { label: "Modelos Disponíveis", value: 200, suffix: "+" },
              { label: "Avaliação Média", value: 5, suffix: "★" },
              { label: "Anos de Experiência", value: 16, suffix: "+" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Differentials --- */}
      <section id="produtos" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Por que escolher o <span className="text-brand-blue">Espaço dos Óculos</span>?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Combinamos tecnologia, estilo e a conveniência de um atendimento exclusivo onde você estiver.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "🏠", title: "Delivery VIP", desc: "Atendimento exclusivo no conforto da sua residência." },
              { icon: "🕶️", title: "+200 Modelos", desc: "As melhores marcas mundiais para o seu estilo.", badge: "MAIS VENDIDO" },
              { icon: "⭐", title: "Premium", desc: "Qualidade e precisão técnica em cada lente." },
              { icon: "📍", title: "João Pessoa", desc: "O melhor serviço ótico da Paraíba à sua porta." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card group relative"
              >
                <div className="text-3xl mb-4 block">
                  {item.icon}
                </div>
                {item.badge && (
                  <div className="absolute top-4 right-4 bg-brand-gold text-brand-dark text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {item.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-3 text-gradient-gold">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Catalog --- */}
      <section id="catálogo" className="py-24 bg-brand-darker">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Nosso <span className="text-brand-magenta">Catálogo</span></h2>
              <p className="text-gray-400">Explore nossa seleção curada de armações e lentes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Todos", "Óculos de Grau", "Óculos de Sol", "Lentes de Contato"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    if (typeof window !== 'undefined' && (window as any).fbq) {
                      (window as any).fbq('track', 'Search', { search_string: cat });
                    }
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
          
          <div className="mt-16 text-center">
            <button 
              onClick={() => trackWhatsAppClick('Ver Catálogo Completo')}
              className="btn-outline"
            >
              Ver Catálogo Completo no WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* --- How it Works --- */}
      <section id="como-funciona" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Como <span className="text-brand-gold">Funciona</span>?</h2>
            <p className="text-gray-400">Simples, prático e pensado para sua rotina.</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-blue via-brand-magenta to-brand-gold hidden md:block" />
            
            <div className="space-y-12 md:space-y-0">
              {[
                { step: "01", title: "Entre em contato", desc: "Fale conosco pelo WhatsApp e tire suas dúvidas iniciais.", icon: <MessageCircle /> },
                { step: "02", title: "Agendamos uma visita", desc: "Escolha o melhor horário para receber nossa equipe em sua casa ou trabalho.", icon: <Clock /> },
                { step: "03", title: "Escolha seus óculos", desc: "Prove diversos modelos e receba consultoria técnica para sua receita.", icon: <Glasses /> },
                { step: "04", title: "Receba com conforto", desc: "Entregamos seus óculos prontos e ajustados com total garantia.", icon: <CheckCircle2 /> },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="flex-1 text-center md:text-left">
                    <div className={`glass-card p-8 ${i % 2 === 0 ? 'md:text-right' : ''}`}>
                      <span className="text-5xl font-bold text-white/10 mb-4 block">{item.step}</span>
                      <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-16 h-16 bg-brand-dark border-4 border-brand-blue rounded-full flex items-center justify-center text-brand-blue shadow-[0_0_20px_rgba(48,188,240,0.5)]">
                    {item.icon}
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section className="py-24 bg-brand-darker">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">O que dizem nossos <span className="text-brand-blue">Clientes</span></h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="text-brand-gold" fill="currentColor" size={20} />)}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 ${t.color} rounded-full flex items-center justify-center font-bold text-white`}>
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-bold">{t.name}</h4>
                    <div className="flex gap-0.5">
                      {[...Array(t.rating)].map((_, i) => <Star key={i} className="text-brand-gold" fill="currentColor" size={12} />)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 italic">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Gallery --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Nosso <span className="text-brand-magenta">Lookbook</span></h2>
            <p className="text-gray-400">Estilo e inspiração para sua nova visão.</p>
          </div>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              { src: "/imagem1.jpg", alt: "Estilo Elegante" },
              { src: "/imagem2.jpg", alt: "Estilo Casual" },
              { src: "/imagem3.jpg", alt: "Estilo Moderno" },
              { src: "/imagem4.jpg", alt: "Estilo Profissional" },
              { src: "/imagem5.jpg", alt: "Estilo Fashion" },
              { src: "/imagem6.jpg", alt: "Estilo Urbano" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative group overflow-hidden rounded-2xl border border-white/10"
              >
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to previous URLs if local files fail to load
                    const fallbacks = [
                      "https://storage.googleapis.com/msgs-attachments/628bcf56-c006-49f7-b5e1-e7d764524062/0.png",
                      "https://storage.googleapis.com/msgs-attachments/628bcf56-c006-49f7-b5e1-e7d764524062/1.png",
                      "https://storage.googleapis.com/msgs-attachments/628bcf56-c006-49f7-b5e1-e7d764524062/2.png",
                      "https://storage.googleapis.com/msgs-attachments/628bcf56-c006-49f7-b5e1-e7d764524062/3.png",
                      "https://storage.googleapis.com/msgs-attachments/628bcf56-c006-49f7-b5e1-e7d764524062/4.png",
                      "https://storage.googleapis.com/msgs-attachments/628bcf56-c006-49f7-b5e1-e7d764524062/5.png"
                    ];
                    e.currentTarget.src = fallbacks[i];
                  }}
                />
                <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="text-white mx-auto mb-2" size={32} />
                    <span className="text-white font-bold text-sm uppercase tracking-widest">{item.alt}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 bg-brand-darker">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perguntas <span className="text-brand-blue">Frequentes</span></h2>
          </div>
          
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-lg">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="text-brand-blue" /> : <ChevronDown className="text-brand-blue" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section id="contato" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-gradient-to-r from-brand-blue to-brand-magenta rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand-blue/30">
            {/* Decorative circles */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-8">Pronto para enxergar o mundo com estilo?</h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">Agende agora seu atendimento em domicílio e descubra por que somos a ótica favorita de João Pessoa.</p>
              <button 
                onClick={() => trackWhatsAppClick('Final CTA')}
                className="bg-white text-brand-dark px-12 py-5 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 mx-auto"
              >
                <MessageCircle size={28} />
                Falar no WhatsApp Agora
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 bg-brand-darker border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/100x100/transparent/white?text=E";
                    }}
                  />
                </div>
                <span className="text-[10px] font-black tracking-tighter font-sans uppercase leading-none drop-shadow-[0_0_8px_rgba(48,188,240,0.3)]">
                  <span className="text-white">Espaço dos</span> <br /> 
                  <span className="text-brand-blue">Óculos</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Sua ótica premium com atendimento personalizado em domicílio em João Pessoa. Estilo, conforto e tecnologia para sua visão.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center text-gray-400 hover:text-brand-magenta hover:border-brand-magenta transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center text-gray-400 hover:text-brand-blue hover:border-brand-blue transition-all">
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-brand-blue">Links Rápidos</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#início" className="hover:text-white transition-colors">Início</a></li>
                <li><a href="#produtos" className="hover:text-white transition-colors">Produtos</a></li>
                <li><a href="#catálogo" className="hover:text-white transition-colors">Catálogo</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-brand-magenta">Atendimento</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3"><Clock size={16} className="text-brand-magenta" /> Seg - Sex: 08h às 18h</li>
                <li className="flex items-center gap-3"><Clock size={16} className="text-brand-magenta" /> Sábado: 08h às 12h</li>
                <li className="flex items-center gap-3"><MapPin size={16} className="text-brand-magenta" /> João Pessoa - PB</li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-brand-magenta" /> (83) 99304-3877</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-brand-gold">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-4">Receba ofertas exclusivas e novidades.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Seu e-mail" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-blue flex-grow" />
                <button className="bg-brand-blue p-2 rounded-lg text-white hover:bg-brand-blue/80 transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2024 Espaço dos Óculos. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Política de Privacidade</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Termos de Uso</button>
            </div>
            {/* Admin Access / Login */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-[10px] text-gray-600 hidden md:block">
                  Logado como: {user.email} {isAdmin ? "(Admin)" : ""}
                </div>
              )}
              {isAdmin ? (
                <button 
                  onClick={() => setShowAdmin(true)}
                  className="p-2 text-gray-400 hover:text-brand-blue transition-colors"
                  title="Painel Administrativo"
                >
                  <Settings size={20} />
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Acesso Restrito
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* --- Floating WhatsApp --- */}
      <AnimatePresence>
        {!isAtFooter && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => trackWhatsAppClick('Floating Button')}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/40 group"
          >
            <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20" />
            <MessageCircle size={32} />
            <span className="absolute right-20 bg-white text-brand-dark px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
              Falar no WhatsApp
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- Legal Modals --- */}
      <LegalModal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
        title="Política de Privacidade"
        content={`
          No Espaço dos Óculos, a sua privacidade é nossa prioridade. 
          Coletamos apenas informações básicas necessárias para o atendimento em domicílio: 
          nome, telefone e endereço, através de canais diretos como o WhatsApp.
          Seus dados nunca são compartilhados com terceiros para fins de marketing.
          Utilizamos o Meta Pixel apenas para entender a navegação e melhorar nossos serviços em João Pessoa.
        `}
      />
      
      <LegalModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Termos de Uso"
        content={`
          Ao utilizar este site, você concorda que o Espaço dos Óculos oferece um serviço de consultoria óptica em domicílio em João Pessoa e região. 
          As imagens no site são ilustrativas. Os preços e a disponibilidade de modelos podem variar de acordo com o estoque no momento da visita.
          O agendamento da visita não garante a compra, sendo um compromisso de demonstração de produtos.
        `}
      />

    </div>
  );
}

// --- Legal Modal Component ---
function LegalModal({ isOpen, onClose, title, content }: { isOpen: boolean, onClose: () => void, title: string, content: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-brand-dark border border-white/10 rounded-2xl p-8 overflow-y-auto max-h-[80vh]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-brand-blue">{title}</h2>
            <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {content}
            </div>
            <button 
              onClick={onClose}
              className="mt-8 w-full py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Admin Panel Component ---

function AdminPanel({ products, onClose, onLogout }: { products: Product[], onClose: () => void, onLogout: () => void }) {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support up to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("A imagem é muito grande. O limite máximo é de 10MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let MAX_WIDTH = 1200; // Increased resolution
        let MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Initial compression
        let quality = 0.7;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // If still too large for Firestore (1MB limit), compress more
        // Base64 is ~1.33x binary size, so 1MB limit means ~750KB binary
        // We check string length < 1,048,576
        while (dataUrl.length > 1048576 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length > 1048576) {
          // If still too large, resize again
          MAX_WIDTH = 800;
          MAX_HEIGHT = 800;
          // ... repeat resize logic or just alert
          alert("Não foi possível comprimir a imagem o suficiente. Tente uma imagem menor.");
          setIsUploading(false);
          return;
        }

        setEditingProduct(prev => prev ? { ...prev, image: dataUrl } : null);
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      alert("Erro ao carregar imagem.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    if (!editingProduct.image) {
      alert("Por favor, selecione ou tire uma foto do produto.");
      return;
    }

    try {
      // Clean data for Firestore
      const { id, ...dataToSave } = editingProduct as Product;
      
      if (isAdding) {
        await addDoc(collection(db, 'products'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      } else if (id) {
        await updateDoc(doc(db, 'products', id), dataToSave);
      }
      setEditingProduct(null);
      setIsAdding(false);
      alert(isAdding ? "Produto adicionado com sucesso!" : "Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Erro ao salvar o produto. Verifique se a imagem não é muito grande (limite de 1MB).");
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    // Check if it's a fallback product
    if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(id)) {
      alert("Este é um produto de demonstração e não pode ser excluído. Adicione seus próprios produtos para gerenciar o catálogo.");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        console.log("Deleting product:", id);
        await deleteDoc(doc(db, 'products', id));
        alert("Produto excluído com sucesso!");
      } catch (error) {
        console.error("Delete error:", error);
        handleFirestoreError(error, OperationType.DELETE, 'products');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white p-6 md:p-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel de <span className="text-brand-blue">Gestão</span></h1>
            <p className="text-gray-400">Gerencie o catálogo de produtos em tempo real.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setEditingProduct({ name: '', price: '', category: 'Grau', image: '', isOffer: false, imagePosition: 'center' });
                setIsAdding(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} /> Novo Produto
            </button>
            <button onClick={onClose} className="btn-secondary">Voltar ao Site</button>
            <button onClick={onLogout} className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Edit/Add Modal Overlay */}
        <AnimatePresence>
          {editingProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card w-full max-w-2xl p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">{isAdding ? 'Adicionar Produto' : 'Editar Produto'}</h2>
                  <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase">Nome do Produto</label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                          required
                          type="text" 
                          value={editingProduct.name}
                          onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:border-brand-blue outline-none transition-all"
                          placeholder="Ex: Armação Vogue Classic"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase">Preço (R$)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                          required
                          type="text" 
                          value={editingProduct.price}
                          onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:border-brand-blue outline-none transition-all"
                          placeholder="Ex: 249,90"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase">Categoria</label>
                      <select 
                        value={editingProduct.category}
                        onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:border-brand-blue outline-none transition-all"
                      >
                        <option value="Grau">Óculos de Grau</option>
                        <option value="Sol">Óculos de Sol</option>
                        <option value="Lentes">Lentes de Contato</option>
                      </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-bold text-gray-400 uppercase">Ajuste de Posição da Imagem</label>
                      <div className="flex gap-2">
                        {['center', 'top', 'bottom', 'left', 'right'].map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setEditingProduct({...editingProduct, imagePosition: pos})}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${editingProduct.imagePosition === pos ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                          >
                            {pos === 'center' ? 'Centro' : pos === 'top' ? 'Topo' : pos === 'bottom' ? 'Base' : pos === 'left' ? 'Esq' : 'Dir'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-bold text-gray-400 uppercase">Imagem do Produto</label>
                      <div className="flex flex-col gap-4">
                        {editingProduct.image && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
                            <img 
                              src={editingProduct.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              style={{ objectPosition: editingProduct.imagePosition || 'center' }}
                            />
                            <button 
                              type="button"
                              onClick={() => setEditingProduct({...editingProduct, image: ''})}
                              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white shadow-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-lg py-3 px-4 hover:bg-white/10 cursor-pointer transition-all">
                            <Upload size={18} className="text-brand-blue" />
                            <span className="text-xs font-bold uppercase">Galeria</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              className="hidden" 
                            />
                          </label>
                          <label className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-lg py-3 px-4 hover:bg-white/10 cursor-pointer transition-all">
                            <Camera size={18} className="text-brand-magenta" />
                            <span className="text-xs font-bold uppercase">Câmera</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              onChange={handleImageUpload} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                        {isUploading && <p className="text-xs text-brand-blue animate-pulse">Processando imagem...</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="isOffer"
                      checked={editingProduct.isOffer}
                      onChange={e => setEditingProduct({...editingProduct, isOffer: e.target.checked})}
                      className="w-5 h-5 accent-brand-blue"
                    />
                    <label htmlFor="isOffer" className="font-bold text-gray-300">Produto em Oferta?</label>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="submit" 
                      disabled={isUploading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>Processando...</>
                      ) : (
                        <><Save size={20} /> Salvar Alterações</>
                      )}
                    </button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary flex-1">
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Table/Grid */}
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="glass-card flex flex-col md:flex-row items-center justify-between gap-6 p-4">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <div className="flex gap-3 text-xs uppercase tracking-widest font-bold">
                    <span className="text-brand-blue">{product.category}</span>
                    <span className="text-brand-gold">R$ {product.price}</span>
                    {product.isOffer && <span className="text-brand-magenta">Oferta</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => {
                    setEditingProduct(product);
                    setIsAdding(false);
                  }}
                  className="flex-1 md:flex-none p-3 bg-white/5 hover:bg-brand-blue/20 text-gray-400 hover:text-brand-blue rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Edit size={18} /> <span className="md:hidden">Editar</span>
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 md:flex-none p-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> <span className="md:hidden">Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
