import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTebexUser, getLoginUrl } from "@/lib/tebex";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionToken = searchParams.get("token");
    if (sessionToken) {
      localStorage.setItem("tebex_token", sessionToken);
      getTebexUser(sessionToken).then((data) => {
        if (data) setUser({ id: data.id, username: data.username, avatar: data.avatar });
        navigate("/");
      });
    } else { navigate("/"); }
  }, [searchParams, setUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-bold text-white uppercase italic tracking-widest">Syncing Profile...</h2>
    </div>
  );
};

export default AuthCallback;