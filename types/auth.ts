export type AuthRole = "client" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  phone: string;
  role: AuthRole;
};

export type OtpSendPayload = {
  phone: string;
  role: AuthRole;
};

export type OtpVerifyPayload = {
  phone: string;
  role: AuthRole;
  otp: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};
