"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { sendOtp, verifyOtp } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/useToast";
import { OTPInput } from "@/components/auth/OTPInput";
import { Loader } from "@/components/ui/Loader";
import { OtpSendPayload } from "@/types/auth";
import countries, { CountryIndicator, DEFAULT_COUNTRY_CODE } from "@/data/countries";
import { getNationalLengthRule } from "@/data/phone-lengths";

export default function AuthPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [isPhoneDirty, setIsPhoneDirty] = useState(false);
  const defaultCountry =
    countries.find((country) => country.code === DEFAULT_COUNTRY_CODE) ??
    countries[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryIndicator>(
    defaultCountry,
  );
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryPickerRef = useRef<HTMLDivElement>(null);

  const digitsOnly = phone.replace(/\D/g, "");

  const formatPhoneForBackend = () => {
    const trimmed = digitsOnly.replace(/^0+/, "");
    if (!trimmed) return "";
    const countryDigits = selectedCountry.dial.replace("+", "");
    if (trimmed.startsWith(countryDigits)) {
      return `+${trimmed}`;
    }
    return `${selectedCountry.dial}${trimmed}`;
  };

  const formattedPhone = formatPhoneForBackend();
  const dialDigits = selectedCountry.dial.replace("+", "");
  const nationalNumber = formattedPhone
    ? formattedPhone.startsWith(`+${dialDigits}`)
      ? formattedPhone.slice(1 + dialDigits.length)
      : formattedPhone.replace("+", "")
    : "";
  const expectedLengths = getNationalLengthRule(selectedCountry.code);
  const isNationalLengthValid = expectedLengths
    ? expectedLengths.includes(nationalNumber.length)
    : nationalNumber.length >= 8;
  const isPhoneValid = !!formattedPhone && isNationalLengthValid;
  const showInvalidPhone = isPhoneDirty && digitsOnly.length > 0 && !isPhoneValid;
  const expectedLengthHint = expectedLengths
    ? ` (${expectedLengths.join(" ou ")} chiffres)`
    : "";

  useEffect(() => {
    if (!countryDropdownOpen) return;
    const handleOutsideClick = (event: PointerEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [countryDropdownOpen]);

  const sendMutation = useMutation({
    mutationFn: (payload: OtpSendPayload) => sendOtp(payload),
    onSuccess: () => {
      setOtpRequested(true);
      toast.success("OTP envoyé", "Vérifiez votre téléphone");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Impossible d'envoyer le code";
      toast.error("Erreur d'envoi", message);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyOtp({ phone: formattedPhone, role: "CLIENT", otp }),
    onSuccess: () => {
      toast.success("Connexion réussie");
      router.replace("/");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Code invalide";
      toast.error("OTP invalide", message);
    },
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
          <div className="flex items-stretch gap-2">
            <div ref={countryPickerRef} className="relative w-28">
              <button
                type="button"
                onClick={() => setCountryDropdownOpen((current) => !current)}
                className="relative z-20 flex w-full items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-black shadow-sm transition hover:border-black/30"
              >
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-xs uppercase tracking-[0.2em]">{selectedCountry.dial}</span>
                <ChevronDown className="h-4 w-4 text-black/60" />
              </button>
              {countryDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-full max-h-[18rem] overflow-y-auto rounded-2xl border border-black/10 bg-white py-1 shadow-lg">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setCountryDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-black transition hover:bg-black/5"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-xs uppercase tracking-[0.2em]">{country.dial}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (!isPhoneDirty) {
                    setIsPhoneDirty(true);
                  }
                }}
                placeholder={`${selectedCountry.dial} 700 000 000`}
                className="input-base w-full"
              />
              {showInvalidPhone && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  Numéro incorrect{expectedLengthHint}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              sendMutation.mutate({
                phone: formattedPhone,
                role: "CLIENT",
              })
            }
            disabled={!isPhoneValid || sendMutation.isPending}
            className="btn-base w-full bg-black px-5 py-4 text-white"
          >
            {sendMutation.isPending ? <Loader label="Envoi..." /> : "Envoyer le code"}
          </button>

          {otpRequested ? (
            <div className="space-y-3 pt-2">
              <OTPInput value={otp} onChange={setOtp} />
              <button
                type="button"
                onClick={() => verifyMutation.mutate()}
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
