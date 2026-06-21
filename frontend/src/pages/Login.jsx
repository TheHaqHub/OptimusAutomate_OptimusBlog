import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Welcome back. Your next post is waiting.">
      <h1 className="font-heading font-bold text-2xl text-text mb-1">Log in</h1>
      <p className="text-sm text-muted mb-8">Welcome back to OptimusBlog.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-border rounded-sm2 px-3 py-2 text-sm bg-card text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full border border-border rounded-sm2 px-3 py-2 text-sm bg-card text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-text text-sm font-semibold rounded-sm2 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-secondary font-medium underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}