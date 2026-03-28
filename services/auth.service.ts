import { authOtpDemo } from "@/services/mock-db";
import { AuthSession, OtpSendPayload, OtpVerifyPayload } from "@/types/auth";
import { delay } from "@/utils/delay";
import { createId } from "@/utils/id";
import { removeCookie, setCookie } from "@/utils/storage";
import { usersSeed } from "@/services/mock-db";

const ADMIN_LOGIN = "admin@khidma.shop";
const ADMIN_PASSWORD = "khidma123";

export async function sendOtp(payload: OtpSendPayload) {
  await delay(900);

  return {
    requestId: createId("otp"),
    phone: payload.phone,
    role: payload.role,
    demoCode: authOtpDemo,
  };
}

export async function verifyOtp(payload: OtpVerifyPayload): Promise<AuthSession> {
  await delay(1100);

  if (payload.otp !== authOtpDemo) {
    throw new Error("Code OTP invalide");
  }

  const userFromSeed =
    usersSeed.find((user) => user.phone === payload.phone && user.role === payload.role) ??
    usersSeed.find((user) => user.role === payload.role) ??
    usersSeed[0];

  const user = {
    id: userFromSeed.id,
    name: userFromSeed.name,
    phone: payload.phone,
    role: payload.role,
  };

  const token = createId("token");
  setCookie("khidma_token", token);
  setCookie("khidma_role", payload.role);

  return { token, user };
}

export function clearAuthSession() {
  removeCookie("khidma_token");
  removeCookie("khidma_role");
}

export function getDemoOtp() {
  return authOtpDemo;
}

export async function adminLogin(payload: { login: string; password: string }): Promise<AuthSession> {
  await delay(900);

  if (payload.login !== ADMIN_LOGIN || payload.password !== ADMIN_PASSWORD) {
    throw new Error("Identifiants administrateur invalides");
  }

  const adminUser = usersSeed.find((user) => user.role === "admin");
  if (!adminUser) {
    throw new Error("Compte administrateur introuvable");
  }

  const user = {
    id: adminUser.id,
    name: adminUser.name,
    phone: adminUser.phone,
    role: "admin" as const,
  };

  const token = createId("admin_token");
  setCookie("khidma_token", token);
  setCookie("khidma_role", "admin");

  return { token, user };
}
