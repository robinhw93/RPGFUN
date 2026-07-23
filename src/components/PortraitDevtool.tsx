import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Copy, Download, Image, RotateCcw, Save, UserRound, Wrench, X } from "lucide-react";
import { CHARACTER_AVATARS } from "../game/avatars";
import { ENEMIES } from "../game/data";

type PortraitSubjectKind = "enemy" | "player";

interface PortraitCrop {
  centerX: number;
  centerY: number;
  diameter: number;
}

interface PortraitDraft extends PortraitCrop {
  kind: PortraitSubjectKind;
  id: string;
  name: string;
  imageId: string;
  imageUrl: string;
}

interface PortraitExchange {
  format: "arkenfall-portraits";
  version: 1;
  portraits: PortraitDraft[];
}

interface ImageChoice {
  id: string;
  name: string;
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  crop: PortraitCrop;
}

const PORTRAIT_DRAFT_STORAGE_KEY = "emberfall.portrait-devtool.v1";
const PLAYER_DEFAULT_CROP: PortraitCrop = { centerX: 50, centerY: 11.161, diameter: 41.667 };
const LEGACY_WINDSONG_WOLF_CROP: PortraitCrop = { centerX: 50.781, centerY: 22.786, diameter: 50.781 };
const ENEMY_DEFAULT_CROPS: Record<string, PortraitCrop> = {
  dummy: { centerX: 50, centerY: 18.359, diameter: 41.406 },
  "enemy-mrxiut2a-k4kgv": { centerX: 47.852, centerY: 50.13, diameter: 58.594 },
  "enemy-mrxj4o6o-o45ia": { centerX: 58.594, centerY: 42.318, diameter: 58.594 },
  "enemy-mrxk609z-n04fq": { centerX: 49.805, centerY: 30.599, diameter: 50.781 },
  "enemy-mrxkar5z-g9o5d": { centerX: 46.875, centerY: 38.411, diameter: 60.547 },
  "enemy-mrxkjqs3-g7g5i": { centerX: 49.805, centerY: 17.578, diameter: 45.898 },
};

const ENEMY_IMAGES: ImageChoice[] = Object.values(ENEMIES).map((enemy) => ({
  id: `enemy:${enemy.id}`,
  name: enemy.name,
  imageUrl: enemy.imageUrl,
  naturalWidth: 1024,
  naturalHeight: 1536,
  crop: ENEMY_DEFAULT_CROPS[enemy.id] ?? { centerX: 50, centerY: 28, diameter: 48 },
}));

const PLAYER_IMAGES: ImageChoice[] = CHARACTER_AVATARS.map((avatar) => ({
  id: `player:${avatar.id}`,
  name: avatar.label,
  imageUrl: avatar.imageUrl,
  naturalWidth: 864,
  naturalHeight: 1792,
  crop: PLAYER_DEFAULT_CROP,
}));

const IMAGE_CHOICES: Record<PortraitSubjectKind, ImageChoice[]> = {
  enemy: ENEMY_IMAGES,
  player: PLAYER_IMAGES,
};

const CANONICAL_PORTRAITS: PortraitDraft[] = [
  ...Object.values(ENEMIES).map((enemy) => {
    const image = ENEMY_IMAGES.find((choice) => choice.id === `enemy:${enemy.id}`) ?? ENEMY_IMAGES[0];
    return { kind: "enemy" as const, id: enemy.id, name: enemy.name, imageId: image.id, imageUrl: image.imageUrl, ...image.crop };
  }),
  ...CHARACTER_AVATARS.map((avatar) => {
    const image = PLAYER_IMAGES.find((choice) => choice.id === `player:${avatar.id}`) ?? PLAYER_IMAGES[0];
    return { kind: "player" as const, id: avatar.id, name: avatar.label, imageId: image.id, imageUrl: image.imageUrl, ...image.crop };
  }),
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finiteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function cropMatches(value: PortraitCrop, expected: PortraitCrop) {
  return Math.abs(value.centerX - expected.centerX) < 0.01
    && Math.abs(value.centerY - expected.centerY) < 0.01
    && Math.abs(value.diameter - expected.diameter) < 0.01;
}

function normalizeCrop(crop: PortraitCrop, naturalWidth = 1, naturalHeight = 1): PortraitCrop {
  const diameter = clamp(finiteNumber(crop.diameter, 48), 20, 90);
  const radiusX = diameter / 2;
  const radiusY = radiusX * naturalWidth / naturalHeight;
  return {
    centerX: clamp(finiteNumber(crop.centerX, 50), radiusX, 100 - radiusX),
    centerY: clamp(finiteNumber(crop.centerY, 28), radiusY, 100 - radiusY),
    diameter,
  };
}

function canonicalExchange(): PortraitExchange {
  return { format: "arkenfall-portraits", version: 1, portraits: CANONICAL_PORTRAITS };
}

function normalizeExchange(value: unknown): PortraitExchange {
  const source = value && typeof value === "object" && Array.isArray((value as Partial<PortraitExchange>).portraits)
    ? (value as Partial<PortraitExchange>).portraits ?? []
    : [];
  return {
    format: "arkenfall-portraits",
    version: 1,
    portraits: CANONICAL_PORTRAITS.map((fallback) => {
      const saved = source.find((entry) => entry?.kind === fallback.kind && entry?.id === fallback.id);
      if (!saved) return fallback;
      const choices = IMAGE_CHOICES[fallback.kind];
      const image = choices.find((choice) => choice.id === saved.imageId) ?? choices.find((choice) => choice.imageUrl === saved.imageUrl);
      if (!image) return fallback;
      const savedCrop = {
        centerX: finiteNumber(saved.centerX, image.crop.centerX),
        centerY: finiteNumber(saved.centerY, image.crop.centerY),
        diameter: finiteNumber(saved.diameter, image.crop.diameter),
      };
      const crop = fallback.id === "enemy-mrxj4o6o-o45ia"
        && image.id === "enemy:enemy-mrxj4o6o-o45ia"
        && cropMatches(savedCrop, LEGACY_WINDSONG_WOLF_CROP)
        ? image.crop
        : savedCrop;
      return {
        ...fallback,
        imageId: image.id,
        imageUrl: image.imageUrl,
        ...normalizeCrop(crop, image.naturalWidth, image.naturalHeight),
      };
    }),
  };
}

function readStoredExchange() {
  try {
    const value = window.localStorage.getItem(PORTRAIT_DRAFT_STORAGE_KEY);
    return normalizeExchange(value ? JSON.parse(value) : canonicalExchange());
  } catch {
    return canonicalExchange();
  }
}

function downloadJson(value: PortraitExchange) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "arkenfall-portraits.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function roundedExchange(value: PortraitExchange): PortraitExchange {
  return {
    ...value,
    portraits: value.portraits.map((portrait) => ({
      ...portrait,
      centerX: Number(portrait.centerX.toFixed(3)),
      centerY: Number(portrait.centerY.toFixed(3)),
      diameter: Number(portrait.diameter.toFixed(3)),
    })),
  };
}

export function PortraitDevtool({ onExit }: { onExit: () => void }) {
  const [exchange, setExchange] = useState<PortraitExchange>(readStoredExchange);
  const [kind, setKind] = useState<PortraitSubjectKind>("enemy");
  const [selectedKey, setSelectedKey] = useState(() => `enemy:${CANONICAL_PORTRAITS.find((portrait) => portrait.kind === "enemy")?.id ?? ""}`);
  const [message, setMessage] = useState("Changes save automatically in this browser");
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const subjects = useMemo(() => exchange.portraits.filter((portrait) => portrait.kind === kind), [exchange.portraits, kind]);
  const selected = exchange.portraits.find((portrait) => `${portrait.kind}:${portrait.id}` === selectedKey) ?? subjects[0];
  const selectedImage = IMAGE_CHOICES[kind].find((choice) => choice.id === selected?.imageId) ?? IMAGE_CHOICES[kind][0];

  const persist = (next: PortraitExchange, nextMessage?: string) => {
    setExchange(next);
    window.localStorage.setItem(PORTRAIT_DRAFT_STORAGE_KEY, JSON.stringify(next));
    if (nextMessage) setMessage(nextMessage);
  };

  const updateSelected = (patch: Partial<PortraitDraft>) => {
    if (!selected) return;
    const next = {
      ...exchange,
      portraits: exchange.portraits.map((portrait) => portrait.kind === selected.kind && portrait.id === selected.id
        ? { ...portrait, ...patch }
        : portrait),
    };
    persist(next);
  };

  const updateCrop = (crop: PortraitCrop) => updateSelected(normalizeCrop(crop, selectedImage.naturalWidth, selectedImage.naturalHeight));

  const positionFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!selected || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    updateCrop({
      centerX: (event.clientX - bounds.left) / bounds.width * 100,
      centerY: (event.clientY - bounds.top) / bounds.height * 100,
      diameter: selected.diameter,
    });
  };

  const chooseKind = (nextKind: PortraitSubjectKind) => {
    setKind(nextKind);
    const first = exchange.portraits.find((portrait) => portrait.kind === nextKind);
    if (first) setSelectedKey(`${first.kind}:${first.id}`);
  };

  const chooseImage = (choice: ImageChoice) => {
    updateSelected({ imageId: choice.id, imageUrl: choice.imageUrl, ...choice.crop });
    setMessage(`${choice.name} selected for ${selected?.name ?? "portrait"}`);
  };

  const save = () => persist(exchange, "Draft saved locally");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(roundedExchange(exchange), null, 2));
      setMessage("Portrait JSON copied for Codex");
    } catch {
      setMessage("Clipboard access was blocked. Use Export JSON instead.");
    }
  };

  if (!selected || !selectedImage) return null;

  const previewImageStyle = {
    width: `${10000 / selected.diameter}%`,
    left: "50%",
    top: "50%",
    transform: `translate(${-selected.centerX}%, ${-selected.centerY}%)`,
  };

  return <section className="content-devtool-page portrait-devtool-page">
    <header className="content-devtool-header">
      <div><p className="eyebrow"><Wrench size={13} /> Developer Tool</p><h1>Portrait Editor</h1><p>Choose artwork and drag the circle over the exact crop used for enemy and player combat portraits.</p></div>
      <div className="content-devtool-actions">
        <span aria-live="polite">{message}</span>
        <button type="button" onClick={save}><Save size={15} /> Save</button>
        <button type="button" onClick={copy}><Copy size={15} /> Copy for Codex</button>
        <button type="button" onClick={() => downloadJson(roundedExchange(exchange))}><Download size={15} /> Export JSON</button>
        <button type="button" className="devtool-exit" onClick={onExit}><X size={15} /> Exit</button>
      </div>
    </header>

    <div className="portrait-kind-tabs" role="tablist" aria-label="Portrait type">
      <button type="button" role="tab" aria-selected={kind === "enemy"} className={kind === "enemy" ? "selected" : ""} onClick={() => chooseKind("enemy")}><Image size={16} /> Enemies</button>
      <button type="button" role="tab" aria-selected={kind === "player"} className={kind === "player" ? "selected" : ""} onClick={() => chooseKind("player")}><UserRound size={16} /> Players</button>
    </div>

    <div className="content-devtool-layout portrait-devtool-layout">
      <aside className="content-devtool-list" aria-label={`${kind === "enemy" ? "Enemy" : "Player"} portraits`}>
        {subjects.map((portrait) => <button
          type="button"
          key={`${portrait.kind}:${portrait.id}`}
          className={`${portrait.kind}:${portrait.id}` === selectedKey ? "selected" : ""}
          onClick={() => setSelectedKey(`${portrait.kind}:${portrait.id}`)}
        >
          <span className="portrait-subject-row"><span className="portrait-list-preview"><img src={portrait.imageUrl} alt="" style={{ width: `${10000 / portrait.diameter}%`, left: "50%", top: "50%", transform: `translate(${-portrait.centerX}%, ${-portrait.centerY}%)` }} /></span><strong>{portrait.name}</strong></span>
          <small>{portrait.id}</small>
        </button>)}
      </aside>

      <section className="content-devtool-inspector portrait-inspector">
        <div className="content-editor-heading">
          <div><p className="eyebrow">{kind === "enemy" ? "Enemy portrait" : "Player portrait"}</p><h2>{selected.name}</h2></div>
          <button type="button" className="secondary-editor-button portrait-reset-button" onClick={() => {
            updateSelected({ imageId: selectedImage.id, imageUrl: selectedImage.imageUrl, ...selectedImage.crop });
            setMessage(`${selected.name} crop reset`);
          }}><RotateCcw size={14} /> Reset crop</button>
        </div>

        <div className="portrait-editor-grid">
          <div>
            <div
              ref={stageRef}
              className={`portrait-crop-stage${dragging ? " dragging" : ""}`}
              onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); positionFromPointer(event); }}
              onPointerMove={(event) => { if (dragging) positionFromPointer(event); }}
              onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); setDragging(false); }}
              onPointerCancel={() => setDragging(false)}
            >
              <img src={selected.imageUrl} alt={`${selectedImage.name} full artwork`} draggable={false} />
              <span className="portrait-crop-shade" aria-hidden="true" />
              <span className="portrait-crop-circle" aria-hidden="true" style={{ left: `${selected.centerX}%`, top: `${selected.centerY}%`, width: `${selected.diameter}%` }}><span /></span>
              <span className="portrait-crop-hint">Drag anywhere to position</span>
            </div>
          </div>

          <aside className="portrait-preview-panel">
            <p className="eyebrow">Combat preview</p>
            <div className="portrait-circular-preview"><img src={selected.imageUrl} alt={`${selected.name} portrait preview`} draggable={false} style={previewImageStyle} /></div>
            <strong>{selected.name}</strong>
            <div className="portrait-crop-controls">
              <label><span>Horizontal position</span><output>{selected.centerX.toFixed(1)}%</output><input aria-label="Horizontal position" type="range" min="0" max="100" step="0.1" value={selected.centerX} onChange={(event) => updateCrop({ ...selected, centerX: Number(event.target.value) })} /></label>
              <label><span>Vertical position</span><output>{selected.centerY.toFixed(1)}%</output><input aria-label="Vertical position" type="range" min="0" max="100" step="0.1" value={selected.centerY} onChange={(event) => updateCrop({ ...selected, centerY: Number(event.target.value) })} /></label>
              <label><span>Circle size</span><output>{selected.diameter.toFixed(1)}%</output><input aria-label="Circle size" type="range" min="20" max="90" step="0.1" value={selected.diameter} onChange={(event) => updateCrop({ ...selected, diameter: Number(event.target.value) })} /></label>
            </div>
          </aside>
        </div>

        <div className="portrait-image-library">
          <div><p className="eyebrow">Image library</p><h3>Choose generated artwork</h3><p>Changing the image starts from that artwork's recommended portrait crop.</p></div>
          <div className="portrait-image-options">
            {IMAGE_CHOICES[kind].map((choice) => <button type="button" key={choice.id} className={choice.id === selected.imageId ? "selected" : ""} onClick={() => chooseImage(choice)}>
              <span><img src={choice.imageUrl} alt="" draggable={false} /></span><strong>{choice.name}</strong>
            </button>)}
          </div>
        </div>
      </section>
    </div>
  </section>;
}
