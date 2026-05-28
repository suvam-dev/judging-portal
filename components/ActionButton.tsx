"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ActionButton({ 
  actionFn, 
  children,
  className = "",
  title
}: { 
  actionFn: (prevState: any, formData: FormData) => Promise<{ error: string | null } | void>;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const [state, action, isPending] = useActionState(actionFn as any, { error: null });

  useEffect(() => {
    if (state?.error) {
      alert(`Error: ${state.error}`);
    }
  }, [state?.error]);

  return (
    <form action={action} className="inline-block">
      <button type="submit" disabled={isPending} className={`relative ${className} ${isPending ? "opacity-75 cursor-not-allowed" : ""}`} title={title}>
        <span className={`flex items-center gap-1.5 ${isPending ? "opacity-0" : ""}`}>
          {children}
        </span>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </button>
    </form>
  );
}
