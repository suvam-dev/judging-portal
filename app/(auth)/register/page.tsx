"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  ArrowRight,
  Loader2,
  CheckCircle2,
  FileCode,
  FolderGit2,
  Link2
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"judge" | "participant">("participant");
  
  // Registration Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Role-specific fields
  const [panelId, setPanelId] = useState(""); // For judges
  const [track, setTrack] = useState("PnS"); // For participants
  const [projectName, setProjectName] = useState("");
  const [pptLink, setPptLink] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (role === "judge" && !panelId.trim()) {
      newErrors.panelId = "Panel ID is required for judges";
    }

    if (role === "participant") {
      if (!projectName.trim()) newErrors.projectName = "Project name is required";
      if (pptLink && !/^https?:\/\/.+/i.test(pptLink)) {
        newErrors.pptLink = "PPT Link must start with http:// or https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
          role,
          panelId: role === "judge" ? parseInt(panelId) : undefined,
          track: role === "participant" ? track : undefined,
          projectName: role === "participant" ? projectName : undefined,
          pptLink: role === "participant" ? pptLink : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setIsLoading(false);
      setIsSuccess(true);
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setIsLoading(false);
      setErrors({ general: err.message || "Something went wrong." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 py-12">

      {/* Main Container */}
      <div className="w-full max-w-xl">
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-8 md:p-10">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src="/empresario.png"
              alt="Empresario"
              width={500}
              height={195}
              priority
              className="h-12 w-auto mb-3"
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Portal Account
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Join the Judging Portal as a Judge or Participant
            </p>
          </div>

          {errors.general && (
            <div className="p-3.5 mb-5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
              {errors.general}
            </div>
          )}

          {isSuccess ? (
            /* Premium Success State */
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-4 text-green-600">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Registered Successfully!</h2>
              <p className="text-slate-500 text-xs mt-1">Initializing your credentials and redirecting to login...</p>
              <div className="mt-6 flex items-center gap-2 text-blue-800 font-semibold text-xs tracking-wider uppercase">
                <Loader2 className="w-4 h-4 animate-spin" /> Moving to gateway
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Choose Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 border border-slate-200 rounded-md">
                  
                  {/* Participant Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole("participant");
                      setErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-sm text-xs font-semibold transition-colors ${
                      role === "participant" 
                        ? "text-blue-800 bg-white border border-slate-200 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <Users className={`w-3.5 h-3.5 ${role === "participant" ? "text-blue-800" : "text-slate-400"}`} />
                    Participant
                  </button>

                  {/* Judge Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole("judge");
                      setErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-sm text-xs font-semibold transition-colors ${
                      role === "judge" 
                        ? "text-blue-800 bg-white border border-slate-200 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 ${role === "judge" ? "text-blue-800" : "text-slate-400"}`} />
                    Judge Portal
                  </button>
                </div>
              </div>

              {/* Name Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. Suvan"
                  />
                  {errors.firstName && <p className="text-red-600 text-[10px] font-medium">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. Ghosh"
                  />
                  {errors.lastName && <p className="text-red-600 text-[10px] font-medium">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email & Username */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. suvan_dev"
                  />
                  {errors.username && <p className="text-red-600 text-[10px] font-medium">{errors.username}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. user@domain.com"
                  />
                  {errors.email && <p className="text-red-600 text-[10px] font-medium">{errors.email}</p>}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-600 text-[10px] font-medium">{errors.password}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-[10px] font-medium">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Conditional Form Fields */}
              {role === "judge" ? (
                /* Judge Fields */
                <div className="space-y-3.5 p-4 rounded-md bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-800" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judge Panel Information</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Panel ID</label>
                    <input
                      type="number"
                      value={panelId}
                      onChange={(e) => setPanelId(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                      placeholder="e.g. 101"
                    />
                    {errors.panelId && <p className="text-red-600 text-[10px] font-medium">{errors.panelId}</p>}
                  </div>
                </div>
              ) : (
                /* Participant Fields */
                <div className="space-y-3.5 p-4 rounded-md bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-800" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Startup Pitch Details</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project / Startup Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                        placeholder="e.g. TechSol Ltd"
                      />
                      {errors.projectName && <p className="text-red-600 text-[10px] font-medium">{errors.projectName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Track Category</label>
                      <select
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                      >
                        <option value="PnS">Product & Services</option>
                        <option value="Social">Social Track</option>
                        <option value="KGP">IIT KGP Innovation</option>
                        <option value="DeeptechAI">Deeptech & AI</option>
                        <option value="BlockchainWeb3">Blockchain & Web3</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      Pitch Deck PPT Link <span className="text-[10px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link2 className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        value={pptLink}
                        onChange={(e) => setPptLink(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-md pl-9 pr-4 py-2.5 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                    {errors.pptLink && <p className="text-red-600 text-[10px] font-medium">{errors.pptLink}</p>}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-md text-white font-bold text-xs bg-blue-800 hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Deploying Security Keyring...
                  </>
                ) : (
                  <>
                    Create Account & Settle
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link to Login */}
              <div className="text-center mt-4 text-xs text-slate-500">
                Already registered?{" "}
                <a href="/login" className="font-semibold text-blue-800 hover:text-blue-900 transition-colors">
                  Login here
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
