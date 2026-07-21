import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Store from './pages/Store';
import { Plus, Trash2, LogOut, ShieldCheck, Pizza } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
}

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
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('E-mail ou senha inválidos');
      }

      const data = await response.json();
      // O NestJS retorna o token. Salvamos no localStorage
      localStorage.setItem('token', data.access_token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-4 text-red-600">
          <Pizza size={48} />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Quintal da Lu</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Área Administrativa Restrita</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-600"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
}

// --- PAINEL ADMINISTRATIVO ---
function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Sabores Tradicionais');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // Carregar produtos da API
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error('Erro ao buscar produtos', e);
    }
  };

  useState(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProducts();
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          category
        })
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setPrice('');
        fetchProducts();
      } else {
        alert('Erro ao cadastrar produto. Verifique sua sessão.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Erro ao excluir produto.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
          <ShieldCheck size={24} />
          <span>Painel Administrativo - Quintal da Lu</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold text-sm transition-colors"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulário de Cadastro */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-red-600" /> Novo Produto
          </h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-600"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-600"
                required
              />
            </div>
           <div>
  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-red-600"
  >
    <option value="Sabores Tradicionais">Sabores Tradicionais</option>
    <option value="Sugestões Famosas">Sugestões Famosas</option>
    <option value="Pizzas Doces">Pizzas Doces</option>
    <option value="Calzones">Calzones</option>
    <option value="Bebidas">Bebidas</option>
  </select>
</div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
            >
              Cadastrar Produto
            </button>
          </form>
        </div>

        {/* Listagem de Produtos Cadastrados */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Produtos no Cardápio</h2>
          {products.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum produto cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{p.name}</h4>
                    <p className="text-xs text-gray-500">{p.category} • R$ {Number(p.price).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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