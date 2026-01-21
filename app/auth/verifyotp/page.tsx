"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/lib/api/axios";

const VerifyOTP = () => {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ===== Fetch email from localStorage =====
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email not found. Please go back and enter your email.");
      return;
    }

    if (otp.some((digit) => digit === "")) {
      setError("Please enter all 4 digits.");
      return;
    }

    try {
      setLoading(true);

      const enteredOtp = otp.join("");

      // 🔗 Verify OTP
      await API.post("/admin/verify-otp", {
        email,
        otp: enteredOtp,
      });

      // ✅ Redirect to reset password
      router.push("/auth/resetpassword");
    } catch (err: any) {
      console.error("Verify OTP API error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Verify OTP
        </h2>
        <p className="text-gray-600">
          Enter the 4-digit code sent to{" "}
          <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-3">
          {otp.map((digit, index) => (
            <Input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className="text-center text-lg font-medium w-14 h-14"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
    </div>
  );
};

export default VerifyOTP;
