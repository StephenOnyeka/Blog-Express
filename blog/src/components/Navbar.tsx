import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchNormal1, Edit, Notification, CloseCircle } from "iconsax-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

interface NavbarProps {
  onSignIn?: () => void;
}

export default function Navbar({ onSignIn }: NavbarProps) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get("/notifications/unread-count");
          setUnreadCount(res.data.count);
        } catch (error) {
          console.error(error);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-neutral-200 py-3">
      <div className="flex items-center justify-between max-w-[1192px] mx-auto px-6 gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="font-serif text-[26px] font-bold text-neutral-900 tracking-[-0.5px] shrink-0"
        >
          BlogExpress
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-[280px] flex items-center gap-2 bg-neutral-50 rounded-full px-4 py-2 text-neutral-500 text-sm transition-colors hover:bg-neutral-100">
          <SearchNormal1 size={16} variant="Linear" color="currentColor" />
          <input
            className="border-none bg-transparent outline-none text-sm text-neutral-900 w-full font-sans placeholder-neutral-500"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && navigate(`/search?q=${search}`)
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/write"
                className="flex items-center gap-1.5 text-neutral-500 text-[15px] font-normal transition-colors py-2 hover:text-neutral-900"
              >
                <Edit size={18} variant="Linear" color="currentColor" />
                <span>Write</span>
              </Link>
              <button
                className="w-9 h-9 rounded-full overflow-hidden cursor-pointer bg-neutral-100 flex items-center justify-center shrink-0 relative"
                aria-label="Notifications"
                onClick={async () => {
                  await api.patch("/notifications/read-all");
                  setUnreadCount(0);
                }}
              >
                <Notification
                  size={20}
                  className="text-neutral-500"
                  variant="Linear"
                  color="currentColor"
                />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>
              <Link
                to={`/profile/${user?.username}`}
                className="w-9 h-9 rounded-full overflow-hidden cursor-pointer bg-neutral-100 flex items-center justify-center shrink-0"
                aria-label="Profile"
              >
                <img
                  className="w-full h-full object-cover"
                  src={
                    user?.avatar ||
                    "https://api.dicebear.com/9.x/avataaars/svg?seed=me&backgroundColor=ffd5dc"
                  }
                  alt="Your avatar"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/write"
                className="flex items-center gap-1.5 text-neutral-500 text-[15px] font-normal transition-colors py-2 hover:text-neutral-900"
              >
                <Edit size={18} variant="Linear" color="currentColor" />
                <span>Write</span>
              </Link>
              <button
                className="text-sm text-neutral-500 font-normal py-2 transition-colors hover:text-neutral-900"
                onClick={onSignIn}
              >
                Sign in
              </button>
              <button
                className="bg-neutral-900 text-white rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-85"
                onClick={onSignIn}
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ========== Sign In Modal ========== */
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onToggleMode: () => void;
  onSuccess: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  mode,
  onToggleMode,
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signin") {
        await login({ email, password });
      } else {
        await register({ name, username, email, password });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-white/95 z-[999] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-10 relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseCircle size={22} variant="Linear" color="currentColor" />
        </button>
        <h2 className="font-serif text-[28px] text-neutral-900 mb-8 mt-2">
          {mode === "signin" ? "Welcome back." : "Join BlogExpress."}
        </h2>

        {error && <div className="text-red-500 mb-2.5">{error}</div>}

        <form onSubmit={handleSubmit} className="w-full">
          {mode === "signup" && (
            <>
              <input
                className="w-full border-b border-neutral-300 py-2.5 text-[15px] text-neutral-900 mb-6 bg-transparent outline-none focus:border-neutral-900 focus:border-b-2 transition-colors"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="w-full border-b border-neutral-300 py-2.5 text-[15px] text-neutral-900 mb-6 bg-transparent outline-none focus:border-neutral-900 focus:border-b-2 transition-colors"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </>
          )}
          <input
            className="w-full border-b border-neutral-300 py-2.5 text-[15px] text-neutral-900 mb-6 bg-transparent outline-none focus:border-neutral-900 focus:border-b-2 transition-colors"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border-b border-neutral-300 py-2.5 text-[15px] text-neutral-900 mb-6 bg-transparent outline-none focus:border-neutral-900 focus:border-b-2 transition-colors"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-neutral-900 text-white rounded-full py-3 mt-4 text-[15px] font-medium transition-opacity hover:opacity-85"
            type="submit"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-sm text-neutral-500">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            className="text-neutral-900 font-medium cursor-pointer"
            onClick={onToggleMode}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
