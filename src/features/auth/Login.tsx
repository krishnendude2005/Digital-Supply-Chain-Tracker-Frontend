import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "../../types";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState<Role>("ADMIN");
  const [email, setEmail] = useState("riya@waypoint.io");
  const [password, setPassword] = useState("••••••••••");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine redirection path
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    // Auto fill credentials for demonstration purposes
    const emails: Record<Role, string> = {
      ADMIN: "riya@waypoint.io",
      SUPPLIER: "supply@anandtex.in",
      TRANSPORTER: "ops@sureshlog.com",
      WAREHOUSE_MANAGER: "warehouse@waypoint.io",
    };
    setEmail(emails[role]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-text-primary selection:bg-secondary/30">
      {/* LEFT SIDE: Auth Hero */}
      <div className="flex-[1.1] relative p-16 flex flex-col justify-between bg-gradient-to-b from-[#131519]/20 to-[#0a0b0e]/85 bg-bg-surface border-r border-border-subtle overflow-hidden hidden md:flex">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" 
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage: "radial-gradient(circle at 30% 30%, black, transparent 70%)"
          }}
        />

        <div className="brand-mark flex items-center gap-2.5 relative z-10">
          <div className="dot w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_14px_2px_rgba(255,180,84,0.6)]"></div>
          <span className="font-panel-h3 text-panel-h3 font-semibold text-[18px] tracking-wide">Waypoint</span>
        </div>

        <div className="hero-copy relative z-10 max-w-[460px] my-auto">
          <h1 className="font-hero-h1 text-hero-h1 line-tight mb-4 text-text-primary">
            Every shipment, <em className="not-italic text-primary">tracked live</em>, from dock to doorstep.
          </h1>
          <p className="text-text-secondary text-[15px] leading-relaxed font-body-lg">
            Waypoint gives suppliers, transporters, and operations teams one shared view of inventory, routes, and delivery risk — in real time.
          </p>

          <div className="beacon-demo mt-10 p-5 bg-[#131519]/40 border border-border-subtle rounded-lg backdrop-blur-sm">
            <div className="font-label-eyebrow text-label-eyebrow text-text-tertiary">SHIPMENT WP-4471 · LIVE</div>
            
            <div className="relative h-1 bg-border-strong rounded my-5">
              <div className="absolute left-0 top-0 h-full w-[62%] rounded bg-gradient-to-r from-secondary to-primary"></div>
              <div className="absolute top-1/2 left-[62%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary beacon-pulse-large"></div>
            </div>

            <div className="flex justify-between font-data-mono text-[11px] text-text-tertiary uppercase">
              <span>Chennai Port</span>
              <span>Pune DC</span>
            </div>
          </div>
        </div>

        <div className="text-[12px] text-text-tertiary relative z-10">
          © Waypoint Logistics Platform · Mission Control Console
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[380px] bg-bg-elevated border border-border-subtle rounded-xl p-8 shadow-2xl relative z-10">
          <h2 className="font-card-h2 text-card-h2 text-text-primary mb-1">Sign in</h2>
          <div className="text-text-secondary text-[13.5px] mb-6">
            Enter your credentials to access your workspace.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] text-text-secondary mb-1.5 font-medium">
                Demonstration Profile Quick-Selector
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`py-1.5 px-2 rounded border text-[11px] text-center font-medium transition-all ${
                    selectedRole === "ADMIN"
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("SUPPLIER")}
                  className={`py-1.5 px-2 rounded border text-[11px] text-center font-medium transition-all ${
                    selectedRole === "SUPPLIER"
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Supplier
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("TRANSPORTER")}
                  className={`py-1.5 px-2 rounded border text-[11px] text-center font-medium transition-all ${
                    selectedRole === "TRANSPORTER"
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Transporter
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("WAREHOUSE_MANAGER")}
                  className={`py-1.5 px-2 rounded border text-[11px] text-center font-medium transition-all ${
                    selectedRole === "WAREHOUSE_MANAGER"
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Whse Manager
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-status-delayed text-[12.5px] p-2.5 rounded">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[12.5px] text-text-secondary font-medium">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-bg-surface border border-border-subtle text-text-primary px-3 py-2.5 rounded text-[14px] focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[12.5px] text-text-secondary font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-bg-surface border border-border-subtle text-text-primary px-3 py-2.5 pr-10 rounded text-[14px] focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-b from-[#FFC576] to-primary text-[#1A1300] font-bold text-[13.5px] py-2.5 rounded shadow-[0_8px_20px_-8px_rgba(255,180,84,0.7)] hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign in to Waypoint"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-[12.5px] text-text-tertiary">
            Protected by JWT session auth · <a href="#" className="text-secondary hover:underline">Forgot password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};
