import api from "@/lib/api";

import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  MessageResponse,
  Profile,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  ResendOTPRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth";

export async function login(
  data: LoginRequest,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login/",
    data,
  );

  return response.data;
}

export async function refreshToken(
  data: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  const response = await api.post<RefreshTokenResponse>(
    "/auth/refresh/",
    data,
  );

  return response.data;
}

export async function register(
  data: RegisterRequest,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    "/auth/register/",
    data,
  );

  return response.data;
}

export async function verifyEmail(
  data: VerifyEmailRequest,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    "/auth/verify-email/",
    data,
  );

  return response.data;
}

export async function resendOtp(
  data: ResendOTPRequest,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    "/auth/resend-otp/",
    data,
  );

  return response.data;
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    "/auth/forgot-password/",
    data,
  );

  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    "/auth/reset-password/",
    data,
  );

  return response.data;
}

export async function logoutUser(
  data: LogoutRequest,
): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>(
    "/auth/logout/",
    data,
  );

  return response.data;
}

export async function getProfile(): Promise<Profile> {
  const response = await api.get<Profile>(
    "/auth/profile/",
  );

  return response.data;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
}

export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<Profile> {
  const response = await api.patch<Profile>(
    "/auth/profile/",
    data,
  );

  return response.data;
}
