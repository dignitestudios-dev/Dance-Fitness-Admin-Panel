"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/lib/slices/authSlice";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/lib/store";
       import Link from 'next/link';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      loginUser({ email, password })
    );

    if (loginUser.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>



<div className="space-y-2">
  <Label>Password</Label>
  <div className="relative">
    <Input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="pr-10"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3 flex items-center"
    >
      {showPassword ? <Eye /> : <EyeOff />}
    </button>
  </div>

  {/* Forgot Password Link */}
  <div className="text-right">
    <Link href="/auth/forgetpassword" className="text-sm text-blue-500 hover:text-blue-700">
      Forgot Password?
    </Link>
  </div>
</div>



        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
