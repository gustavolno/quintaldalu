import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Store from './pages/Store';
import {
  Plus, Trash2, LogOut, ShieldCheck, Pizza,
  TrendingUp, TrendingDown, DollarSign, Package,
  BarChart3, ChevronDown, Filter, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';

interface Product {
  id: number;
  nome: string;
  description?: string;
  price: number;
  category: string;
  ativo: boolean;
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
  const [activeTab, setActiveTab] = useState<'produtos' | 'financeiro'>('produtos');

  // Estado Produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Sabores Tradicionais');

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

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'financeiro') fetchFinanceiro();
  }, [activeTab, filtroInicio, filtroFim]);

  // --- Produtos ---
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) { console.error(e); }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome: name, description, price: Number(price), category })
      });
      if (res.ok) { setName(''); setDescription(''); setPrice(''); fetchProducts(); }
      else alert('Erro ao cadastrar produto.');
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
        <div className="flex gap-0 max-w-5xl mx-auto">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'produtos' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Package size={16} /> Produtos
          </button>
          <button
            onClick={() => setActiveTab('financeiro')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === 'financeiro' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <BarChart3 size={16} /> Financeiro
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* ===== ABA PRODUTOS ===== */}
        {activeTab === 'produtos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formulário de Cadastro */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-red-600" /> Novo Produto
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
                <button type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-sm mt-1">
                  Cadastrar Produto
                </button>
              </form>
            </div>

            {/* Listagem de Produtos */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Produtos no Cardápio
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{products.length}</span>
              </h2>
              {products.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Nenhum produto cadastrado ainda.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {products.map((p) => (
                    <div key={p.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${p.ativo !== false ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-100 opacity-60'}`}>
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{p.nome}</h4>
                        <p className="text-xs text-gray-500">{p.category} • {formatCurrency(Number(p.price))}</p>
                      </div>
                      <button onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-300 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
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