import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Trash2, ShoppingBag, Pizza, ChevronRight } from 'lucide-react';

interface MenuItem {
  id: number;
  category: string;
  nome: string;
  description: string;
  price: number;
  image: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Store() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  // --- INTEGRAÇÃO COM A API NESTJS ---
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((response) => response.json())
      .then((data) => {
        const activeItems = data.filter((item: any) => item.ativo !== false);
        const formattedData = activeItems.map((item: any) => ({
          ...item,
          image: item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
        }));
        setMenuItems(formattedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar o cardápio da API NestJS:", error);
        setIsLoading(false);
      });
  }, []);

  // --- LÓGICA DE CATEGORIAS ---
  const categorias = ['Todas', ...Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))];
  
  const categoryOrder = [
    'Sabores Tradicionais',
    'Sugestões Famosas',
    'Pizzas Doces',
    'Calzones',
    'Bebidas'
  ];

  const filteredItems = activeCategory === 'Todas' 
    ? [...menuItems].sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category);
        const indexB = categoryOrder.indexOf(b.category);
        const valA = indexA === -1 ? 99 : indexA;
        const valB = indexB === -1 ? 99 : indexB;
        return valA - valB;
      })
    : menuItems.filter(item => item.category === activeCategory);

  // --- LÓGICA DO CARRINHO ---
  const addToCart = (pizza: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === pizza.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...pizza, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- CHECKOUT WHATSAPP ---
  const handleCheckout = () => {
    if (cart.length === 0) return;
    const itemsText = cart.map(item => `${item.quantity}x ${item.nome} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
    const message = `*NOVO PEDIDO - Quintal da Lu* 🍕\n\n*Itens:*\n${itemsText}\n\n*Forma de Pagamento:* ${paymentMethod}\n*Total a pagar:* R$ ${totalPrice.toFixed(2)}\n\n_Por favor, informe seu endereço para entrega._`;
    const phoneNumber = "5561999733380"; 
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-700">
            <Pizza size={24} />
            <h1 className="text-xl font-bold tracking-tight">Quintal da Lu</h1>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-700 hover:text-red-700 transition-colors bg-gray-100 rounded-full"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {categorias.length > 1 && (
          <div className="bg-white border-t border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
            <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* BANNER PRINCIPAL */}
      <section className="relative bg-zinc-900 pt-8 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent"></div>
        
        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          <img 
            src="/logo.png" 
            alt="Logo Quintal da Lu" 
            className="w-32 h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] mb-2"
          />
          <p className="text-zinc-300 text-sm max-w-md mx-auto font-light">
            Sabor de família em cada fatia.
          </p>
        </div>
      </section>

      {/* LISTAGEM DE PRODUTOS */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>Nenhum produto cadastrado no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((pizza) => (
              <div key={pizza.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-28 h-28 shrink-0">
                  <img src={pizza.image} alt={pizza.nome} className="w-full h-full object-cover rounded-xl" />
                </div>
                
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 leading-tight">{pizza.nome}</h4>
                    <p className="text-gray-500 text-xs mt-1">{pizza.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-green-600">R$ {Number(pizza.price).toFixed(2).replace('.', ',')}</span>
                    <button 
                      onClick={() => addToCart(pizza)} 
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOTAO FLUTUANTE DE CARRINHO */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-30 md:hidden">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <div className="bg-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                {totalItems}
              </div>
              <span>Ver Pedido</span>
            </div>
            <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      )}

      {/* CARRINHO LATERAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag size={20} className="text-red-600"/> Seu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center border-b border-gray-50 pb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-900">{item.nome}</h4>
                        <p className="text-green-600 font-bold text-sm mt-1">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                      </div>
                      
                      <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-600"><Minus size={14} /></button>
                        <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-600"><Plus size= {14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-gray-50 border-t border-gray-200">
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Forma de Pagamento</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-xl p-3 outline-none focus:border-red-500"
                  >
                    <option value="PIX">PIX (Rápido e Seguro)</option>
                    <option value="Cartão de Crédito (Entrega)">Cartão de Crédito (Na Entrega)</option>
                    <option value="Cartão de Débito (Entrega)">Cartão de Débito (Na Entrega)</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="text-2xl font-black text-gray-900">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-md transition-transform active:scale-95"
                >
                  Confirmar Pedido <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}