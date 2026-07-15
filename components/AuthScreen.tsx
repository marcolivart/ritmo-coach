import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound, Zap } from "lucide-react";
import { supabase } from "../src/lib/supabase";

type Mode = "login" | "signup";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() || "Usuario" } },
        });
        if (signUpError) throw signUpError;
        setMessage("Cuenta creada. Revisa tu correo si Supabase solicita confirmación.");
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) throw loginError;
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se ha podido completar el acceso");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!supabase || !email.trim()) {
      setError("Escribe tu correo primero");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (resetError) setError(resetError.message);
    else setMessage("Te hemos enviado un enlace para recuperar la contraseña.");
  };

  return (
    <div className="auth-stage">
      <section className="auth-shell">
        <div className="auth-brand"><span><Zap size={24} strokeWidth={2.8} /></span> ritmo</div>
        <div className="auth-hero">
          <span className="pill pill-green">Tu entrenador semanal</span>
          <h1>{mode === "login" ? "Vuelve a tu ritmo." : "Tu plan empieza contigo."}</h1>
          <p>Menús medidos, pesaje semanal y entrenamiento guiado que se adapta a tus datos reales.</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <label className="auth-field">
              <span>Nombre</span>
              <div><UserRound size={18} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Marc" required /></div>
            </label>
          )}
          <label className="auth-field">
            <span>Correo electrónico</span>
            <div><Mail size={18} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" required /></div>
          </label>
          <label className="auth-field">
            <span>Contraseña</span>
            <div><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>

          {error && <div className="form-alert error">{error}</div>}
          {message && <div className="form-alert success">{message}</div>}

          <button className="primary-button green full auth-submit" disabled={loading}>
            {loading ? "Procesando…" : mode === "login" ? "Entrar" : "Crear mi cuenta"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {mode === "login" && <button className="auth-link" onClick={resetPassword}>He olvidado mi contraseña</button>}
        <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}>
          {mode === "login" ? "¿Todavía no tienes cuenta? Crear cuenta" : "Ya tengo cuenta · Iniciar sesión"}
        </button>
      </section>
    </div>
  );
}
