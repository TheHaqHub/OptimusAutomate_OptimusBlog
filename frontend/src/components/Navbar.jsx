import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navBtn =
    "text-sm font-medium text-text border border-border rounded-sm2 px-3 py-1.5 transition-colors hover:bg-card hover:border-primary/50";

  return (
    <header className="border-b border-border bg-bg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-text">
          OptimusBlog
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/create" className={navBtn}>
                Write
              </Link>
              <Link to="/profile" className={navBtn}>
                {user.name}
              </Link>
              <button onClick={handleLogout} className={navBtn}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navBtn}>
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-primary text-text border border-primary px-4 py-1.5 rounded-sm2 transition-colors hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}