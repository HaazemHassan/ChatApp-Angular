export interface LoginResponse {
  accessToken: string;
  refreshToken?: RefreshTokenDTO;
}

export interface RefreshTokenDTO {
  token: string;
  userId: number;
  expirationDate: Date;
  createdAt: Date;
}
