import { apiClient } from './client'

export interface OtpSentResponse {
  message: string
  phone: string
}

export interface AuthUser {
  id: string
  phone: string
  name: string
  surname: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export const authApi = {
  /** Login: request OTP for existing account. Throws ApiError(404) if not found. */
  requestOtp: (phone: string) =>
    apiClient.post<OtpSentResponse>('/api/auth/otp/request', { phone }),

  /** Login: verify OTP and receive JWT. Throws ApiError(401) on invalid code. */
  verifyOtp: (phone: string, code: string) =>
    apiClient.post<AuthResponse>('/api/auth/otp/verify', { phone, code }),

  /** Register: start registration. Throws ApiError(409) if phone already registered. */
  register: (phone: string, name: string, surname: string) =>
    apiClient.post<OtpSentResponse>('/api/auth/register', { phone, name, surname }),

  /** Register: confirm OTP, create account and receive JWT. */
  confirmRegister: (phone: string, code: string) =>
    apiClient.post<AuthResponse>('/api/auth/register/confirm', { phone, code }),
}
