"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Newspaper, Plus, CheckCircle2, AlertCircle, Edit2, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Market News");
  const [imageUrl, setImageUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBlogs(data);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Market News");
    setImageUrl("");
    setSummary("");
    setContent("");
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingId(b.id);
    setTitle(b.title);
    setCategory(b.category || "Market News");
    setImageUrl(b.image_url || "");
    setSummary(b.summary || "");
    setContent(b.content || "");
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("blogs").delete().eq("id", id);
    fetchBlogs();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const payload = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      category,
      image_url: imageUrl,
      summary,
      content,
      is_published: true,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("blogs").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("blogs").insert(payload);
      error = res.error;
    }

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: `Article ${editingId ? "updated" : "published"} successfully!`, type: "success" });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchBlogs();
      }, 1000);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Blog & News Articles CMS</h1>
          <p className="text-xs text-slate-500 mt-1">Publish platform announcements, investment strategies, and market analysis articles.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-md shadow-indigo-600/15"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Article</span>
        </button>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full minimal-card p-8 text-center text-slate-400 text-xs">
            No published blog articles yet. Click "Publish New Article" above to create one.
          </div>
        ) : (
          blogs.map((b) => (
            <div key={b.id} className="minimal-card p-6 border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                {b.image_url && (
                  <img src={b.image_url} alt={b.title} className="w-full h-36 object-cover rounded-xl border border-slate-200 mb-3" />
                )}
                
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase">
                    {b.category || "General"}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleOpenEdit(b)} className="p-1 text-slate-400 hover:text-indigo-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-1 text-slate-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mt-2 line-clamp-2">{b.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">{b.summary || b.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Published on {new Date(b.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">{editingId ? "Edit Article" : "Publish Article"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Investment Trends & Market Insights"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Market News"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Featured Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Summary / Excerpt</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short excerpt for article card..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Article Body Content</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write full article body text..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full minimal-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {submitting ? "Saving..." : editingId ? "Save Article Changes" : "Publish Article"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
