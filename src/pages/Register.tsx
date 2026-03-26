import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="w-full max-w-md bg-card rounded-2xl p-6 shadow-elevated space-y-4"
      >
        <h1 className="text-2xl font-bold font-display text-card-foreground">Create Account</h1>
        <p className="text-sm text-muted-foreground">Use real details to receive live personalized insights.</p>

        <div className="space-y-2">
          <label className="text-sm">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-accent/40 px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-accent/40 px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-border bg-accent/40 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-xl gradient-hero py-2 text-primary-foreground font-semibold">
          {loading ? "Creating..." : "Register"}
        </button>

        <button type="button" onClick={() => navigate("/login")} className="w-full rounded-xl border border-border py-2 text-sm">
          Back to login
        </button>
      </motion.form>
    </div>
  );
};

export default Register;
