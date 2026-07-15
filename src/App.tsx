import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LoaderCircle, WifiOff, Zap } from "lucide-react";
import AuthScreen from "../components/AuthScreen";
import HealthCoachApp from "../components/HealthCoachApp";
import Onboarding from "../components/Onboarding";
import { getProfile } from "./lib/database";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { Profile } from "./types";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const authClient = supabase;
    let active = true;

    const loadSession = async () => {
      const { data, error } = await authClient.auth.getSession();
      if (!active) return;
      if (error) setLoadError(error.message);
      setSession(data.session);
      setLoading(false);
    };

    void loadSession();
    const { data: listener } = authClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setProfile(null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    setLoading(true);
    getProfile(session.user.id)
      .then((value) => { if (active) setProfile(value); })
      .catch((caught) => { if (active) setLoadError(caught instanceof Error ? caught.message : "No se ha podido cargar el perfil"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session]);

  if (!isSupabaseConfigured) {
    return <HealthCoachApp demoMode />;
  }

  if (loading) {
    return <div className="app-loader"><div className="brand-mark"><Zap size={24} /></div><LoaderCircle className="spin" size={24} /><span>Preparando tu semana…</span></div>;
  }

  if (loadError && session) {
    return <div className="app-loader error-state"><WifiOff size={28} /><strong>No hemos podido cargar tus datos</strong><span>{loadError}</span><button className="primary-button" onClick={() => window.location.reload()}>Reintentar</button></div>;
  }

  if (!session) return <AuthScreen />;

  if (!profile?.onboarding_completed) {
    return <Onboarding userId={session.user.id} initialName={String(session.user.user_metadata?.name ?? "")} existingProfile={profile} onComplete={setProfile} />;
  }

  return <HealthCoachApp userId={session.user.id} profile={profile} onProfileChange={setProfile} onLogout={async () => { await supabase?.auth.signOut(); }} />;
}
