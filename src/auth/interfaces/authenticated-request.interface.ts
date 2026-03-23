export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
  tenantId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
    tenantId: string | null;
  };
}
