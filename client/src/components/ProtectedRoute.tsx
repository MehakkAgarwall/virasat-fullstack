// Virāsat route guard: this is a presentation-layer demo gate, not security. The future API guard belongs in FastAPI.
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import type { DemoRole } from "../services/authService";

export function ProtectedRoute({ role, children }: { role: DemoRole | DemoRole[]; children: React.ReactNode }) { const { session } = useAuth(); const [location, setLocation] = useLocation(); const acceptedRoles = Array.isArray(role) ? role : [role]; const hasAccess = Boolean(session && acceptedRoles.includes(session.role)); const requestedRole = session?.role && acceptedRoles.includes(session.role) ? session.role : acceptedRoles[0]; useEffect(() => { if (!hasAccess) setLocation(`/login?role=${requestedRole}&next=${encodeURIComponent(location)}`); }, [hasAccess, location, requestedRole, setLocation]); if (!hasAccess) return <div className="auth-route-handoff"><span className="eyebrow">Virāsat demo access</span><p>Preparing your role experience…</p></div>; return <>{children}</>; }
