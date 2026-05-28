"use client";

import { useState } from "react";
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
    CheckCircle2
} from "lucide-react";

export default function LoginPage() {
    const [role, setRole] = useState<"judge" | "participant">("judge");
    const [identifier, setIdentifier] = useState(""); // Can be username or email
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!identifier.trim()) {
            newErrors.identifier = "Username or Email is required";
        } else if (identifier.includes("@") && !/\S+@\S+\.\S+/.test(identifier)) {
            newErrors.identifier = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
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
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to log in.");
            }

            setIsLoading(false);
            setIsSuccess(true);

            setTimeout(() => {
                window.location.href = `/${data.user.role}`;
            }, 1000);

        } catch (err: any) {
            setIsLoading(false);
            setErrors({ general: err.message || "Something went wrong during authentication." });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4">
            <div className="w-full max-w-lg">
                <div className="bg-white border border-slate-200 shadow-sm rounded-md p-8 md:p-10">

                    {/* Logo / Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <Image
                            src="/empresario.png"
                            alt="Empresario"
                            width={500}
                            height={195}
                            priority
                            className="h-16 w-auto mb-4"
                        />
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Welcome Back
                        </h1>
                        <p className="text-slate-600 text-sm mt-2 max-w-xs">
                            Access the Judging Portal and manage your panel or tracks.
                        </p>
                    </div>

                    {isSuccess ? (
                        /* Premium Success Verification State */
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-4 text-green-600 shadow-sm">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Success!</h2>
                            <p className="text-slate-600 text-sm mt-1">Sourcing authentic keys and redirecting...</p>
                            <div className="mt-6 flex items-center gap-2 text-blue-800 font-medium text-xs tracking-wider uppercase animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" /> Preparing workspace
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* General error message */}
                            {errors.general && (
                                <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
                                    {errors.general}
                                </div>
                            )}

                            {/* Role Selection Group */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                                    Select Your Portal Role
                                </label>
                                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-50 border border-slate-200 rounded-md relative">

                                    {/* Judge Option */}
                                    <button
                                        type="button"
                                        onClick={() => setRole("judge")}
                                        className={`relative flex items-center justify-center gap-2.5 py-3 rounded-sm text-sm font-semibold transition-colors ${role === "judge"
                                            ? "text-blue-800 bg-white border border-slate-200 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                                            }`}
                                    >
                                        <ShieldCheck className={`w-4 h-4 ${role === "judge" ? "text-blue-800" : "text-slate-500"}`} />
                                        Judge Portal
                                    </button>

                                    {/* Participant Option */}
                                    <button
                                        type="button"
                                        onClick={() => setRole("participant")}
                                        className={`relative flex items-center justify-center gap-2.5 py-3 rounded-sm text-sm font-semibold transition-colors ${role === "participant"
                                            ? "text-blue-800 bg-white border border-slate-200 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                                            }`}
                                    >
                                        <Users className={`w-4 h-4 ${role === "participant" ? "text-blue-800" : "text-slate-500"}`} />
                                        Participant
                                    </button>
                                </div>
                            </div>

                            {/* Username/Email Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                                    Username or Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        {identifier.includes("@") ? (
                                            <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-800 transition-colors" />
                                        ) : (
                                            <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-800 transition-colors" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => {
                                            setIdentifier(e.target.value);
                                            if (errors.identifier) setErrors({ ...errors, identifier: undefined });
                                        }}
                                        placeholder="e.g. suvan@kgpian.org or judge_01"
                                        className={`w-full bg-white border ${errors.identifier
                                            ? "border-red-300 focus:ring-red-600 focus:border-red-600"
                                            : "border-slate-300 focus:border-blue-800 focus:ring-blue-800"
                                            } text-slate-900 rounded-md pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:ring-1 placeholder-slate-400`}
                                    />
                                </div>
                                {errors.identifier && (
                                    <p className="text-red-600 text-xs font-medium pl-1">{errors.identifier}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                                        Password
                                    </label>
                                    <a href="#" className="text-xs font-semibold text-blue-800 hover:text-blue-900 transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-800 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({ ...errors, password: undefined });
                                        }}
                                        placeholder="••••••••"
                                        className={`w-full bg-white border ${errors.password
                                            ? "border-red-300 focus:ring-red-600 focus:border-red-600"
                                            : "border-slate-300 focus:border-blue-800 focus:ring-blue-800"
                                            } text-slate-900 rounded-md pl-11 pr-12 py-3.5 text-sm outline-none transition-all focus:ring-1 placeholder-slate-400`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-600 text-xs font-medium pl-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-6 rounded-md text-white font-bold text-sm bg-blue-800 hover:bg-blue-900 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        Authenticating Security Keys...
                                    </>
                                ) : (
                                    <>
                                        Sign In to Portal
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {/* Sign Up Redirect */}
                            <div className="text-center mt-6 text-sm text-slate-500">
                                Don&apos;t have a portal account?{" "}
                                <a href="/register" className="font-semibold text-blue-800 hover:text-blue-900 transition-colors">
                                    Create one here
                                </a>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}