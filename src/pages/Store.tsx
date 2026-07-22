import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Trash2, ShoppingBag, Pizza, ChevronRight, MapPin, User, CreditCard, Bike, Store as StoreIcon, MessageCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

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

interface CheckoutData {
  nome: string;
  telefone: string;
  tipoServico: 'delivery' | 'retirada';
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  referencia: string;
  pagamento: string;
  troco: string;
  observacoes: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TAXA_ENTREGA = 5.00;
const PHONE_NUMBER = '5561999733380';

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  return `QDL-${ts}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Store() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [checkoutStep, setCheckoutStep] = useState<0 | 1 | 2 | 3>(0); // 0=cart, 1=dados, 2=endereço, 3=pagamento

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    nome: '',
    telefone: '',
    tipoServico: 'delivery',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    referencia: '',
    pagamento: 'PIX',
    troco: '',
    observacoes: '',
  });

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((r) => r.json())
      .then((data) => {
        const active = data.filter((i: any) => i.ativo !== false);
        setMenuItems(active.map((i: any) => ({
          ...i,
          image: i.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
        })));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // --- CATEGORIAS ---
  const categorias = ['Todas', ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))];
  const categoryOrder = ['Sabores Tradicionais', 'Sugestões Famosas', 'Pizzas Doces', 'Calzones', 'Bebidas'];
  const filteredItems = activeCategory === 'Todas'
    ? [...menuItems].sort((a, b) => {
        const ia = categoryOrder.indexOf(a.category);
        const ib = categoryOrder.indexOf(b.category);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
    : menuItems.filter(i => i.category === activeCategory);

  // --- CARRINHO ---
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };
  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  const totalItems = cart.reduce((a, i) => a + i.quantity, 0);
  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const taxaEntrega = checkoutData.tipoServico === 'delivery' ? TAXA_ENTREGA : 0;
  const totalFinal = subtotal + taxaEntrega;

  const upd = (field: keyof CheckoutData, value: string) =>
    setCheckoutData(prev => ({ ...prev, [field]: value }));

  const openCart = () => { setIsCartOpen(true); setCheckoutStep(0); };
  const closeCart = () => { setIsCartOpen(false); setCheckoutStep(0); };

  // --- CHECKOUT ---
  const handleCheckout = () => {
    if (cart.length === 0) return;
    const orderNum = generateOrderNumber();
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const itemsText = cart
      .map(i => `  ${i.quantity}x ${i.nome} .............. R$ ${(i.price * i.quantity).toFixed(2).replace('.', ',')}`)
      .join('\n');

    const enderecoText = checkoutData.tipoServico === 'delivery'
      ? `\u{1F4CD} *Endereço de Entrega*
${checkoutData.rua}, ${checkoutData.numero}${checkoutData.complemento ? ` — ${checkoutData.complemento}` : ''}
Bairro: ${checkoutData.bairro}${checkoutData.referencia ? `\nReferência: ${checkoutData.referencia}` : ''}`
      : `\u{1F4CD} *Tipo:* Retirada no local`;

    const trocoText = checkoutData.pagamento === 'Dinheiro' && checkoutData.troco
      ? `\nTroco para: R$ ${checkoutData.troco}`
      : '';

    const obsText = checkoutData.observacoes
      ? `\n\n\u{1F4DD} *Observações:* ${checkoutData.observacoes}`
      : '';

    const message =
`\u{1F355} *PEDIDO ${orderNum}* — Quintal da Lu
\u{1F4C5} ${dateStr} às ${timeStr}
\u{1F517} quintaldalu.vercel.app

━━━━━━━━━━━━━━━━━━
\u{1F464} *Dados do Cliente*
Nome: ${checkoutData.nome}
Telefone: ${checkoutData.telefone}

\u{1F697} *Tipo de Serviço:* ${checkoutData.tipoServico === 'delivery' ? 'Delivery' : 'Retirada no Local'}
${enderecoText}

━━━━━━━━━━━━━━━━━━
\u{1F6D2} *Itens do Pedido*
${itemsText}

━━━━━━━━━━━━━━━━━━
\u{1F4B0} *Valores*
Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}
Taxa de entrega: ${taxaEntrega > 0 ? `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}` : 'Grátis (Retirada)'}
*Total: R$ ${totalFinal.toFixed(2).replace('.', ',')}*

\u{1F4B3} *Pagamento:* ${checkoutData.pagamento}${trocoText}
Estado: Pendente${obsText}

━━━━━━━━━━━━━━━━━━
\u2705 Pedido realizado pelo site`;

    window.open(`https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${encodeURIComponent(message)}`, '_blank');

    // Zera o carrinho e todos os dados do formulário após confirmar o pedido
    setCart([]);
    setCheckoutData({
      nome: '',
      telefone: '',
      tipoServico: 'delivery',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      referencia: '',
      pagamento: 'PIX',
      troco: '',
      observacoes: '',
    });
    closeCart();
  };

  const canGoToStep2 = checkoutData.nome.trim().length >= 2 && checkoutData.telefone.replace(/\D/g, '').length >= 10;
  const canGoToStep3 = checkoutData.tipoServico === 'retirada' ||
    (checkoutData.rua.trim().length > 0 && checkoutData.numero.trim().length > 0 && checkoutData.bairro.trim().length > 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-700">
            <Pizza size={24} />
            <h1 className="text-xl font-bold tracking-tight">Quintal da Lu</h1>
          </div>
          <button onClick={openCart}
            className="relative p-2 text-gray-700 hover:text-red-700 transition-colors bg-gray-100 rounded-full">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {categorias.length > 1 && (
          <div className="bg-white border-t border-gray-100 overflow-x-auto no-scrollbar">
            <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3">
              {categorias.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* BANNER */}
      <section className="relative bg-zinc-900 pt-8 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          <img src="/logo.png" alt="Logo Quintal da Lu" className="w-32 h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] mb-2" />
          <p className="text-zinc-300 text-sm max-w-md mx-auto font-light">Sabor de família em cada fatia.</p>
        </div>
      </section>

      {/* PRODUTOS */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p>Nenhum produto cadastrado no momento.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(pizza => (
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
                    <button onClick={() => addToCart(pizza)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOTÃO FLUTUANTE */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-30 md:hidden">
          <button onClick={openCart}
            className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-green-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">{totalItems}</div>
              <span>Ver Pedido</span>
            </div>
            <span>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      )}

      {/* CARRINHO / CHECKOUT MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">

            {/* Header do modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                {checkoutStep > 0 && (
                  <button onClick={() => setCheckoutStep(prev => (prev - 1) as any)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {checkoutStep === 0 && <><ShoppingBag size={20} className="text-red-600" /> Seu Pedido</>}
                  {checkoutStep === 1 && <><User size={20} className="text-red-600" /> Seus Dados</>}
                  {checkoutStep === 2 && <><MapPin size={20} className="text-red-600" /> Endereço</>}
                  {checkoutStep === 3 && <><CreditCard size={20} className="text-red-600" /> Pagamento</>}
                </h2>
              </div>
              <button onClick={closeCart} className="p-2 text-gray-400 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Indicador de progresso (steps 1-3) */}
            {checkoutStep > 0 && (
              <div className="px-5 pt-3 pb-1 shrink-0">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${checkoutStep >= s ? 'bg-red-600' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Etapa {checkoutStep} de 3 — {checkoutStep === 1 ? 'Seus dados' : checkoutStep === 2 ? 'Endereço de entrega' : 'Pagamento e confirmação'}
                </p>
              </div>
            )}

            {/* ===== STEP 0: CARRINHO ===== */}
            {checkoutStep === 0 && (
              <>
                <div className="flex-1 overflow-y-auto p-5">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                      <ShoppingCart size={48} className="opacity-20" />
                      <p>Carrinho vazio</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-3 items-center border-b border-gray-50 pb-4">
                          <img src={item.image} alt={item.nome} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{item.nome}</h4>
                            <p className="text-green-600 font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                          </div>
                          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-600 hover:bg-gray-200"><Minus size={14} /></button>
                            <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-600 hover:bg-gray-200"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
                    {/* Tipo de serviço */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => upd('tipoServico', 'delivery')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${checkoutData.tipoServico === 'delivery' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-500'}`}>
                        <Bike size={16} /> Delivery
                      </button>
                      <button
                        onClick={() => upd('tipoServico', 'retirada')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${checkoutData.tipoServico === 'retirada' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-500'}`}>
                        <StoreIcon size={16} /> Retirada
                      </button>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
                      <div className="flex justify-between text-gray-500">
                        <span>Taxa de entrega</span>
                        <span className={taxaEntrega > 0 ? 'text-gray-700' : 'text-green-600 font-semibold'}>
                          {taxaEntrega > 0 ? `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}` : 'Grátis'}
                        </span>
                      </div>
                      <div className="flex justify-between font-black text-lg text-gray-900 pt-1 border-t border-gray-200">
                        <span>Total</span><span>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <button onClick={() => setCheckoutStep(1)}
                      className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-md transition-all">
                      Continuar <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ===== STEP 1: DADOS DO CLIENTE ===== */}
            {checkoutStep === 1 && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome completo *</label>
                    <input type="text" value={checkoutData.nome} onChange={e => upd('nome', e.target.value)}
                      placeholder="Ex: Maria Silva"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Telefone / WhatsApp *</label>
                    <input type="tel" value={checkoutData.telefone}
                      onChange={e => upd('telefone', formatPhone(e.target.value))}
                      placeholder="(61) 99999-9999"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Observações do pedido</label>
                    <textarea value={checkoutData.observacoes} onChange={e => upd('observacoes', e.target.value)}
                      placeholder="Ex: Sem cebola na pizza, borda recheada..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none" />
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100 shrink-0">
                  <button onClick={() => setCheckoutStep(2)} disabled={!canGoToStep2}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-md transition-all">
                    Próximo <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}

            {/* ===== STEP 2: ENDEREÇO ===== */}
            {checkoutStep === 2 && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {checkoutData.tipoServico === 'retirada' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-3 py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-green-600" />
                      </div>
                      <p className="font-bold text-gray-800">Retirada no Local</p>
                      <p className="text-sm">Seu pedido estará pronto para retirada no Quintal da Lu.<br />Confirmaremos o horário pelo WhatsApp.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rua / Quadra *</label>
                        <input type="text" value={checkoutData.rua} onChange={e => upd('rua', e.target.value)}
                          placeholder="Ex: Qd. 05 ou Rua das Flores"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Número / Lote *</label>
                          <input type="text" value={checkoutData.numero} onChange={e => upd('numero', e.target.value)}
                            placeholder="Ex: Casa 03"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Complemento</label>
                          <input type="text" value={checkoutData.complemento} onChange={e => upd('complemento', e.target.value)}
                            placeholder="Apto, Conj..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bairro / Setor *</label>
                        <input type="text" value={checkoutData.bairro} onChange={e => upd('bairro', e.target.value)}
                          placeholder="Ex: Setor Leste"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ponto de Referência</label>
                        <input type="text" value={checkoutData.referencia} onChange={e => upd('referencia', e.target.value)}
                          placeholder="Ex: Próximo ao mercado X, portão azul..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                      </div>
                    </>
                  )}
                </div>
                <div className="p-5 border-t border-gray-100 shrink-0">
                  <button onClick={() => setCheckoutStep(3)} disabled={!canGoToStep3}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-md transition-all">
                    Próximo <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}

            {/* ===== STEP 3: PAGAMENTO ===== */}
            {checkoutStep === 3 && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Forma de Pagamento</label>
                    <div className="space-y-2">
                      {['PIX', 'Cartão de Crédito (Na Entrega)', 'Cartão de Débito (Na Entrega)', 'Dinheiro'].map(op => (
                        <button key={op} onClick={() => upd('pagamento', op)}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            checkoutData.pagamento === op ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}>
                          {op === 'PIX' && '🔑 '}
                          {op.includes('Crédito') && '💳 '}
                          {op.includes('Débito') && '💳 '}
                          {op === 'Dinheiro' && '💵 '}
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  {checkoutData.pagamento === 'Dinheiro' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Troco para quanto?</label>
                      <input type="number" value={checkoutData.troco} onChange={e => upd('troco', e.target.value)}
                        placeholder="Ex: 100.00 (deixe vazio se não precisar)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                    </div>
                  )}

                  {/* Resumo final */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                    <p className="font-bold text-gray-700 mb-2">📋 Resumo do Pedido</p>
                    <div className="flex justify-between text-gray-500"><span>Cliente</span><span className="font-medium text-gray-800">{checkoutData.nome}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Tipo</span><span className="font-medium text-gray-800">{checkoutData.tipoServico === 'delivery' ? 'Delivery' : 'Retirada'}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
                    {taxaEntrega > 0 && <div className="flex justify-between text-gray-500"><span>Taxa de entrega</span><span>R$ {taxaEntrega.toFixed(2).replace('.', ',')}</span></div>}
                    <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span><span>R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100 shrink-0">
                  <button onClick={handleCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all text-base">
                    <MessageCircle size={20} /> Enviar Pedido pelo WhatsApp
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">Você será redirecionado para o WhatsApp</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}