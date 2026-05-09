"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, increment, doc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

function RedirectHandler() {
  const [errorMsg, setErrorMsg] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const shortCode = searchParams.get("id");

  useEffect(() => {
    if (!shortCode) {
      setIsNotFound(true);
      return;
    }

    const handleRedirect = async () => {
      try {
        const q = query(collection(db, "links"), where("shortCode", "==", shortCode));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setIsNotFound(true);
          try {
            const allDocs = await getDocs(collection(db, "links"));
            const codes = allDocs.docs.map(d => d.data().shortCode);
            setDebugInfo(codes);
          } catch(e) {
            console.error(e);
          }
          return;
        }

        const linkDoc = snapshot.docs[0];
        const data = linkDoc.data();

        await updateDoc(doc(db, "links", linkDoc.id), {
          clicks: increment(1)
        });

        window.location.href = data.originalUrl;
      } catch (err: any) {
        console.error("Erro no redirecionamento:", err);
        setErrorMsg(err.message || "Erro desconhecido ao processar o link.");
      }
    };

    handleRedirect();
  }, [shortCode]);

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in text-center">
      {isNotFound ? (
        <>
          <div className="w-16 h-16 brutalist-border border-red-500 flex items-center justify-center bg-surface">
            <span className="text-red-500 font-bold text-2xl">X</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-red-500">
            Link não encontrado no banco de dados.
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm">
            Verifique se a URL curta está correta: [{shortCode || "Nenhum código"}]
          </p>
          <div className="text-xs text-gray-500 mt-4 max-w-lg break-words">
            <strong>Debug - Códigos que existem no banco de dados:</strong><br/>
            {debugInfo.length > 0 ? debugInfo.join(", ") : "Nenhum link salvo no banco de dados!"}
          </div>
        </>
      ) : errorMsg ? (
        <>
          <div className="w-16 h-16 brutalist-border border-red-500 flex items-center justify-center bg-surface">
            <span className="text-red-500 font-bold text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-red-500">
            Erro no Firestore
          </h1>
          <p className="text-gray-400 max-w-md text-sm break-words">
            {errorMsg}
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 brutalist-border-primary flex items-center justify-center bg-surface glow-primary">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            <span className="text-[var(--primary)] text-glow">REDIRECIONANDO</span>...
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm">
            Carregando o seu destino.
          </p>
        </>
      )}
    </div>
  );
}

export default function RedirectPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <Suspense fallback={<Loader2 className="animate-spin text-[var(--primary)]" />}>
        <RedirectHandler />
      </Suspense>
    </div>
  );
}
