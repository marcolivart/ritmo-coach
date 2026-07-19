import { useState } from "react";
import { Apple, BadgeCheck, Ban, Heart, Plus, X } from "lucide-react";
import Pill from "../../ui/Pill";
import { useAppData } from "../../../src/state/AppContext";

const SHORT_DAY_NAMES: Record<string, string> = {
  Lun: "Lunes", Mar: "Martes", Mié: "Miércoles", Jue: "Jueves", Vie: "Viernes", Sáb: "Sábado", Dom: "Domingo",
};

function formatMealKeyLabel(key: string): string {
  const [short, ...rest] = key.split("-");
  return `${SHORT_DAY_NAMES[short] ?? short} · ${rest.join("-")}`;
}

export default function PreferencesView() {
  const app = useAppData();
  const { blockedFoods, favoriteFoods, allergies, excludedMealKeys } = app;
  const [blockedInput, setBlockedInput] = useState("");
  const [favoriteInput, setFavoriteInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");

  const submit = (raw: string, type: "blocked" | "favorite" | "allergy", clear: () => void) => {
    void app.addPreference(raw, type);
    clear();
  };

  return (
    <>
      <div className="card card-lime">
        <div className="prefs-hero">
          <div>
            <Pill tone="ink"><Ban size={13} /> Regla absoluta</Pill>
            <h2 className="prefs-hero-title">Lo que bloquees no aparecerá nunca.</h2>
            <p className="prefs-hero-text">Ni en recetas, ni en alternativas, ni en la lista de la compra. Las alergias también filtran el plan.</p>
          </div>
          <Apple size={34} style={{ opacity: .62, flex: "0 0 auto" }} aria-hidden="true" />
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Nunca incluir</h2>
        <Pill tone="orange">{blockedFoods.length} bloqueados</Pill>
      </div>
      <div className="card">
        <div className="tag-list">
          {blockedFoods.map((food) => (
            <button key={food} className="food-tag blocked pressable" onClick={() => void app.deletePreference(food, "blocked")} aria-label={`Quitar ${food} de bloqueados`}>
              <Ban size={14} /> {food} <X size={13} />
            </button>
          ))}
        </div>
        <div className="input-row">
          <input
            className="text-input"
            value={blockedInput}
            onChange={(event) => setBlockedInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit(blockedInput, "blocked", () => setBlockedInput(""))}
            placeholder="Buscar o escribir alimento"
            aria-label="Alimento a bloquear"
          />
          <button className="primary-button pressable" onClick={() => submit(blockedInput, "blocked", () => setBlockedInput(""))} aria-label="Bloquear alimento"><Plus size={18} /></button>
        </div>
      </div>

      {excludedMealKeys.size > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">Comidas excluidas</h2>
            <Pill tone="orange">{excludedMealKeys.size}</Pill>
          </div>
          <div className="card">
            <div className="tag-list">
              {Array.from(excludedMealKeys).map((key) => (
                <button key={key} className="food-tag blocked pressable" onClick={() => void app.removeExcludedMealKey(key)} aria-label={`Recuperar ${formatMealKeyLabel(key)}`}>
                  <Ban size={14} /> {formatMealKeyLabel(key)} <X size={13} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="section-header"><h2 className="section-title">Tus favoritos</h2></div>
      <div className="card">
        <p className="prefs-note">Cuando un plato alternativo contiene más favoritos que el base, el plan lo elige por ti.</p>
        <div className="tag-list">
          {favoriteFoods.map((food) => (
            <button key={food} className="food-tag favorite pressable" onClick={() => void app.deletePreference(food, "favorite")} aria-label={`Quitar ${food} de favoritos`}>
              <Heart size={14} fill="currentColor" /> {food} <X size={13} />
            </button>
          ))}
        </div>
        <div className="input-row">
          <input
            className="text-input"
            value={favoriteInput}
            onChange={(event) => setFavoriteInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit(favoriteInput, "favorite", () => setFavoriteInput(""))}
            placeholder="Añadir alimento favorito"
            aria-label="Alimento favorito"
          />
          <button className="primary-button pressable" onClick={() => submit(favoriteInput, "favorite", () => setFavoriteInput(""))} aria-label="Añadir favorito"><Plus size={18} /></button>
        </div>
      </div>

      <div className="section-header"><h2 className="section-title">Restricciones críticas</h2></div>
      <div className="card">
        <div className="setting-row" style={{ display: "block" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div className="setting-icon"><BadgeCheck size={20} /></div>
            <div className="setting-copy">
              <div className="setting-name">Alergias e intolerancias</div>
              <div className="setting-value">{allergies.length ? `${allergies.length} restricciones activas: filtran menú y compra` : "Sin alergias registradas"}</div>
            </div>
          </div>
          {allergies.length > 0 && (
            <div className="tag-list" style={{ marginTop: 12 }}>
              {allergies.map((food) => (
                <button key={food} className="food-tag blocked pressable" onClick={() => void app.deletePreference(food, "allergy")} aria-label={`Quitar alergia ${food}`}>
                  <BadgeCheck size={14} /> {food} <X size={13} />
                </button>
              ))}
            </div>
          )}
          <div className="input-row">
            <input
              className="text-input"
              value={allergyInput}
              onChange={(event) => setAllergyInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submit(allergyInput, "allergy", () => setAllergyInput(""))}
              placeholder="Añadir alergia o intolerancia"
              aria-label="Alergia o intolerancia"
            />
            <button className="primary-button pressable" onClick={() => submit(allergyInput, "allergy", () => setAllergyInput(""))} aria-label="Añadir alergia"><Plus size={18} /></button>
          </div>
        </div>
      </div>
    </>
  );
}
