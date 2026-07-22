import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Store from './pages/Store';
import {
  Plus, Trash2, LogOut, ShieldCheck, Pizza, Pencil, Search,
  TrendingUp, TrendingDown, DollarSign, Package,
  BarChart3, ChevronDown, Filter, ArrowUpCircle, ArrowDownCircle,
  MessageCircle, Smartphone, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Product {
  id: number;
  nome: string;
  description?: string;
  price: number;
  category: string;
  ativo: boolean;
  image?: string;
}

interface Transacao {
  id: number;
  tipo: 'RECEITA' | 'DESPESA';
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}

interface ResumoFinanceiro {
  receitas: number;
  despesas: number;
  lucro: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- TELA DE LOGIN ---
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('E-mail ou senha inválidos');

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-orange-100">
        <div className="flex justify-center mb-4 text-red-600">
          <Pizza size={48} />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Quintal da Lu</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Área Administrativa Restrita</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" required />
          </div>
          <button type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
}

// --- PAINEL ADMINISTRATIVO ---
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'produtos' | 'financeiro' | 'whatsapp'>('produtos');

  // Estado Produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Sabores Tradicionais');
  const [image, setImage] = useState('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Estado Financeiro
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro>({ receitas: 0, despesas: 0, lucro: 0 });
  const [tipoLancamento, setTipoLancamento] = useState<'RECEITA' | 'DESPESA'>('RECEITA');
  const [descricaoFin, setDescricaoFin] = useState('');
  const [valorFin, setValorFin] = useState('');
  const [categoriaFin, setCategoriaFin] = useState('Pedido');
  const [dataFin, setDataFin] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [loadingFin, setLoadingFin] = useState(false);

  // Estado WhatsApp
  const [waStatus, setWaStatus] = useState<'DISCONNECTED' | 'WAITING_QR' | 'CONNECTED'>('DISCONNECTED');
  const [waQr, setWaQr] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'financeiro') fetchFinanceiro();
  }, [activeTab, filtroInicio, filtroFim]);

  useEffect(() => {
    let interval: any;
    if (activeTab === 'whatsapp') {
      fetchWaStatus();
      interval = setInterval(fetchWaStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  // --- WhatsApp ---
  const fetchWaStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWaStatus(data.status);
        setWaQr(data.qr);
      }
    } catch (e) { console.error(e); }
  };

  const handleWaLogout = async () => {
    if (!confirm('Desconectar o robô do WhatsApp atual?')) return;
    try {
      await fetch(`${API_URL}/whatsapp/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchWaStatus();
    } catch (e) { console.error(e); }
  };

  // --- Produtos ---
  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande! Escolha uma imagem de até 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Sabores Tradicionais');
    setImage('');
  };

  const handleEditClick = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.nome);
    setDescription(p.description || '');
    setPrice(String(p.price));
    setCategory(p.category || 'Sabores Tradicionais');
    setImage(p.image || '');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`;
      const method = editingProductId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome: name, description, price: Number(price), category, image: image || undefined })
      });
      if (res.ok) { cancelEdit(); fetchProducts(); }
      else alert(`Erro ao ${editingProductId ? 'editar' : 'cadastrar'} produto.`);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
      else alert('Erro ao excluir produto.');
    } catch (err) { console.error(err); }
  };

  // --- Financeiro ---
  const fetchFinanceiro = async () => {
    setLoadingFin(true);
    try {
      const params = new URLSearchParams();
      if (filtroInicio) params.set('inicio', filtroInicio);
      if (filtroFim) params.set('fim', filtroFim);
      const res = await fetch(`${API_URL}/financeiro?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTransacoes(data.transacoes || []);
      setResumo(data.resumo || { receitas: 0, despesas: 0, lucro: 0 });
    } catch (e) { console.error(e); }
    finally { setLoadingFin(false); }
  };

  const handleCreateTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/financeiro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tipo: tipoLancamento,
          descricao: descricaoFin,
          valor: Number(valorFin),
          categoria: categoriaFin,
          data: dataFin || undefined,
        })
      });
      if (res.ok) {
        setDescricaoFin(''); setValorFin(''); setDataFin('');
        fetchFinanceiro();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteTransacao = async (id: number) => {
    if (!confirm('Excluir este lançamento?')) return;
    try {
      await fetch(`${API_URL}/financeiro/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFinanceiro();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  const categoriasReceita = ['Pedido', 'Outro'];
  const categoriasDespesa = ['Ingredientes', 'Embalagens', 'Contas (luz/água/gás)', 'Salários', 'Outro'];

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
          <ShieldCheck size={24} />
          <span className="hidden sm:inline">Painel Administrativo — Quintal da Lu</span>
          <span className="sm:hidden">Admin</span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-semibold text-sm transition-colors">
          <LogOut size={18} /> Sair
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-0 max-w-5xl mx-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'produtos' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Package size={16} /> Produtos
          </button>
          <button
            onClick={() => setActiveTab('financeiro')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'financeiro' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <BarChart3 size={16} /> Financeiro
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'whatsapp' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <MessageCircle size={16} /> WhatsApp Bot
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* ===== ABA WHATSAPP ===== */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <MessageCircle className="text-green-600" /> Atendimento Automático
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Conecte seu WhatsApp da loja. O robô responderá automaticamente com o cardápio sempre que alguém disser "boa noite", "olá", "cardápio", etc.
              </p>

              {waStatus === 'WAITING_QR' && waQr && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <img src={waQr} alt="QR Code WhatsApp" className="w-64 h-64 mx-auto rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-xl text-sm font-semibold">
                    <AlertCircle size={18} />
                    <span>Aguardando leitura do QR Code...</span>
                  </div>
                  <ol className="text-left text-sm text-gray-600 space-y-2 max-w-sm mt-4">
                    <li>1. Abra o WhatsApp no celular da loja</li>
                    <li>2. Vá em Configurações &gt; Aparelhos Conectados</li>
                    <li>3. Toque em "Conectar um Aparelho"</li>
                    <li>4. Aponte a câmera para o QR Code acima</li>
                  </ol>
                </div>
              )}

              {waStatus === 'CONNECTED' && (
                <div className="flex flex-col items-center justify-center space-y-6 py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Robô Conectado e Ativo!</h3>
                    <p className="text-sm text-gray-500 mt-1">Sua pizzaria já está respondendo no automático.</p>
                  </div>
                  <button onClick={handleWaLogout}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-6 rounded-xl transition-all text-sm">
                    <Smartphone size={18} /> Desconectar Celular
                  </button>
                </div>
              )}

              {waStatus === 'DISCONNECTED' && !waQr && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-gray-500 text-sm">Iniciando sistema do WhatsApp...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ABA PRODUTOS ===== */}
        {activeTab === 'produtos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formulário de Cadastro */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                {editingProductId ? (
                  <><Pencil size={18} className="text-red-600" /> Editar Produto</>
                ) : (
                  <><Plus size={18} className="text-red-600" /> Novo Produto</>
                )}
              </h2>
              <form onSubmit={handleCreateProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Imagem do Produto (opcional)</label>
                  <div className="flex gap-2 items-center">
                    <input type="file" accept="image/*" onChange={handleImageUpload}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-1.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                  </div>
                  {image && (
                    <div className="mt-2">
                      <p className="text-xs text-green-600 mb-1 font-semibold">Imagem anexada com sucesso!</p>
                      <img src={image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-400">Ou cole o link direto:</div>
                  <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 mt-1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all">
                    <option value="Sabores Tradicionais">Sabores Tradicionais</option>
                    <option value="Sugestões Famosas">Sugestões Famosas</option>
                    <option value="Pizzas Doces">Pizzas Doces</option>
                    <option value="Calzones">Calzones</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-1">
                  <button type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-sm">
                    {editingProductId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={cancelEdit}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition-all text-sm border border-gray-200">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Listagem de Produtos */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center">
                  Produtos no Cardápio
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{products.length}</span>
                </h2>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
              </div>
              
              {products.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Nenhum produto cadastrado ainda.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {products.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))).map((p) => (
                    <div key={p.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${p.ativo !== false ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-100 opacity-60'}`}>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{p.nome}</h4>
                        <p className="text-xs text-gray-500">{p.category} • {formatCurrency(Number(p.price))}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditClick(p)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ABA FINANCEIRO ===== */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Receitas</span>
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-black text-green-600">{formatCurrency(resumo.receitas)}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Despesas</span>
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrendingDown size={16} className="text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-black text-red-600">{formatCurrency(resumo.despesas)}</p>
              </div>
              <div className={`rounded-2xl p-5 shadow-sm border ${resumo.lucro >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resultado</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${resumo.lucro >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    <DollarSign size={16} className={resumo.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'} />
                  </div>
                </div>
                <p className={`text-2xl font-black ${resumo.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo.lucro)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulário de Lançamento */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-red-600" /> Novo Lançamento
                </h2>

                {/* Toggle Receita/Despesa */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => { setTipoLancamento('RECEITA'); setCategoriaFin('Pedido'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${tipoLancamento === 'RECEITA' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <ArrowUpCircle size={14} /> Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipoLancamento('DESPESA'); setCategoriaFin('Ingredientes'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${tipoLancamento === 'DESPESA' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <ArrowDownCircle size={14} /> Despesa
                  </button>
                </div>

                <form onSubmit={handleCreateTransacao} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
                    <input type="text" value={descricaoFin} onChange={(e) => setDescricaoFin(e.target.value)}
                      placeholder={tipoLancamento === 'RECEITA' ? 'Ex: Pedido Mesa 5' : 'Ex: Farinha de trigo'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" value={valorFin} onChange={(e) => setValorFin(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
                    <select value={categoriaFin} onChange={(e) => setCategoriaFin(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all">
                      {(tipoLancamento === 'RECEITA' ? categoriasReceita : categoriasDespesa).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Data (opcional)</label>
                    <input type="date" value={dataFin} onChange={(e) => setDataFin(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all" />
                  </div>
                  <button type="submit"
                    className={`w-full font-bold py-2.5 rounded-xl transition-all shadow-md text-sm text-white active:scale-95 ${tipoLancamento === 'RECEITA' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    Registrar {tipoLancamento === 'RECEITA' ? 'Receita' : 'Despesa'}
                  </button>
                </form>
              </div>

              {/* Histórico de Transações */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" /> Histórico
                  </h2>
                  <div className="flex items-center gap-2">
                    <ChevronDown size={14} className="text-gray-400 hidden" />
                    <input type="date" value={filtroInicio} onChange={(e) => setFiltroInicio(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                    <span className="text-gray-400 text-xs">até</span>
                    <input type="date" value={filtroFim} onChange={(e) => setFiltroFim(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                  </div>
                </div>

                {loadingFin ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 text-sm">Carregando...</div>
                ) : transacoes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                    <DollarSign size={40} />
                    <p className="text-sm mt-2">Nenhum lançamento encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                    {transacoes.map((t) => (
                      <div key={t.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${t.tipo === 'RECEITA' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${t.tipo === 'RECEITA' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {t.tipo === 'RECEITA'
                              ? <ArrowUpCircle size={14} className="text-green-600" />
                              : <ArrowDownCircle size={14} className="text-red-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">{t.descricao}</p>
                            <p className="text-xs text-gray-500">{t.categoria} • {formatDate(t.data)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                          <span className={`font-black text-sm ${t.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(t.valor)}
                          </span>
                          <button onClick={() => handleDeleteTransacao(t.id)}
                            className="p-1.5 text-gray-300 hover:text-red-600 transition-colors rounded-lg hover:bg-red-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- CONFIGURAÇÃO DE ROTAS ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}