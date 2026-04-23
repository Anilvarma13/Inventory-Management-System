import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ShoppingCart, Users, Settings, LogOut, Package, History, TrendingUp, DollarSign, AlertCircle, BarChart3, ArrowUpRight, ArrowDownRight, ShieldCheck, LineChart as LineIcon, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const API_BASE = 'http://localhost:8000/api';
const COLORS = ['#00D4AA', '#7C5CFC', '#F5A623', '#F04E6A', '#0B1829'];

// --- AUTH ---
const AuthContext = React.createContext<any>(null);
const AuthProvider = ({ children }: any) => {
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const login = (u: any) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('user'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
const useAuth = () => React.useContext(AuthContext);

// --- LOGIN ---
const LoginPage = () => {
  const [creds, setCreds] = React.useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) });
    if (res.ok) { login(await res.json()); navigate('/'); } else alert('Invalid Credentials');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)' }}>
      <div className="card" style={{ width: '380px', padding: '48px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: 'var(--teal)', borderRadius: '16px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={32} color="var(--navy)" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px' }}>StockFlow Pro</h2>
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--slate-50)', marginBottom: '4px', display: 'block' }}>Username</label>
            <input type="text" className="btn btn-outline" style={{ width: '100%', textAlign: 'left', background: 'white' }} value={creds.username} onChange={e => setCreds({...creds, username: e.target.value})} required />
          </div>
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '12px', color: 'var(--slate-50)', marginBottom: '4px', display: 'block' }}>Password</label>
            <input type="password" className="btn btn-outline" style={{ width: '100%', textAlign: 'left', background: 'white' }} value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-teal" style={{ width: '100%', justifyContent: 'center' }}>Enter System</button>
        </form>
      </div>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = () => {
  const [stats, setStats] = React.useState<any>(null);
  React.useEffect(() => { fetch(`${API_BASE}/dashboard/stats`).then(res => res.json()).then(setStats); }, []);

  return (
    <div className="anim-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy)' }}>Intelligence Hub</h1>
          <p style={{ color: 'var(--slate-50)' }}>Advanced sellers and inventory health tracking.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '12px', color: 'var(--slate-30)' }}>System Health</div>
           <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--teal)' }}>96.8%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCard icon={Box} label="Stocked SKUs" value={stats?.totalProducts} color="teal" />
        <StatCard icon={DollarSign} label="Inventory Value" value={`$${(stats?.inventoryValue / 1000).toFixed(1)}k`} color="violet" />
        <StatCard icon={AlertCircle} label="Risk Alerts" value={stats?.lowStockAlerts} color="rose" alert={stats?.lowStockAlerts > 0} />
        <StatCard icon={TrendingUp} label="Turnover Rate" value="4.8x" color="amber" />
      </div>

      <div className="card" style={{ height: '300px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineIcon size={18} /> Asset Value Trend
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={stats?.inventoryTrend}>
            <defs><linearGradient id="cV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--teal)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="month" hide />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="var(--teal)" strokeWidth={3} fill="url(#cV)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card" style={{ height: '300px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--teal-dim)' }}><ArrowUpRight size={18} /> Top Sellers</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={stats?.bestSellers}>
              <XAxis dataKey="name" hide />
              <Tooltip />
              <Bar dataKey="value" fill="var(--teal)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ height: '300px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--rose)' }}><ArrowDownRight size={18} /> Slow Moving Stock</h3>
          <div style={{ overflowY: 'auto', height: '80%' }}>
             {stats?.worstProducts?.map((p: any, i: number) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--slate-05)' }}>
                 <span style={{ fontWeight: 600 }}>{p.name}</span>
                 <span className="badge badge-danger" style={{ fontSize: '10px' }}>{p.value} qty</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, alert }: any) => (
  <div className="card">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ padding: '10px', background: `var(--${color}-pale)`, borderRadius: '12px', color: `var(--${color === 'teal' ? 'teal-dim' : color})` }}><Icon size={24} /></div>
      {alert && <div className="pulse" style={{ width: '10px', height: '10px', background: 'var(--rose)', borderRadius: '50%' }} />}
    </div>
    <div style={{ fontSize: '28px', fontWeight: 800 }}>{value ?? '...'}</div>
    <div style={{ fontSize: '12px', color: 'var(--slate-30)' }}>{label}</div>
  </div>
);

// --- MODALS ---
const ProductModal = ({ isOpen, onClose, onSave, categories }: any) => {
  const [formData, setFormData] = React.useState({ name: '', sku: '', category: '', price: '', quantity: '', reorderPoint: '10' });
  const [isCustomCategory, setIsCustomCategory] = React.useState(false);
  const [customCategory, setCustomCategory] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategory : formData.category;
    onSave({ ...formData, category: finalCategory });
    setFormData({ name: '', sku: '', category: '', price: '', quantity: '', reorderPoint: '10' });
    setCustomCategory('');
    setIsCustomCategory(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 800 }}>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Wireless Mouse" />
            </div>
            <div className="form-group">
              <label>SKU Number</label>
              <input type="text" className="form-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required placeholder="SKU-001" />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            {!isCustomCategory ? (
              <select 
                className="form-input" 
                value={formData.category} 
                onChange={e => {
                  if (e.target.value === 'ADD_NEW') {
                    setIsCustomCategory(true);
                  } else {
                    setFormData({...formData, category: e.target.value});
                  }
                }}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--teal)' }}>+ Add Custom Category</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={customCategory} 
                  onChange={e => setCustomCategory(e.target.value)} 
                  placeholder="Enter custom category" 
                  required 
                  autoFocus
                />
                <button type="button" className="btn btn-outline" onClick={() => setIsCustomCategory(false)}>Cancel</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Initial Qty</label>
              <input type="number" className="form-input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Reorder Point</label>
              <input type="number" className="form-input" value={formData.reorderPoint} onChange={e => setFormData({...formData, reorderPoint: e.target.value})} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="btn btn-teal" style={{ flex: 1, justifyContent: 'center' }}>Save Product</button>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Discard</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- INVENTORY ---
const Inventory = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { user } = useAuth();
  
  const fetchProducts = () => { fetch(`${API_BASE}/products`).then(res => res.json()).then(setProducts); };
  React.useEffect(fetchProducts, []);

  const handleAdjust = (productId: number, adjustment: number) => {
    fetch(`${API_BASE}/inventory/adjust`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, adjustment }) }).then(fetchProducts);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product? This will remove all associated inventory data.')) {
      const res = await fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Error deleting product');
      }
    }
  };

  const handleSaveProduct = async (data: any) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchProducts();
    } else {
      const err = await res.json();
      alert(err.detail || 'Error saving product');
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className="anim-fade-up">
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy)' }}>Inventory</h1>
          <button className="btn btn-teal" onClick={() => setIsModalOpen(true)}>Add Product</button>
       </div>
       
       <ProductModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         onSave={handleSaveProduct}
         categories={categories}
       />

       <table className="data-table">
          <thead>
            <tr><th>Product / SKU</th><th>Category</th><th>Qty</th><th>Asset Value</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: '11px', color: 'var(--slate-30)' }}>{p.sku}</div></td>
                <td>{p.category}</td>
                <td style={{ fontWeight: 800 }}>{p.quantity}</td>
                <td>${(p.price * p.quantity).toLocaleString()}</td>
                <td><span className={`badge ${p.status === 'In Stock' ? 'badge-success' : p.status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span></td>
                <td><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleAdjust(p.id, 1)} className="btn btn-outline" style={{ padding: '2px 8px' }}>+</button>
                    <button onClick={() => handleAdjust(p.id, -1)} className="btn btn-outline" style={{ padding: '2px 8px' }}>-</button>
                  </div>
                  {user?.role === 'Admin' && (
                    <button 
                      onClick={() => handleDeleteProduct(p.id)} 
                      className="btn btn-outline" 
                      style={{ padding: '6px', color: 'var(--rose)', borderColor: 'rgba(240, 78, 106, 0.2)' }}
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div></td>
              </tr>
            ))}
          </tbody>
       </table>
    </div>
  );
};

// --- AUDIT ---
const AuditTrail = () => {
  const [logs, setLogs] = React.useState<any[]>([]);
  React.useEffect(() => { fetch(`${API_BASE}/audit-logs`).then(res => res.json()).then(setLogs); }, []);
  return (
    <div className="anim-fade-up">
       <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy)', marginBottom: '32px' }}>Audit Log</h1>
       <div className="card" style={{ padding: '0' }}>
         {logs.map(log => (
           <div key={log.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--slate-05)', display: 'flex', gap: '16px' }}>
             <div style={{ width: '40px', height: '40px', background: 'var(--slate-05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><History size={18} color="var(--slate-30)" /></div>
             <div><div style={{ fontSize: '14px', fontWeight: 600 }}>{log.change_summary}</div><div style={{ fontSize: '12px', color: 'var(--slate-30)' }}>{new Date(log.timestamp).toLocaleString()}</div></div>
           </div>
         ))}
       </div>
    </div>
  );
};

// --- LAYOUT ---
const ProtectedLayout = ({ children }: any) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [stats, setStats] = React.useState<any>(null);
  React.useEffect(() => { if (user) fetch(`${API_BASE}/dashboard/stats`).then(res => res.json()).then(setStats); }, [location.pathname]);
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="app-container">
      <div className="sidebar" style={{ width: '280px', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--teal)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24} color="var(--navy)" /></div>
          <span style={{ fontSize: '20px', fontWeight: 800 }}>StockFlow Pro</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <NavItem to="/inventory" icon={Box} label="Stock" active={location.pathname === '/inventory'} count={stats?.lowStockAlerts} />
          <NavItem to="/audit" icon={History} label="Audit" active={location.pathname === '/audit'} />
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}><div onClick={logout} style={{ padding: '12px 16px', color: 'var(--rose)', cursor: 'pointer', fontSize: '14px', display: 'flex', gap: '8px' }}><LogOut size={18} /> Sign Out</div></div>
      </div>
      <main className="main-content" style={{ marginLeft: '280px', padding: '48px 60px' }}>{children}</main>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, active, count }: any) => (
  <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: active ? 'rgba(0, 212, 170, 0.1)' : 'transparent', color: active ? 'var(--teal)' : 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 500, fontSize: '14px', position: 'relative' }}>
    <Icon size={20} /> {label}
    {count > 0 && <span style={{ position: 'absolute', right: '12px', background: 'var(--rose)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{count}</span>}
  </Link>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
          <Route path="/audit" element={<ProtectedLayout><AuditTrail /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
