"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { sendOtp, verifyOtp, getDemoOtp } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/useToast";
import { OTPInput } from "@/components/auth/OTPInput";
import { Loader } from "@/components/ui/Loader";

export default function AuthPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  const sendMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      setOtpRequested(true);
      toast.success("OTP envoyé", `Code démo: ${getDemoOtp()}`);
    },
    onError: (err: Error) => toast.error("Erreur d'envoi", err.message),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (session) => {
      setSession(session);
      toast.success("Connexion réussie", session.user.name);
      router.push("/");
    },
    onError: (err: Error) => toast.error("OTP invalide", err.message),
  });

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [router, user]);

  return (
    <div className="container-safe flex min-h-screen items-center py-6">
      <div className="mx-auto w-full max-w-md space-y-6">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn-base border border-black/10 bg-white px-4 py-2 text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">Connexion client</p>
          <h1 className="text-3xl font-semibold tracking-tight">Accédez à votre compte</h1>
          <p className="text-sm text-black/60">Entrez votre numéro pour recevoir le code de connexion.</p>
        </div>

        <div className="card-base space-y-4 p-5">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Numéro de téléphone"
            className="input-base"
          />

          <button
            type="button"
            onClick={() => sendMutation.mutate({ phone, role: "client" })}
            disabled={!phone || sendMutation.isPending}
            className="btn-base w-full bg-black px-5 py-4 text-white"
          >
            {sendMutation.isPending ? <Loader label="Envoi..." /> : "Envoyer le code"}
          </button>

          {otpRequested ? (
            <div className="space-y-3 pt-2">
              <OTPInput value={otp} onChange={setOtp} />
              <p className="text-xs text-black/45">Code démo: {getDemoOtp()}</p>
              <button
                type="button"
                onClick={() => verifyMutation.mutate({ phone, role: "client", otp })}
                disabled={otp.length !== 6 || verifyMutation.isPending}
                className="btn-base w-full border border-black/10 bg-white px-5 py-4"
              >
                {verifyMutation.isPending ? "Vérification..." : "Vérifier le code"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
