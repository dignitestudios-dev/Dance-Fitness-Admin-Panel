"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API } from "@/lib/api/axios";

/* ================= COMPONENT ================= */

const ForgetPassword = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      // 🔗 Call API
      const response = await API.post("admin/resend-otp", { email });

      // Save email for OTP verification
      localStorage.setItem("resetEmail", email);

      setSuccess("OTP sent to your email.");

      // ✅ Redirect to verify OTP screen
      router.push("/auth/verifyotp");
    } catch (err: any) {
      console.error("Forget Password API error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-600">
          Enter your email to receive a reset OTP
        </p>
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

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </div>
  );
};

export default ForgetPassword;
