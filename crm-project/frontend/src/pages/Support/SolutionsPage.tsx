import { useEffect, useState } from 'react';
import { api, apiEvents, type KBArticle } from '../../api';
import { Plus, Search, BookOpen, FileText, Tag, RefreshCw, X, Trash2 } from 'lucide-react';

export default function SolutionsPage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Write Form state
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: 'Database',
    status: 'Published' as any
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getKBArticles();
      setArticles(data);
      if (data.length > 0 && !selectedArticleId && !showWriteForm) {
        setSelectedArticleId(data[0].article_id);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return apiEvents.subscribe(() => {
      fetchData();
    });
  }, []);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createKBArticle(articleForm);
      setShowWriteForm(false);
      setSelectedArticleId(created.article_id);
      setArticleForm({
        title: '',
        content: '',
        category: 'Database',
        status: 'Published'
      });
    } catch (err) {
      console.error('Error saving article:', err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this solution article?')) {
      try {
        await api.deleteKBArticle(id);
        setSelectedArticleId(null);
      } catch (err) {
        console.error('Error deleting article:', err);
      }
    }
  };

  // Categories extraction
  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];

  // Filters logic
  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedArticle = articles.find(a => a.article_id === selectedArticleId);

  return (
    <div className="solutions-workspace animate-fade-in" style={{ paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top action bar */}
      <div className="action-bar-top" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Knowledge Base Solutions</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Publish technical help documents and issue resolutions</span>
        </div>
        
        {!showWriteForm ? (
          <button className="btn btn-primary" onClick={() => setShowWriteForm(true)}>
            <Plus className="w-4 h-4" />
            <span>Write Solution Article</span>
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => setShowWriteForm(false)}>
            <X className="w-4 h-4" />
            <span>View Library</span>
          </button>
        )}
      </div>

      {/* Main Split Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 2fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Directory & List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Search Box */}
          <div className="card">
            <div className="card-body" style={{ padding: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    paddingLeft: '34px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-main)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setShowWriteForm(false); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles list */}
          <div className="card" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600 inline-block mb-1" />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading articles...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No solution articles found.
                </div>
              ) : (
                filteredArticles.map(art => (
                  <div
                    key={art.article_id}
                    onClick={() => { setSelectedArticleId(art.article_id); setShowWriteForm(false); }}
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: selectedArticleId === art.article_id && !showWriteForm ? 'var(--bg-table-th)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <FileText className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{art.title}</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          <span className="badge" style={{ fontSize: '10px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag className="w-2.5 h-2.5" />
                            {art.category}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {new Date(art.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Document Reader OR Draft Editor */}
        <div style={{ minHeight: '400px' }}>
          
          {showWriteForm ? (
            /* Article Writer Form */
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Write Solution Article</h3>
              </div>
              <form onSubmit={handleCreateArticle}>
                <div className="card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Title */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Article Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Setting up custom MTU sizes for database cluster nodes"
                      value={articleForm.title}
                      onChange={e => setArticleForm({ ...articleForm, title: e.target.value })}
                      required
                      style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>

                  {/* Category & Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Category *</label>
                      <select
                        className="form-control"
                        value={articleForm.category}
                        onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}
                        style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                      >
                        <option value="Database">Database</option>
                        <option value="Billing">Billing</option>
                        <option value="Security">Security</option>
                        <option value="API Integration">API Integration</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Publishing Status</label>
                      <select
                        className="form-control"
                        value={articleForm.status}
                        onChange={e => setArticleForm({ ...articleForm, status: e.target.value as any })}
                        style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Article Content (Supports standard text markdown) *</label>
                    <textarea
                      className="form-control"
                      rows={10}
                      placeholder="Describe symptoms, root causes and detailed resolution steps..."
                      value={articleForm.content}
                      onChange={e => setArticleForm({ ...articleForm, content: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit' }}
                    />
                  </div>

                </div>

                <div className="card-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowWriteForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Publish Article</button>
                </div>
              </form>
            </div>
          ) : selectedArticle ? (
            /* Article Reader Panel */
            <div className="card animate-fade-in">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                <div>
                  <span className="badge" style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none' }}>
                    {selectedArticle.category}
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                    Published: {new Date(selectedArticle.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Deletion actions */}
                <button 
                  onClick={() => handleDeleteArticle(selectedArticle.article_id)}
                  style={{ background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600 }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="card-body" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {selectedArticle.title}
                </h1>
                
                {/* Author display */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-table-th)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {selectedArticle.creator_name ? selectedArticle.creator_name[0] : 'U'}
                  </div>
                  <span>Written by <strong>{selectedArticle.creator_name || 'System Representative'}</strong></span>
                </div>

                {/* Article body content */}
                <div style={{ 
                  fontSize: '14.5px', 
                  color: 'var(--text-primary)', 
                  lineHeight: 1.7, 
                  whiteSpace: 'pre-wrap',
                  backgroundColor: 'var(--bg-main)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}>
                  {selectedArticle.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <BookOpen className="w-10 h-10 text-slate-300" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>Select an article from the directory panel to read it here.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
