declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        organizationId: string;
        role: "admin" | "member";
      };
    }
  }
}

export {};
