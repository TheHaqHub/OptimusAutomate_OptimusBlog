import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b border-hairline bg-paper">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-ink">
          OptimusBlog
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/create"
                className="text-sm text-ink-muted hover:text-ink"
              >
                Write
              </Link>
              <Link
                to="/profile"
                className="text-sm text-ink-muted hover:text-ink"
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-ink-muted hover:text-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-ink-muted hover:text-ink"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-ink text-paper px-3 py-1.5 rounded-md hover:bg-ink/90"
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