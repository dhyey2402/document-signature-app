import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PenTool, Mail, Lock, User } from "lucide-react";
import api from "../services/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Right side form (Swapped side for variety) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 order-2 lg:order-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create an account</h2>
            <p className="text-slate-500 mt-2">Start sending documents for signature today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Left side illustration (now on the right) */}
      <div className="hidden lg:flex w-1/2 relative bg-secondary-900 overflow-hidden items-center justify-center order-1 lg:order-2">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-900/80 to-transparent" />
        
        <div className="relative z-10 text-white max-w-lg p-12 glass rounded-3xl mx-8 border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SignFlow</h1>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            "We reduced our candidate onboarding time by 40% after switching to SignFlow. The interface is clean, and the automated workflows are a game changer."
          </p>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
               <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-medium text-sm">Sarah Jenkins</p>
              <p className="text-xs text-slate-400">HR Director, TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;