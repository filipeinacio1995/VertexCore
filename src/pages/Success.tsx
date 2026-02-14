import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { CheckCircle2 } from "lucide-react";

const Success = () => {
  const { clearCart } = useCart();
  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-center">
      <div className="glass p-12 rounded-3xl border border-primary/20 max-w-md">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-black text-white uppercase italic mb-4">Payment Success!</h1>
        <p className="text-muted-foreground mb-8">Items will arrive in-game shortly.</p>
        <Link to="/" className="block w-full py-4 bg-primary text-black font-bold uppercase rounded-xl">Home</Link>
      </div>
    </div>
  );
};

export default Success;