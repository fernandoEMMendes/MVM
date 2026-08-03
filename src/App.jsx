import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Minus, Trash2, Download, Upload, Volume2, VolumeX } from "lucide-react";
import "./App.css";

import backgroundImg from "./assets/images/background.jpg";

import toursImg from "./assets/images/tours.png";
import kitImg from "./assets/images/kit.png";
import bulbImg from "./assets/images/bulb.png";
import digesterImg from "./assets/images/digester.png";
import stabilizerImg from "./assets/images/stabilizer.png";
import emotionImg from "./assets/images/emotion.png";
import humorImg from "./assets/images/humor.png";
import kb808Img from "./assets/images/kb808.png";
import tauntImg from "./assets/images/taunt.png";
import furnaceImg from "./assets/images/furnace.png";
import fabricatorSpecImg from "./assets/images/fabricator.png";
import fabricatorProfImg from "./assets/images/fabricatorProf.png";

import aussieImg from "./assets/images/aussie.png";
import aussie2Img from "./assets/images/aussie2.png";
import aussie3Img from "./assets/images/aussie3.png";
import aussie4Img from "./assets/images/aussie4.png";
import aussie5Img from "./assets/images/aussie5.png";
import aussie6Img from "./assets/images/aussie6.png";
import aussie7Img from "./assets/images/aussie7.png";
import aussie8Img from "./assets/images/aussie8.png";
import aussie9Img from "./assets/images/aussie9.png";
import aussie10Img from "./assets/images/aussie10.png";
import aussie11Img from "./assets/images/aussie11.png";
import aussie12Img from "./assets/images/aussie12.png";
import aussie13Img from "./assets/images/aussie13.png";
import aussie14Img from "./assets/images/aussie14.png";
import aussie15Img from "./assets/images/aussie15.png";
import aussie16Img from "./assets/images/aussie16.png";
import aussie17Img from "./assets/images/aussie17.png";
import aussie18Img from "./assets/images/aussie18.png";
import aussie19Img from "./assets/images/aussie19.png";

import weaponsImg from "./assets/images/weapons.png";
import hatsImg from "./assets/images/hats.png";

const STORAGE_KEY = "mvm_manifestos_v1";
const TOUR_STORAGE_KEY = "mvm_tour_v1";

// YouTube video ID used as background music.
const YOUTUBE_MUSIC_ID = "L3ic-rWb4X0";

// All image variants available for the "Australium" (Aussie) drop.
// "none" is the default option: no image is shown for the manifest entry.
const AUSSIE_VARIANTS = [
  { key: "none", src: null },
  { key: "aussie", src: aussieImg },
  { key: "aussie2", src: aussie2Img },
  { key: "aussie3", src: aussie3Img },
  { key: "aussie4", src: aussie4Img },
  { key: "aussie5", src: aussie5Img },
  { key: "aussie6", src: aussie6Img },
  { key: "aussie7", src: aussie7Img },
  { key: "aussie8", src: aussie8Img },
  { key: "aussie9", src: aussie9Img },
  { key: "aussie10", src: aussie10Img },
  { key: "aussie11", src: aussie11Img },
  { key: "aussie12", src: aussie12Img },
  { key: "aussie13", src: aussie13Img },
  { key: "aussie14", src: aussie14Img },
  { key: "aussie15", src: aussie15Img },
  { key: "aussie16", src: aussie16Img },
  { key: "aussie17", src: aussie17Img },
  { key: "aussie18", src: aussie18Img },
  { key: "aussie19", src: aussie19Img },
];

const ICONS = {
  tours: toursImg,
  kit: kitImg,
  bulb: bulbImg,
  digester: digesterImg,
  stabilizer: stabilizerImg,
  emotion: emotionImg,
  humor: humorImg,
  kb808: kb808Img,
  taunt: tauntImg,
  furnace: furnaceImg,
  fabricatorSpec: fabricatorSpecImg,
  fabricatorProf: fabricatorProfImg,
  weapons: weaponsImg,
  hats: hatsImg,
};

// Order and display names of the drops.
// - `fixed`: the quantity is locked to this value and cannot be changed
//   (no buttons are shown for it).
// - `min`: the lowest quantity allowed for this drop (defaults to 0).
// - `max`: the highest quantity allowed for this drop (defaults to 999).
// - `bigStep`: also renders -10/+10 buttons alongside the regular -1/+1.
const DROP_DEFS = [
  { key: "aussie", label: "Australium" },
  { key: "fabricatorProf", label: "Professional Fabricator", max: 1 },
  { key: "fabricatorSpec", label: "Specialized Fabricator", min: 1 },
  { key: "kit", label: "Killstreak Kit", fixed: 1 },
  { key: "bulb", label: "Pristine Robot Brainstorm Bulb", bigStep: true },
  { key: "digester", label: "Pristine Robot Currency Digester", bigStep: true },
  { key: "stabilizer", label: "Reinforced Robot Bomb Stabilizer", bigStep: true },
  { key: "emotion", label: "Reinforced Robot Emotion Detector", bigStep: true },
  { key: "humor", label: "Reinforced Robot Humor Suppression Pump", bigStep: true },
  { key: "kb808", label: "Battle-Worn Robot KB-808", bigStep: true },
  { key: "taunt", label: "Battle-Worn Robot Taunt Processor", bigStep: true },
  { key: "furnace", label: "Battle-Worn Robot Money Furnace", bigStep: true },
  { key: "weapons", label: "Weapons" },
  { key: "hats", label: "Hats" },
];

// --- helpers ---------------------------------------------------------

function emptyDrops() {
  return DROP_DEFS.reduce((acc, d) => {
    const startQty = d.fixed != null ? d.fixed : d.min ?? 0;
    acc[d.key] = { qty: startQty };
    return acc;
  }, {});
}

function zeroDropTotals() {
  return DROP_DEFS.reduce((acc, d) => {
    acc[d.key] = 0;
    return acc;
  }, {});
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateShort(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

// Every numeric field saved on a manifest entry is clamped between `min`
// (0 by default) and 999.
function clampQty(n, min = 0, max = 999) {
  const v = typeof n === "number" ? n : parseFloat(n);
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}

// Formats for display with a minimum of 3 digits in the integer part
// (e.g. 7 -> "007", 7.5 -> "007.5"). Sums greater than 999 (totals row)
// are not truncated, only padded to the minimum of 3 digits.
function pad3(n) {
  const v = Math.max(0, Number(n) || 0);
  if (Number.isInteger(v)) return String(v).padStart(3, "0");
  const [intPart, decPart] = v.toFixed(2).replace(/0$/, "").replace(/\.$/, "").split(".");
  return decPart ? `${intPart.padStart(3, "0")}.${decPart}` : intPart.padStart(3, "0");
}

function DropCounter({
  icon,
  label,
  qty,
  min = 0,
  max = 999,
  onDec,
  onInc,
  onDecBig,
  onIncBig,
  bigStep,
  picker,
  hideCounter,
  fixedValue,
  noneLabel,
}) {
  const atMin = qty <= min;
  const atMax = qty >= max;
  return (
    <div className="rl-counter">
      <div className="rl-counter-top">
        <span className="rl-counter-label">{label}</span>
        {icon ? (
          <img src={icon} alt={label} className="rl-counter-icon" draggable={false} />
        ) : (
          <div className="rl-counter-icon rl-counter-icon--none" aria-label={noneLabel || "None"}>
            {noneLabel || "None"}
          </div>
        )}
        {picker}
      </div>

      <div className="rl-counter-spacer" />

      <div className="rl-counter-bottom">
        {fixedValue != null ? (
          <div className="rl-counter-fixed" aria-label={`${label} is always included ${fixedValue}x`}>
            Always ×{fixedValue}
          </div>
        ) : (
          !hideCounter && (
            <div className="rl-counter-controls">
              {bigStep && (
                <button
                  type="button"
                  className="rl-ctr-btn rl-ctr-btn--big"
                  onClick={onDecBig}
                  disabled={atMin}
                  aria-label={`Decrease ${label} by 10`}
                >
                  −10
                </button>
              )}
              <button
                type="button"
                className="rl-ctr-btn"
                onClick={onDec}
                disabled={atMin}
                aria-label={`Decrease ${label}`}
              >
                <Minus size={13} strokeWidth={3} />
              </button>
              <span className="rl-counter-value rl-counter-value-display" aria-label={`Quantity of ${label}`}>
                {qty}
              </span>
              <button
                type="button"
                className="rl-ctr-btn rl-ctr-btn--plus"
                onClick={onInc}
                disabled={atMax}
                aria-label={`Increase ${label}`}
              >
                <Plus size={13} strokeWidth={3} />
              </button>
              {bigStep && (
                <button
                  type="button"
                  className="rl-ctr-btn rl-ctr-btn--plus rl-ctr-btn--big"
                  onClick={onIncBig}
                  disabled={atMax}
                  aria-label={`Increase ${label} by 10`}
                >
                  +10
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Reads the last saved tour count from localStorage. Falls back to 0 if
// nothing was saved yet or the value is invalid.
function loadSavedTour() {
  try {
    const saved = localStorage.getItem(TOUR_STORAGE_KEY);
    if (saved === null || saved === "") return 0;
    const n = parseFloat(saved);
    return Number.isNaN(n) ? 0 : clampQty(n);
  } catch (err) {
    return 0;
  }
}

export default function OperationsLedger() {
  const [tour, setTour] = useState(loadSavedTour);
  const [drops, setDrops] = useState(emptyDrops());
  const [aussieVariant, setAussieVariant] = useState(AUSSIE_VARIANTS[0].key);
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // --- audio: background music (YouTube) ---
  // Starts muted/off by default. The person can turn it on at any time
  // using the button in the top-left corner.
  const [musicMuted, setMusicMuted] = useState(true);
  const ytPlayerRef = useRef(null);
  const ytContainerRef = useRef(null);

  // Loads manifests previously saved locally (localStorage) on page load.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch (err) {
      console.error("Could not load saved manifests:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Auto-saves on every change (after the initial load).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error("Could not save manifests:", err);
    }
  }, [entries, loaded]);

  // Persists the tour count on every change, so it survives page reloads
  // and is NOT reset when a manifest is added.
  useEffect(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, String(tour === "" ? 0 : tour));
    } catch (err) {
      console.error("Could not save tour count:", err);
    }
  }, [tour]);

  // Loads the YouTube API and creates the background music player (hidden).
  // The player starts muted and paused; it only plays once the person
  // turns the music on via the button in the top-left corner.
  useEffect(() => {
    let cancelled = false;

    function createPlayer() {
      if (cancelled || !ytContainerRef.current || ytPlayerRef.current) return;
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: YOUTUBE_MUSIC_ID,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: YOUTUBE_MUSIC_ID,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const existing = document.getElementById("yt-iframe-api");
      if (!existing) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") prevCallback();
        createPlayer();
      };
    }

    return () => {
      cancelled = true;
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (err) {
          // player may already have been destroyed
        }
        ytPlayerRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    const player = ytPlayerRef.current;
    if (!player) return;
    if (musicMuted) {
      player.unMute();
      if (typeof player.setVolume === "function") player.setVolume(45);
      player.playVideo();
      setMusicMuted(false);
    } else {
      player.mute();
      player.pauseVideo();
      setMusicMuted(true);
    }
  };

  const currentAussieIcon = AUSSIE_VARIANTS.find((v) => v.key === aussieVariant)?.src ?? null;

  // The Australium has no counter: its quantity is always 0 ("none") or 1
  // (a specific variant chosen) for that manifest entry.
  useEffect(() => {
    setDrops((prev) => ({
      ...prev,
      aussie: { ...prev.aussie, qty: aussieVariant === "none" ? 0 : 1 },
    }));
  }, [aussieVariant]);

  const iconFor = (key) => (key === "aussie" ? currentAussieIcon : ICONS[key]);

  // Quantities can only change via the +1/-1 (and +10/-10) buttons; there is
  // no manual number entry. Fixed drops (e.g. the Kit) ignore this entirely,
  // and drops with a `min`/`max` never go below/above it.
  const changeQty = (key, delta) => {
    const def = DROP_DEFS.find((d) => d.key === key);
    if (def?.fixed != null) return;
    const min = def?.min ?? 0;
    const max = def?.max ?? 999;
    setDrops((prev) => ({
      ...prev,
      [key]: { ...prev[key], qty: clampQty((Number(prev[key].qty) || 0) + delta, min, max) },
    }));
  };

  const handleAdd = () => {
    const entry = {
      id: Date.now() + Math.random(),
      date: todayISO(),
      tour: clampQty(tour),
      drops: DROP_DEFS.reduce((acc, d) => {
        acc[d.key] = { qty: clampQty(drops[d.key].qty, d.min ?? 0, d.max ?? 999) };
        return acc;
      }, {}),
      aussieIcon: currentAussieIcon,
    };
    setEntries((prev) => [...prev, entry]);
    // The tour counter is intentionally NOT reset here: it persists across
    // manifests (see the localStorage effect below) since a "tour" spans
    // many manifests.
    setDrops(emptyDrops());
    setAussieVariant("none");
  };

  const handleRemove = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const totals = entries.reduce(
    (acc, e) => {
      acc.tour += e.tour;
      DROP_DEFS.forEach((d) => {
        acc.drops[d.key] += e.drops[d.key].qty;
      });
      return acc;
    },
    { tour: 0, drops: zeroDropTotals() }
  );

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manifests-mvm-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (!Array.isArray(parsed)) throw new Error("Unexpected format");
        setEntries((prev) => [
          ...prev,
          ...parsed.map((p) => ({ ...p, id: Date.now() + Math.random() })),
        ]);
      } catch (err) {
        alert("Could not import: invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      {/* Background: mercenaries (red, left) and robots (blue, right)
          photo, behind all content, darkened so it doesn't interfere
          with readability. */}
      <div className="rl-page-base" aria-hidden="true" />
      <div
        className="rl-page-bg-left"
        style={{ backgroundImage: `url(${backgroundImg})` }}
        aria-hidden="true"
      />
      <div
        className="rl-page-bg-right"
        style={{ backgroundImage: `url(${backgroundImg})` }}
        aria-hidden="true"
      />
      <div className="rl-page-overlay" aria-hidden="true" />

      {/* Sound control in the top-left corner. */}
      <div className="rl-sound-controls">
        <button
          type="button"
          className={"rl-sound-btn" + (musicMuted ? " rl-sound-btn--muted" : "")}
          onClick={toggleMusic}
          aria-label={musicMuted ? "Turn on background music" : "Mute background music"}
          title={musicMuted ? "Turn on background music" : "Mute background music"}
        >
          {musicMuted ? <VolumeX size={15} strokeWidth={2.5} /> : <Volume2 size={15} strokeWidth={2.5} />}
          <span>Music</span>
        </button>
      </div>

      {/* YouTube player (background music), invisible on screen. */}
      <div className="rl-yt-audio" aria-hidden="true">
        <div ref={ytContainerRef} />
      </div>

    <div className="rl-root">
      <div className="rl-hazard" />

      <header className="rl-header">
        <h1 className="rl-title">Mann VS Machine: Two Cities</h1>

        <div className="rl-tour-hero">
          <span className="rl-tour-hero-label">
            <img src={ICONS.tours} alt="Tour" className="rl-tour-hero-icon" />
          </span>
          <div className="rl-tour-hero-controls">
            <button
              type="button"
              className="rl-ctr-btn rl-ctr-btn--hero"
              onClick={() => setTour((v) => clampQty((v === "" ? 0 : v) - 1))}
              aria-label="Decrease tour"
            >
              <Minus size={18} strokeWidth={3} />
            </button>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className="rl-tour-hero-input"
              value={tour}
              min={0}
              max={999}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setTour("");
                  return;
                }
                const n = parseFloat(v);
                setTour(Number.isNaN(n) ? 0 : clampQty(n));
              }}
              onBlur={() => {
                if (tour === "") setTour(0);
              }}
            />
            <button
              type="button"
              className="rl-ctr-btn rl-ctr-btn--hero rl-ctr-btn--plus"
              onClick={() => setTour((v) => clampQty((v === "" ? 0 : v) + 1))}
              aria-label="Increase tour"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <section className="rl-panel rl-form">
        <div className="rl-drops-block">
          <span className="rl-drops-title">Drops</span>
          <div className="rl-drops-grid">
            {DROP_DEFS.map((d) => (
              <DropCounter
                key={d.key}
                icon={iconFor(d.key)}
                label={d.label}
                qty={drops[d.key].qty}
                min={d.min ?? 0}
                max={d.max ?? 999}
                bigStep={!!d.bigStep}
                fixedValue={d.fixed ?? null}
                onDec={() => changeQty(d.key, -1)}
                onInc={() => changeQty(d.key, 1)}
                onDecBig={() => changeQty(d.key, -10)}
                onIncBig={() => changeQty(d.key, 10)}
                hideCounter={d.key === "aussie"}
                noneLabel={d.key === "aussie" ? "None" : undefined}
                picker={
                  d.key === "aussie" ? (
                    <div className="rl-variant-picker">
                      {AUSSIE_VARIANTS.map((v) => (
                        <button
                          type="button"
                          key={v.key}
                          className={
                            "rl-variant-swatch" +
                            (v.key === "none" ? " rl-variant-swatch--none" : "") +
                            (v.key === aussieVariant ? " rl-variant-swatch--active" : "")
                          }
                          onClick={() => setAussieVariant(v.key)}
                          aria-label={v.key === "none" ? "No image" : `Use image ${v.key}`}
                          title={v.key === "none" ? "None" : v.key}
                        >
                          {v.src ? <img src={v.src} alt={v.key} /> : <span>✕</span>}
                        </button>
                      ))}
                    </div>
                  ) : null
                }
              />
            ))}
          </div>
        </div>

        <button type="button" className="rl-add-btn" onClick={handleAdd}>
          <Plus size={16} strokeWidth={3} />
          Add to manifest
        </button>
      </section>

      <section className="rl-panel rl-table-panel">
        <div className="rl-table-toolbar">
          <span className="rl-table-toolbar-hint">
            Manifests are saved automatically in this browser.
          </span>
          <div className="rl-table-toolbar-actions">
            <button type="button" className="rl-toolbar-btn" onClick={handleExportJSON}>
              <Download size={14} strokeWidth={2.5} />
              Export JSON
            </button>
            <button type="button" className="rl-toolbar-btn" onClick={handleImportClick}>
              <Upload size={14} strokeWidth={2.5} />
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="rl-hidden-input"
              onChange={handleImportFile}
            />
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="rl-empty">
            No records yet. Fill out the form above and add the first entry.
          </div>
        ) : (
          <div className="rl-table-scroll">
            <table className="rl-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="rl-th-icon">
                    <img src={ICONS.tours} alt="Tour" />
                  </th>
                  {DROP_DEFS.map((d) => (
                    <th className="rl-th-icon" key={d.key}>
                      <img src={d.key === "aussie" ? aussieImg : ICONS[d.key]} alt={d.label} />
                    </th>
                  ))}
                  <th className="rl-th-actions" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="rl-td-date">{formatDateShort(e.date)}</td>
                    <td className="rl-td-num">{pad3(e.tour)}</td>
                    {DROP_DEFS.map((d) => (
                      <td className="rl-td-num" key={d.key}>
                        {d.key === "aussie" ? (
                          e.aussieIcon ? (
                            <img src={e.aussieIcon} alt="Australium" className="rl-td-aussie-icon" />
                          ) : (
                            <span className="rl-td-aussie-none">None</span>
                          )
                        ) : (
                          pad3(e.drops[d.key].qty)
                        )}
                      </td>
                    ))}
                    <td className="rl-td-actions">
                      <button
                        type="button"
                        className="rl-del-btn"
                        onClick={() => handleRemove(e.id)}
                        aria-label="Remove record"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="rl-total">TOTAL</td>
                  <td className="rl-td-num rl-total">{pad3(totals.tour)}</td>
                  {DROP_DEFS.map((d) => (
                    <td className="rl-td-num rl-total" key={d.key}>
                      {pad3(totals.drops[d.key])}
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
    </>
  );
}
