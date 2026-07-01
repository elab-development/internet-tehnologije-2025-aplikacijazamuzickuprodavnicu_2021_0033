import { Suspense } from "react";
import KurseviContent from "../../components/ProizvodiContent";
import { Loader2 } from "lucide-react";

export default function ProizvodiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="animate-spin mb-4 mx-auto" size={48} />
            <p className="font-bold">Učitavanje proizvoda...</p>
          </div>
        </div>
      }
    >
      <KurseviContent />
    </Suspense>
  );
}