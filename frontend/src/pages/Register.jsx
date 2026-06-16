import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PenTool, Mail, Lock, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      // auto-login after registration
      login(res.data.access_token);
      toast.success("Account created! Welcome to SignFlow.");
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initials avatar derived from name input
  const initials = formData.name
    ? formData.name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "SF";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Form panel */}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input type="text" name="name" placeholder="John Doe" className="pl-10" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input type="email" name="email" placeholder="you@company.com" className="pl-10" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input type="password" name="password" placeholder="Create a password (min 6 chars)" className="pl-10" value={formData.password} onChange={handleChange} required minLength={6} />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Illustration panel */}
      <div className="hidden lg:flex w-1/2 relative bg-secondary-900 overflow-hidden items-center justify-center order-1 lg:order-2">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-900/40" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-600/10 blur-3xl"
        />
        <div className="relative z-10 text-white max-w-lg p-12 glass rounded-3xl mx-8 border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SignFlow</h1>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            "We reduced our document turnaround time by 40% after switching to SignFlow. The interface is clean, and the workflows are a game changer."
          </p>
          {/* Initials avatar — no external image dependency */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-sm select-none">
              SJ
            </div>
            <div>
              <p className="font-medium text-sm">Sarah Jenkins</p>
              <p className="text-xs text-slate-400">Operations Director, TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;