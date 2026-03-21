import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BibelMeister — Logo-Konzepte',
  description: 'Interne Logo-Konzept-Seite für BibelMeister',
  robots: 'noindex, nofollow',
};

/* ─── SVG: Concept 1 — Aufwärtswelle ─────────────────────────────────────── */
function AufwaertswelleSvg({ size }: { size: number }) {
  const s = size / 120; // scale factor (1 at 120px)
  const cx = 60 * s;
  const cy = 60 * s;
  const w = 120 * s;
  const h = 120 * s;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', borderRadius: size * 0.22 }}
    >
      <rect width="120" height="120" fill="#0F172A" />

      {/* Wave line 1 — darkest, thinnest */}
      <path
        d="M10 90 Q30 75 50 80 Q70 85 110 65"
        stroke="#B45309"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Wave line 2 */}
      <path
        d="M10 78 Q30 60 52 68 Q72 75 110 50"
        stroke="#D97706"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      {/* Wave line 3 — brighter */}
      <path
        d="M10 65 Q32 44 55 54 Q75 62 110 36"
        stroke="#F59E0B"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Wave line 4 — brightest, thickest — peak wave */}
      <path
        d="M10 52 Q34 28 57 40 Q78 50 110 22"
        stroke="#FDE68A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Geometric star / spark at peak (near 110,22) */}
      {/* 4-arm sharp spark */}
      <line x1="110" y1="16" x2="110" y2="28" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="104" y1="22" x2="116" y2="22" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="106" y1="18" x2="114" y2="26" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="114" y1="18" x2="106" y2="26" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      {/* Center dot */}
      <circle cx="110" cy="22" r="1.5" fill="#FFFBEB" />
    </svg>
  );
}

/* ─── SVG: Concept 2 — Fokus-Punkt ───────────────────────────────────────── */
function FokusPunktSvg({ size }: { size: number }) {
  const w = 120;
  const h = 120;
  // Center of arcs — slightly below center to give upward growth feel
  const ax = 60;
  const ay = 68;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', borderRadius: size * 0.22 }}
    >
      <rect width="120" height="120" fill="#0D4F4F" />

      {/* Arc 3 — outermost, lowest opacity */}
      {/* 270° arc, open at bottom: starts at 225° ends at 315° going clockwise through top */}
      {/* d: M = start-point, A = arc, ends at end-point */}
      {/* r=36, from left-bottom to right-bottom going UP */}
      <path
        d="M 34.5 93.5 A 36 36 0 1 1 85.5 93.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />

      {/* Arc 2 — middle */}
      <path
        d="M 39.5 88.5 A 26 26 0 1 1 80.5 88.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Arc 1 — innermost, brightest */}
      <path
        d="M 44.5 84 A 17 17 0 1 1 75.5 84"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Scripture lines — minimal horizontal lines inside */}
      <line x1="50" y1="66" x2="70" y2="66" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="53" y1="71" x2="67" y2="71" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <line x1="55" y1="76" x2="65" y2="76" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />

      {/* Spark at center-top of the arc system */}
      {/* Spark sits at the top of innermost arc: ax=60, ay=68-17=51 */}
      <circle cx="60" cy="51" r="3.5" fill="#5EEAD4" opacity="0.9" />
      <circle cx="60" cy="51" r="6" fill="#5EEAD4" opacity="0.2" />
      <circle cx="60" cy="51" r="9" fill="#5EEAD4" opacity="0.08" />
      {/* tiny bright center */}
      <circle cx="60" cy="51" r="1.5" fill="#CCFBF1" />
    </svg>
  );
}

/* ─── SVG: Concept 3 — Geometrie-Stern ───────────────────────────────────── */
function GeometrieSternSvg({ size }: { size: number }) {
  // Triangle 1: pointing up
  // Triangle 2: rotated 60° (not 180° — so it creates a sharp hexagonal overlap)
  const cx = 60;
  const cy = 60;
  const r = 34; // circumradius

  // Triangle 1 vertices (pointing up): 90°, 210°, 330°
  const t1 = [90, 210, 330].map((a) => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)] as [number, number];
  });

  // Triangle 2 vertices (rotated 60°): 30°, 150°, 270°
  const t2 = [30, 150, 270].map((a) => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)] as [number, number];
  });

  const poly1 = t1.map((p) => p.join(',')).join(' ');
  const poly2 = t2.map((p) => p.join(',')).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', borderRadius: size * 0.22 }}
    >
      <defs>
        <clipPath id={`star-clip-${size}`}>
          <polygon points={poly1} />
        </clipPath>
      </defs>

      <rect width="120" height="120" fill="#312E81" />

      {/* Triangle 1 — upward, light indigo fill */}
      <polygon
        points={poly1}
        fill="#818CF8"
        fillOpacity="0.35"
        stroke="#818CF8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Triangle 2 — rotated, turquoise accent */}
      <polygon
        points={poly2}
        fill="#2DD4BF"
        fillOpacity="0.2"
        stroke="#2DD4BF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Intersection highlight — clip triangle 2 by triangle 1 */}
      <polygon
        points={poly2}
        fill="#2DD4BF"
        fillOpacity="0.25"
        clipPath={`url(#star-clip-${size})`}
      />

      {/* The Word — very thin horizontal line at the intersection center */}
      <line
        x1={cx - 14}
        y1={cy}
        x2={cx + 14}
        y2={cy}
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Subtle glow dot at center */}
      <circle cx={cx} cy={cy} r="2.5" fill="white" opacity="0.3" />
    </svg>
  );
}

/* ─── Color Swatch ────────────────────────────────────────────────────────── */
function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full border border-white/20 shadow-inner"
        style={{ background: color }}
        title={label}
      />
      <span className="text-[10px] text-white/50 font-mono">{color}</span>
    </div>
  );
}

/* ─── Concept Card ────────────────────────────────────────────────────────── */
function ConceptCard({
  number,
  name,
  tagline,
  description,
  largeSize,
  smallSize,
  Logo,
  colors,
  typography,
}: {
  number: number;
  name: string;
  tagline: string;
  description: string;
  largeSize: number;
  smallSize: number;
  Logo: React.ComponentType<{ size: number }>;
  colors: { color: string; label: string }[];
  typography: { primary: string; secondary: string; note: string };
}) {
  return (
    <section
      className="rounded-3xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <span
            className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          >
            Konzept {number}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mt-2">{name}</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {tagline}
        </p>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left — logo previews */}
        <div className="flex flex-col gap-8">
          {/* Large */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
              App Icon — groß
            </span>
            <Logo size={largeSize} />
          </div>

          {/* Small — phone size */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
              App Icon — 120×120 px (Telefon)
            </span>
            <div className="flex items-center gap-4">
              <Logo size={smallSize} />
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <p className="font-mono">{smallSize}×{smallSize}px</p>
                <p className="mt-1">iOS / Android Home Screen</p>
              </div>
            </div>
          </div>

          {/* Color palette */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Farbpalette
            </span>
            <div className="flex gap-4 flex-wrap">
              {colors.map((c) => (
                <ColorSwatch key={c.color} color={c.color} label={c.label} />
              ))}
            </div>
          </div>
        </div>

        {/* Right — description + typography */}
        <div className="flex flex-col gap-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-2">
              Konzept-Beschreibung
            </h3>
            <p className="text-white/70 leading-relaxed text-sm">{description}</p>
          </div>

          {/* Typography */}
          <div
            className="rounded-2xl p-5 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Typography-Empfehlung
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-white/40 text-xs">Primär</span>
                <p className="text-white font-semibold text-lg leading-tight mt-0.5">
                  {typography.primary}
                </p>
              </div>
              <div>
                <span className="text-white/40 text-xs">Alternative</span>
                <p className="text-white/80 font-medium text-base leading-tight mt-0.5">
                  {typography.secondary}
                </p>
              </div>
              <p className="text-white/40 text-xs mt-1 border-t border-white/10 pt-3">
                {typography.note}
              </p>
            </div>
            {/* Sample word */}
            <div
              className="mt-5 pt-4 border-t border-white/10"
            >
              <span className="text-white/30 text-xs block mb-2">Vorschau App-Name</span>
              <span
                className="text-white text-2xl font-bold tracking-tight"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                BibelMeister
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function LogoPage() {
  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ background: '#0F172A' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-14">
        {/* Page header */}
        <header className="text-center flex flex-col gap-3">
          <p
            className="text-xs font-bold tracking-[0.25em] uppercase"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Intern · Nicht veröffentlicht
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            BibelMeister
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Logo-Konzepte
          </p>
          <div
            className="mx-auto mt-2 h-px w-24"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)' }}
          />
        </header>

        {/* Concept 1 */}
        <ConceptCard
          number={1}
          name="Aufwärtswelle"
          tagline="Midnight Blue + Gold"
          description="Eine abstrakte Aufwärtswelle aus 3–4 geschichteten Kurven, die nach oben hin heller und dicker werden. Das Motiv steht für Fortschritt und das Wort Gottes als Frequenz oder Schwingung. Ein kleiner, geometrischer Funke/Stern an der Spitze der Welle markiert den Höhepunkt. Die goldene Farbgebung verleiht dem Konzept Wärme und Vertrauen."
          largeSize={320}
          smallSize={120}
          Logo={AufwaertswelleSvg}
          colors={[
            { color: '#0F172A', label: 'Midnight Background' },
            { color: '#B45309', label: 'Gold Dark' },
            { color: '#F59E0B', label: 'Gold' },
            { color: '#FDE68A', label: 'Gold Light' },
            { color: '#FFFBEB', label: 'Spark White' },
          ]}
          typography={{
            primary: 'Inter',
            secondary: 'DM Sans',
            note: 'Geometrisch, vertrauenswürdig — ideal für eine sachliche, moderne Bibelapp mit klarer Lesbarkeit auf allen Größen.',
          }}
        />

        {/* Concept 2 */}
        <ConceptCard
          number={2}
          name="Fokus-Punkt"
          tagline="Deep Teal + White"
          description="Drei konzentrische, nach unten offene Bögen (270°) mit einem leuchtenden Funken an der Spitze. Das Motiv erinnert an einen Fokuspunkt oder ein Ziel — ohne den sterilen Bullseye-Look. Zwei minimale horizontale Linien im Inneren repräsentieren die Schrift. Das Offene nach unten steht für Wachstum und Offenheit."
          largeSize={320}
          smallSize={120}
          Logo={FokusPunktSvg}
          colors={[
            { color: '#0D4F4F', label: 'Deep Teal BG' },
            { color: '#FFFFFF', label: 'Arc White' },
            { color: '#5EEAD4', label: 'Spark Turquoise' },
            { color: '#CCFBF1', label: 'Spark Center' },
          ]}
          typography={{
            primary: 'Outfit',
            secondary: 'Nunito Sans',
            note: 'Modern, freundlich und gut lesbar — passt zur ruhigen, einladenden Teal-Farbgebung. Wirkt zugänglich ohne verspielt zu sein.',
          }}
        />

        {/* Concept 3 */}
        <ConceptCard
          number={3}
          name="Geometrie-Stern"
          tagline="Deep Indigo + Türkis"
          description="Ein abstrakter geometrischer Stern aus zwei überlagerten Dreiecken — eines zeigt nach oben (Aspiration), eines ist um 60° gedreht. Die Überschneidung erzeugt eine lebendige, hexagonale Form. Im Zentrum eine sehr dünne horizontale Linie — das Wort. Kein Davidsstern, sondern ein moderner Funken-Stern, der sich als App-Icon-ready auf jedem Hintergrund behauptet."
          largeSize={320}
          smallSize={120}
          Logo={GeometrieSternSvg}
          colors={[
            { color: '#312E81', label: 'Deep Indigo BG' },
            { color: '#818CF8', label: 'Light Indigo' },
            { color: '#2DD4BF', label: 'Turquoise Accent' },
            { color: '#FFFFFF', label: 'Line / Word' },
          ]}
          typography={{
            primary: 'Space Grotesk',
            secondary: 'Syne',
            note: 'Unverwechselbar und premium — die leichte Eigenheit von Space Grotesk / Syne spiegelt die geometrische Einzigartigkeit des Icons wider.',
          }}
        />

        {/* Footer note */}
        <footer className="text-center pb-8">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Interne Designseite · BibelMeister · Nicht im Hauptmenü verlinkt
          </p>
        </footer>
      </div>
    </div>
  );
}
