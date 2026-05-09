"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  Link2, 
  Plus, 
  ExternalLink, 
  Copy, 
  Trash2, 
  LogOut, 
  Loader2,
  Globe,
  Zap,
  BarChart3,
  Edit2,
  X,
  QrCode,
  Download
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  userId: string;
  createdAt: any;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editShortCode, setEditShortCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);

  // Redirecionamento manual
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "links"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LinkData[];
      
      // Ordenação local (o Firestore não permite orderBy com where sem índice composto às vezes)
      setLinks(linksData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    return () => unsubscribe();
  }, [user]);

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !user) return;

    setLoading(true);
    try {
      const shortCode = generateShortCode();
      await addDoc(collection(db, "links"), {
        originalUrl: url.startsWith("http") ? url : `https://${url}`,
        shortCode,
        clicks: 0,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setUrl("");
    } catch (error) {
      console.error("Erro ao encurtar", error);
      alert("Erro ao salvar o link no Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente deletar este link?")) {
      try {
        await deleteDoc(doc(db, "links", id));
      } catch (error) {
        console.error("Erro ao deletar", error);
      }
    }
  };

  const handleCopy = (shortCode: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    alert("Copiado: " + fullUrl);
  };

  const handleEdit = (link: LinkData) => {
    setEditingLink(link);
    setEditUrl(link.originalUrl);
    setEditShortCode(link.shortCode);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink || !editUrl || !editShortCode) return;

    setIsUpdating(true);
    try {
      // Validar se o novo shortCode já existe (e não é o atual)
      if (editShortCode !== editingLink.shortCode) {
        const q = query(collection(db, "links"), where("shortCode", "==", editShortCode));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          alert("Este código encurtado já está em uso. Escolha outro.");
          setIsUpdating(false);
          return;
        }
      }

      await updateDoc(doc(db, "links", editingLink.id), {
        originalUrl: editUrl.startsWith("http") ? editUrl : `https://${editUrl}`,
        shortCode: editShortCode,
      });
      
      setEditingLink(null);
    } catch (error) {
      console.error("Erro ao atualizar", error);
      alert("Erro ao atualizar o link.");
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 900, 900);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qrcode-${selectedQrCode?.split('/').pop()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (authLoading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="brutalist-border border-x-0 border-t-0 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 brutalist-border-primary flex items-center justify-center bg-surface glow-primary">
              <Link2 className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block uppercase">
              Encurta<span className="text-[var(--primary)] text-glow">Link</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">OPERADOR</span>
              <span className="text-sm font-mono text-gray-300">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="group flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest text-[10px] font-bold"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 w-full flex-1">
        {/* Input Area */}
        <section className="mb-16 animate-fade-in">
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                Encurtar <span className="text-[var(--primary)]">+</span>
              </h2>
              <p className="text-gray-500 text-sm uppercase tracking-widest">Insira o link original para reduzir</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[var(--primary)] transition-colors" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="DIGITE A URL ORIGINAL (EX: GOOGLE.COM)"
                  className="w-full bg-surface brutalist-border p-5 pl-12 text-white placeholder-gray-700 focus-ring uppercase tracking-wider text-sm transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--primary)] text-black font-black px-10 py-5 uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 glow-primary"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Plus className="w-6 h-6" />}
                Processar
              </button>
            </form>
          </div>
        </section>

        {/* Links Grid */}
        <section className="animate-fade-in delay-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Links Ativos ({links.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {links.map((link) => (
              <div
                key={link.id}
                className="brutalist-border bg-surface p-6 group hover:border-[var(--primary)] transition-all relative overflow-hidden"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  <div className="flex flex-col gap-2 overflow-hidden w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                      <a 
                        href={`/r/${link.shortCode}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-2xl font-black text-[var(--primary)] hover:text-white transition-colors flex items-center gap-2"
                      >
                        /{link.shortCode}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <p className="text-xs font-mono truncate max-w-[200px] sm:max-w-md">
                        {link.originalUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-800">
                    <div className="flex flex-col items-center px-6 border-r border-gray-800">
                      <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">CLIQUES</span>
                      <span className="text-xl font-mono font-bold text-white">{link.clicks}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(link.shortCode)}
                        className="p-3 brutalist-border hover:bg-white hover:text-black transition-all flex items-center gap-2 group/btn"
                        title="Copiar Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedQrCode(`${window.location.origin}/r/${link.shortCode}`)}
                        className="p-3 brutalist-border hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-black transition-all"
                        title="Gerar QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(link)}
                        className="p-3 brutalist-border hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-black transition-all"
                        title="Editar Link"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-3 brutalist-border hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
                        title="Deletar Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {links.length === 0 && (
              <div className="brutalist-border border-dashed border-gray-800 p-20 flex flex-col items-center gap-4 text-center">
                <Zap className="w-12 h-12 text-gray-800" />
                <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">Nenhum link gerado no sistema</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t brutalist-border border-x-0 border-b-0 text-center opacity-30">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold">
          © 2024 ENCURTA LINK SENAI // SISTEMA DE REDIRECIONAMENTO SEGURO
        </p>
      </footer>

      {/* Edit Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface brutalist-border p-8 relative">
            <button 
              onClick={() => setEditingLink(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  Editar <span className="text-[var(--primary)]">Link</span>
                </h2>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Ajuste as configurações do seu link</p>
              </div>

              <form onSubmit={handleUpdate} className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL Original</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[var(--primary)] transition-colors" />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="URL ORIGINAL"
                        className="w-full bg-black brutalist-border p-4 pl-12 text-white placeholder-gray-700 focus-ring uppercase tracking-wider text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código Encurtado</label>
                    <div className="relative group">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[var(--primary)] transition-colors" />
                      <input
                        type="text"
                        value={editShortCode}
                        onChange={(e) => setEditShortCode(e.target.value)}
                        placeholder="CÓDIGO CUSTOMIZADO"
                        className="w-full bg-black brutalist-border p-4 pl-12 text-white placeholder-gray-700 focus-ring uppercase tracking-wider text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingLink(null)}
                    className="flex-1 brutalist-border text-white font-bold p-4 uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-[var(--primary)] text-black font-black p-4 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 glow-primary"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-surface brutalist-border p-8 relative flex flex-col items-center gap-8">
            <button 
              onClick={() => setSelectedQrCode(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center flex flex-col gap-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                QR <span className="text-[var(--primary)]">Code</span>
              </h2>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest leading-relaxed">
                Aponte a câmera para acessar o link encurtado
              </p>
            </div>

            <div className="p-4 bg-white brutalist-border glow-primary">
              <QRCodeSVG
                id="qr-code-svg"
                value={selectedQrCode}
                size={240}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="flex flex-col w-full gap-4">
              <div className="bg-black/50 p-4 brutalist-border border-dashed border-gray-800">
                <p className="text-[10px] font-mono text-gray-500 break-all text-center uppercase tracking-wider">
                  {selectedQrCode}
                </p>
              </div>

              <button
                onClick={downloadQRCode}
                className="w-full bg-[var(--primary)] text-black font-black p-4 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all glow-primary"
              >
                <Download className="w-5 h-5" />
                Baixar PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
