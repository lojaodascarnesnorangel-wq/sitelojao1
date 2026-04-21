import { motion } from "motion/react";
import { 
  Flame, 
  ShoppingCart, 
  Tag, 
  MessageCircle, 
  Beef, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Phone,
  ArrowRight
} from "lucide-react";

const WHATSAPP_NUMBER = "5583999024481";
const BASE_WA_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// Meta Pixel tracking helpers
const trackWhatsAppClick = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Contact');
  }
};

const trackMapClick = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'FindLocation');
  }
};

const trackPromoClick = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Contact');
    (window as any).fbq('track', 'ViewContent', { content_name: 'Quarta da Carne Promo' });
  }
};

const PRODUCTS = {
  BOVINAS: [
    { name: "Acém com osso", price: "30,90" },
    { name: "Acém sem osso", price: "38,90" },
    { name: "Paleta com osso", price: "33,90" },
    { name: "Paleta sem osso", price: "39,90" },
    { name: "Peito bovino com osso", price: "29,90" },
    { name: "Costela bovina", price: "29,90" },
    { name: "Braço/Chambaril", price: "29,90" },
    { name: "Suan bovino", price: "21,90" },
    { name: "Bistequinha bovina", price: "29,90" },
    { name: "Bisteca paulista", price: "29,90" },
    { name: "Costelinha do peito", price: "29,90" },
    { name: "Músculo sem osso", price: "36,90" },
    { name: "Guisadinho bovino", price: "36,90" },
    { name: "Bife especial", price: "44,90" },
    { name: "Carne de sol", price: "49,90" },
    { name: "Isca de sol", price: "49,90" },
    { name: "Bife de lombo bovino", price: "49,90" },
    { name: "Coxão mole", price: "49,90" },
    { name: "Chã de fora", price: "49,90" },
    { name: "Alcatra bovina", price: "49,90" },
    { name: "Patinho bovino", price: "49,90" },
    { name: "Contra filé", price: "49,90" },
    { name: "Fraldinha bovina", price: "49,90" },
    { name: "Capa de filé", price: "49,90" },
    { name: "Cupim B", price: "39,90" },
    { name: "Cupim grill", price: "49,90" },
    { name: "Bananinha", price: "59,90" },
    { name: "Aranha bovina", price: "39,90" },
    { name: "Maminha argentina", price: "69,90" },
    { name: "Bisteca bovina", price: "38,90" },
    { name: "Picanha bovina", price: "69,90" },
    { name: "Picanha fatiada", price: "59,90" },
    { name: "Chorizo", price: "69,90" },
    { name: "Carne moída", price: "19,90" },
    { name: "Massa para hambúrguer", price: "25,00" },
    { name: "Hambúrguer 100g", price: "2,90", unit: "unidade" },
  ],
  MIUDOS: [
    { name: "Miúdos bovino", price: "19,90" },
    { name: "Rabada bovina", price: "33,90" },
    { name: "Bucho bovino", price: "19,90" },
    { name: "Tripa bovina", price: "19,90" },
    { name: "Mocotó bovino", price: "10,90" },
    { name: "Osso do patinho", price: "10,90" },
    { name: "Rejeito bovino", price: "10,90" },
    { name: "Kit feijoada", price: "18,90" },
    { name: "Fígado bovino", price: "18,90" },
  ],
  FRANGO: [
    { name: "Peito de frango", price: "17,90" },
    { name: "Bisteca de frango", price: "17,90" },
    { name: "Filé de frango", price: "24,90" },
    { name: "Coxa com sobrecoxa", price: "13,90" },
    { name: "Coxa", price: "13,90" },
    { name: "Sobrecoxa", price: "13,90" },
    { name: "Frango a passarinho", price: "13,90" },
    { name: "Asa de frango", price: "18,90" },
    { name: "Coxinha da asa", price: "18,90" },
    { name: "Bife de frango", price: "24,90" },
    { name: "Strogonoff de frango", price: "24,90" },
  ],
  SUINOS: [
    { name: "Picanha suína", price: "28,90" },
    { name: "Bisteca suína", price: "23,90" },
    { name: "Costela suína", price: "23,90" },
    { name: "Costela suína salgada", price: "23,90" },
    { name: "Bacon", price: "36,90" },
    { name: "Pé suíno salgado", price: "19,90" },
    { name: "Rabo suíno salgado", price: "19,90" },
  ],
  FRIOS: [
    { name: "Linguiça mista Aurora", price: "21,90" },
    { name: "Linguiça de frango Aurora", price: "21,90" },
    { name: "Salsicha Bom Todo", price: "10,90" },
    { name: "Salsicha Perdigão", price: "16,90" },
    { name: "Queijo mussarela Italac", price: "44,90" },
    { name: "Queijo coalho", price: "39,90" },
    { name: "Salsichão Friato", price: "16,90" },
    { name: "Presunto de peru", price: "31,90" },
    { name: "Linguiças artesanais", price: "26,90" },
  ]
};

const SectionHeader = ({ title }: { icon: any, title: string }) => (
  <div className="bg-brand-yellow text-brand-black py-3 px-4 font-black uppercase text-sm flex justify-between items-center border-l-4 border-brand-red">
    <span>{title}</span>
  </div>
);

const ProductItem = ({ name, price, unit = "kg" }: { name: string, price: string, unit?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 last:border-0 hover:bg-red-50 transition-colors px-4 text-sm font-medium">
    <span className="text-gray-700">{name}</span>
    <div className="text-right">
      <span className="font-bold text-brand-red">R$ {price}/{unit}</span>
    </div>
  </div>
);

export default function App() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-black overflow-x-hidden pb-10">
      
      {/* Hero Section */}
      <header 
        className="relative py-20 px-10 border-b-8 border-brand-red flex flex-col lg:flex-row justify-between items-center gap-12 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/meat-hero.png')" }}
      >
        {/* Decorative elements for "impact" */}
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-black/80 via-black/40 to-black/80"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-red opacity-10 blur-3xl rounded-full"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 max-w-3xl flex flex-col items-center gap-2"
        >
          <img 
            src="/logo.png" 
            alt="Lojão das Carnes" 
            className="w-64 md:w-96 h-auto object-contain drop-shadow-[0_20px_70px_rgba(255,204,0,0.3)] filter contrast-125 hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const span = document.createElement('span');
              span.className = 'text-8xl text-brand-yellow drop-shadow-lg';
              span.innerText = '🥩';
              (e.target as HTMLImageElement).parentElement!.appendChild(span);
            }}
          />
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-5xl leading-none uppercase font-black tracking-tighter mb-2 text-white drop-shadow-2xl">
              LOJÃO DAS <span className="text-brand-yellow">CARNES</span> RANGEL
            </h1>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-wrap justify-center gap-3">
                <span className="text-brand-yellow font-black text-sm md:text-base border-2 border-brand-yellow/30 bg-black/40 px-5 py-2 rounded-full backdrop-blur-md uppercase tracking-widest shadow-lg">
                  Qualidade Garantida
                </span>
                <span className="text-brand-black font-black text-sm md:text-base bg-brand-yellow px-5 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  Preço Justo de Verdade
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.a 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          href={`${BASE_WA_URL}?text=Olá,%20quero%20fazer%20um%20pedido`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackWhatsAppClick}
          className="relative z-10 btn-3d-green px-10 py-6 rounded-2xl font-black text-xl transition-all flex flex-col items-center gap-1 group shadow-[0_20px_50px_rgba(37,211,102,0.3)] hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-3">
            <MessageCircle fill="currentColor" size={28} className="group-hover:rotate-12 transition-transform" />
            PEDIR AGORA
          </div>
          <span className="text-[10px] opacity-70 tracking-widest uppercase">Atendimento Imediato</span>
        </motion.a>
      </header>

      {/* Quick Action Buttons */}
      <section className="bg-white py-8 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🔥", text: "Montar meu churrasco", link: "Quero%20montar%20um%20churrasco" },
            { icon: "🛒", text: "Compra da semana", link: "Quero%20carne%20para%20a%20semana" },
            { icon: "💰", text: "Promoções de hoje", link: "Quais%20são%20as%20promoções%20do%20dia?" },
            { icon: "💬", text: "Falar com atendente", link: "" },
          ].map((action, i) => (
            <motion.a 
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={`${BASE_WA_URL}?text=${action.link}`}
              target="_blank"
              onClick={trackWhatsAppClick}
              className="flex flex-col items-center justify-center p-6 btn-3d-white rounded-xl gap-2 text-center"
            >
              <span className="text-3xl">{action.icon}</span>
              <span className="font-bold text-sm uppercase tracking-tight">{action.text}</span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Visit Us Section */}
      <section 
        className="relative py-20 px-10 bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-brand-black/70 backdrop-blur-[2px]"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-brand-yellow text-brand-black p-4 rounded-2xl shadow-xl mb-4"
          >
            <Clock size={48} />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Venha nos visitar! 📍</h2>
          <p className="text-xl font-medium text-gray-200">
            Qualidade que você vê de perto. Selecionamos as melhores carnes para o seu dia a dia.
          </p>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full max-w-2xl">
            <p className="text-lg font-bold mb-2 uppercase tracking-wide">Nossa Localização:</p>
            <p className="text-2xl font-black text-brand-yellow mb-1 drop-shadow-sm">Av. Dois de Fevereiro 1120</p>
            <p className="text-lg font-bold text-gray-200 mb-6">Rangel, João Pessoa - PB | 58070-000</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Av.+Dois+de+Fevereiro+1120,+Rangel,+João+Pessoa+-+PB,+58070-000"
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackMapClick}
                className="btn-3d-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2"
              >
                <ArrowRight size={20} />
                VER NO MAPA
              </a>
              <a 
                href={BASE_WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackWhatsAppClick}
                className="btn-3d-green px-10 py-4 rounded-xl flex items-center justify-center gap-3 text-lg"
              >
                <MessageCircle size={24} fill="currentColor" />
                DÚVIDAS? CHAME NO WHATS
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <main className="max-w-7xl mx-auto px-10 py-10 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-8">
        
        {/* BOVINAS */}
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col h-full shadow-sm">
          <SectionHeader icon={Beef} title="CARNES BOVINAS 🥩" />
          <div className="p-4 overflow-y-auto flex-grow">
            {PRODUCTS.BOVINAS.map((p, i) => (
              <motion.div key={i} variants={item}>
                <ProductItem {...p} />
              </motion.div>
            ))}
          </div>
          <div className="p-6 bg-gray-50 text-center">
            <a 
              href={`${BASE_WA_URL}?text=Quero%20comprar%20carne%20bovina`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsAppClick}
              className="inline-flex btn-3d-green px-8 py-4 rounded-xl text-sm"
            >
              Comprar Bovinos no WhatsApp
            </a>
          </div>
        </motion.div>

        <div className="flex flex-col gap-8">
          {/* FRANGO & SUÍNOS */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col h-full shadow-sm">
            <SectionHeader icon={ShoppingCart} title="FRANGOS & SUÍNOS 🍗" />
            <div className="p-4 overflow-y-auto flex-grow">
              {[...PRODUCTS.FRANGO, ...PRODUCTS.SUINOS].slice(0, 15).map((p, i) => (
                <motion.div key={i} variants={item}>
                  <ProductItem {...p} />
                </motion.div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 text-center">
              <a 
                href={`${BASE_WA_URL}?text=Quero%20comprar%20frango%20ou%20suíno`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackWhatsAppClick}
                className="inline-flex btn-3d-green px-8 py-4 rounded-xl text-sm"
              >
                Pedir Frango/Suíno
              </a>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-8">
          {/* FRIOS & MIÚDOS */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col h-full shadow-sm">
            <SectionHeader icon={Tag} title="FRIOS & MIÚDOS 🧀" />
            <div className="p-4 overflow-y-auto flex-grow">
              {[...PRODUCTS.FRIOS, ...PRODUCTS.MIUDOS].slice(0, 15).map((p, i) => (
                <motion.div key={i} variants={item}>
                  <ProductItem {...p} />
                </motion.div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 text-center">
              <a 
                href={`${BASE_WA_URL}?text=Quero%20comprar%20frios%20ou%20miúdos`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackWhatsAppClick}
                className="inline-flex btn-3d-green px-8 py-4 rounded-xl text-sm"
              >
                Comprar Frios no WhatsApp
              </a>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Promo Bar */}
      <section className="bg-brand-yellow text-brand-black py-4 px-10 font-black flex flex-col md:flex-row justify-between items-center gap-4 border-y-2 border-brand-red/20 shadow-inner">
        <span className="flex items-center gap-2 uppercase tracking-tight">🔥 QUARTA DA CARNE: 10% de desconto em tudo, todas as quartas!</span>
            <a 
              href={`${BASE_WA_URL}?text=Quero%20aproveitar%20a%20quarta%20de%20desconto`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackPromoClick}
              className="btn-3d-red text-white px-8 py-3 rounded-xl text-sm hover:scale-105 transition-transform"
            >
              Aproveitar agora
            </a>
      </section>

      {/* Footer */}
      <footer className="bg-brand-black text-white py-10 px-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5">
        <div className="flex items-center gap-6">
          <img 
            src="/logo.png" 
            alt="Lojão das Carnes" 
            className="w-40 md:w-56 h-auto object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
             <span className="block text-gray-400 text-xs uppercase tracking-widest mb-1">Unidade Rangel</span>
             Atendimento no balcão e delivery | <strong className="text-brand-yellow font-black">(83) 99902-4481</strong>
          </div>
        </div>
        <a 
          href={BASE_WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackWhatsAppClick}
          className="btn-3d-green px-6 py-3 rounded font-black uppercase text-xs tracking-wider"
        >
          CHAMAR NO WHATSAPP AGORA
        </a>
      </footer>

    </div>
  );
}
