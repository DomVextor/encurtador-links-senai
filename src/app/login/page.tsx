"use client";

import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Link2, LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Credenciais inválidas. Tente novamente.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(`Erro ao autenticar com o Google: ${err.message || err.code}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-8 animate-fade-in">
        
        {/* Header Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 brutalist-border-primary flex items-center justify-center bg-surface glow-primary">
            <Link2 className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            ENCURTA<span className="text-[var(--primary)] text-glow">LINK</span>
          </h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest text-center">
            Acesso Restrito
          </p>
        </div>

        {/* Login Box */}
        <div className="brutalist-border bg-surface p-8 relative">
          {/* Cyber accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--primary)] -translate-x-[1px] -translate-y-[1px]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--primary)] translate-x-[1px] translate-y-[1px]"></div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            {error && (
              <div className="bg-red-500/10 brutalist-border border-red-500 p-3 flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-MAIL"
                  className="w-full bg-black brutalist-border p-3 pl-10 text-white placeholder-gray-600 focus-ring uppercase tracking-wider text-sm transition-all"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SENHA"
                  className="w-full bg-black brutalist-border p-3 pl-10 text-white placeholder-gray-600 focus-ring tracking-wider text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary)] text-black font-bold p-3 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 glow-primary"
            >
              <LogIn className="w-5 h-5" />
              {isRegistering ? "Criar Conta" : "Entrar"}
            </button>
            
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute w-full border-t brutalist-border"></div>
              <span className="bg-surface px-4 text-xs text-gray-500 uppercase tracking-widest relative z-10">
                OU
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-black brutalist-border text-white font-bold p-3 uppercase tracking-widest hover:bg-[var(--primary)] hover:text-black hover:border-[var(--primary)] transition-all flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Auth
            </button>
          </form>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-gray-400 hover:text-[var(--primary)] uppercase tracking-widest transition-colors"
            >
              {isRegistering ? "Já tenho uma conta. Fazer Login." : "Não tem conta? Criar nova."}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
