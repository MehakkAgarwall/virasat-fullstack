// Virāsat demo session context: local-only state is deliberately isolated from visual UI so FastAPI auth can replace it later.
import { createContext, useContext, useState, type ReactNode } from "react";
import { authService, type DemoRole, type DemoSession } from "../services/authService";

type AuthContextValue = { session: DemoSession | null; demoLogin: (role: DemoRole) => void; login: (role: DemoRole, email: string) => void; signup: (role: DemoRole, name: string, email: string) => void; updateSessionName: (name: string) => void; logout: () => void; };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) { const [session, setSession] = useState<DemoSession | null>(() => authService.getSession()); const value: AuthContextValue = { session, demoLogin: (role) => setSession(authService.demoLogin(role)), login: (role, email) => setSession(authService.login(role, email)), signup: (role, name, email) => setSession(authService.signup(role, name, email)), updateSessionName: (name) => setSession(authService.updateSessionName(name)), logout: () => { authService.logout(); setSession(null); } }; return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; }
