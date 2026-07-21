declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
}

export {}