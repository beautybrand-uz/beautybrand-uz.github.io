/**
 * Receipt Printer. Designed & built by Aakash Mehra (aakashmehra.com).
 *
 * A thermal printer seen from above, its paper slot facing up the screen. Press the red PRINT
 * button and the feed motor whirs while a receipt rises smoothly out of the slot, header first.
 * The paper is one continuous strip: press PRINT mid-print and it stops where it is; press it again
 * (or after it finishes) and a whole new receipt prints on, joined to what's already out. Pull the
 * strip (up or sideways) and it tears off along a zigzag edge and flies away.
 *
 * Every size is a multiple of --u, so the whole thing scales with the viewport. Sounds are
 * synthesized with WebAudio, so there are no asset files.
 *
 * Adapted for BeautyBrand Uz: order code and date from the real order, item variants, money
 * formatter, extra info rows, QR code (exchange / return link) instead of the barcode, localisable
 * labels, `autoPrint` to print as soon as it appears, configurable maker's mark and height.
 */
"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  MotionConfig,
  animate,
  motion,
  motionValue,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export type ReceiptItem = { name: string; qty: number; price: number; variant?: string };

export type ReceiptLabels = {
  order: string;
  subtotal: string;
  tax: (pct: number) => string;
  total: string;
  thanks: string;
  scan: string;
  print: string;
  printAria: string;
  hintIdle: string;
  hintPrinting: string;
  hintDone: string;
  paperAria: string;
  soundOn: string;
  soundOff: string;
};

const EN: ReceiptLabels = {
  order: "Order",
  subtotal: "Subtotal",
  tax: (pct) => `Tax ${pct}%`,
  total: "Total",
  thanks: "THANK YOU",
  scan: "Scan to exchange or return",
  print: "PRINT",
  printAria: "Print receipt",
  hintIdle: "Press print",
  hintPrinting: "Printing… press print to stop",
  hintDone: "Pull to tear it off, or print another",
  paperAria: "Receipt. Pull it, or press Enter, to tear it off.",
  soundOn: "Turn sound on",
  soundOff: "Turn sound off",
};

export type ReceiptPrinterProps = {
  store?: string;
  address?: string;
  items?: ReceiptItem[];
  currency?: string;
  /** Format a money amount; overrides `currency`. */
  formatMoney?: (n: number) => string;
  /** 0.1 = 10%; 0 hides the tax line. */
  taxRate?: number;
  /** Order code printed on the receipt (otherwise a running number). */
  orderCode?: string;
  /** Date line (otherwise now). */
  date?: string;
  /** Extra lines under the order number: pickup point, customer… */
  info?: [string, string][];
  /** Encode this in a QR code at the bottom instead of the barcode. */
  qrValue?: string;
  /** Print once as soon as it appears. */
  autoPrint?: boolean;
  /** Name moulded into the printer's case. */
  mark?: string;
  labels?: Partial<ReceiptLabels>;
  /** Height of the stage; defaults to the full viewport. */
  stageHeight?: string;
  onPrint?: (order: number) => void;
  className?: string;
};

const ITEMS: ReceiptItem[] = [
  { name: "Cola", qty: 2, price: 100 },
  { name: "Melon soda", qty: 1, price: 90 },
  { name: "Peach", qty: 1, price: 120 },
  { name: "Rice crackers", qty: 1, price: 180 },
];

/** One design unit. The stage is 440 x 930 units. */
const u = (n: number) => `calc(var(--u) * ${n})`;
const W = 440;
const H = 930;
const SLOT_Y = 690; // where the paper comes out
const PAPER_W = 300;
const PAPER_X = (W - PAPER_W) / 2;

type Receipt = {
  id: number;
  order: number;
  date: string;
  frac: MotionValue<number>;
};
type Phase = "idle" | "printing" | "stopped";

export function ReceiptPrinter({
  store = "Fizz & Co.",
  address = "12 Harbor Street, Lisbon",
  items = ITEMS,
  currency = "¥",
  formatMoney,
  taxRate = 0.1,
  orderCode,
  date,
  info,
  qrValue,
  autoPrint,
  mark = "skyrmo",
  labels,
  stageHeight = "100dvh",
  onPrint,
  className,
}: ReceiptPrinterProps) {
  const L: ReceiptLabels = { ...EN, ...labels };
  // The paper is one continuous strip: every print joins a new receipt onto the end of it.
  const [strip, setStrip] = useState([] as Receipt[]);
  const [flying, setFlying] = useState(
    null as null | {
      strip: Receipt[];
      x: number;
      y: number;
      vx: number;
      vy: number;
    },
  );
  const [phase, setPhase] = useState("idle" as Phase);
  const [pressed, setPressed] = useState(false);
  const [soundOff, setSoundOff] = useState(false);
  const order = useRef(426);
  const nextId = useRef(0);
  const feeding = useRef(null as null | { stop: () => void });

  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const pullR = useTransform(pullX, (x) => x * 0.04);
  const drag = useRef(
    null as null | {
      x0: number;
      y0: number;
      lx: number;
      ly: number;
      lt: number;
      vx: number;
      vy: number;
    },
  );

  const lines = 22 + items.length + (info?.length ?? 0); // roughly how long one receipt takes

  useEffect(() => () => feeding.current?.stop(), []);

  /** Print a whole new receipt onto the end of the strip. */
  const printOne = () => {
    order.current += 1;
    const r: Receipt = {
      id: nextId.current++,
      order: order.current,
      date:
        date ??
        new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      frac: motionValue(0),
    };
    setStrip((s) => [...s, r]);
    setPhase("printing");
    onPrint?.(order.current);

    const dur = 0.9 + lines * 0.1;
    const stopSound = sfx.feed(dur);
    // a steady feed: it eases off the line for a beat, runs at an even speed, then stops
    const a = animate(r.frac, 1, { duration: dur, ease: [0.4, 0, 0.9, 1] });
    feeding.current = {
      stop: () => {
        a.stop();
        stopSound();
      },
    };
    a.then(() => {
      if (r.frac.get() < 0.999) return; // stopped early
      feeding.current = null;
      setPhase("stopped");
      sfx.done();
    });
  };

  // print once on arrival (the click that placed the order has already unlocked the audio)
  useEffect(() => {
    if (!autoPrint) return;
    const id = setTimeout(() => {
      sfx.unlock();
      printOne();
    }, 450);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint]);

  const stopFeed = () => {
    feeding.current?.stop();
    feeding.current = null;
    setPhase("stopped");
  };

  /** Rip the whole strip off at the slot; it flies away with the given velocity. */
  const tear = (vx: number, vy: number) => {
    if (!strip.length) return;
    feeding.current?.stop();
    feeding.current = null;
    sfx.rip();
    setFlying({ strip, x: pullX.get(), y: pullY.get(), vx, vy });
    setStrip([]);
    setPhase("idle");
    pullX.set(0);
    pullY.set(0);
  };

  // PRINT: stops the feed if it's running, otherwise prints another receipt onto the strip.
  const print = () => {
    sfx.unlock();
    sfx.button();
    setPressed(true);
    setTimeout(() => setPressed(false), 140);
    if (phase === "printing") stopFeed();
    else setTimeout(printOne, 160);
  };

  /* Pulling the strip: it gives a little (it's still attached), then rips. */
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    sfx.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      x0: e.clientX,
      y0: e.clientY,
      lx: e.clientX,
      ly: e.clientY,
      lt: e.timeStamp,
      vx: 0,
      vy: 0,
    };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.vx = ((e.clientX - d.lx) / dt) * 1000;
    d.vy = ((e.clientY - d.ly) / dt) * 1000;
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.lt = e.timeStamp;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    // stretch with resistance; pushing it back into the printer does nothing
    pullX.set(dx * 0.3);
    pullY.set(Math.min(0, dy) * 0.3);
    if (Math.hypot(dx, Math.min(0, dy)) > 80) {
      drag.current = null;
      tear(d.vx || dx * 8, Math.min(d.vy, -300));
    }
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    animate(pullX, 0, { type: "spring", stiffness: 500, damping: 22 });
    animate(pullY, 0, { type: "spring", stiffness: 500, damping: 22 });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tear(0, -900);
    }
  };

  const total = items.reduce((t, i) => t + i.qty * i.price, 0);
  const tax = Math.round(total * taxRate);
  const money = formatMoney ?? ((n: number) => `${currency}${n.toLocaleString("en-US")}`);
  const paper: PaperProps = { store, address, items, money, total, tax, taxRate, orderCode, info, qrValue, L };
  const hint = phase === "printing" ? L.hintPrinting : strip.length ? L.hintDone : L.hintIdle;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "relative grid w-full place-items-center overflow-hidden font-sans text-[#2b2a27]",
          className,
        )}
        style={
          {
            minHeight: stageHeight,
            "--u": `min((100vw - 32px) / 440, (${stageHeight} - 24px) / 930)`,
            background:
              "radial-gradient(80% 70% at 50% 35%, #e9e6df 0%, #dcd8cf 55%, #cdc8bd 100%)",
          } as CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
          style={{ backgroundImage: GRAIN }}
        />

        {/* sound on / off */}
        <button
          type="button"
          onClick={() => {
            const next = !soundOff;
            setSoundOff(next);
            setMuted(next);
            if (!next) {
              sfx.unlock();
              sfx.button();
            }
          }}
          aria-label={soundOff ? L.soundOn : L.soundOff}
          aria-pressed={soundOff}
          className="absolute right-4 bottom-4 z-40 grid size-10 cursor-pointer place-items-center rounded-full bg-white/70 text-[#2b2a27] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_6px_16px_-8px_rgb(0_0_0/0.3)] ring-1 ring-black/5 backdrop-blur transition-[transform,background-color] duration-200 hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4231a]"
        >
          {soundOff ? (
            <VolumeX className="size-[18px]" strokeWidth={2} />
          ) : (
            <Volume2 className="size-[18px]" strokeWidth={2} />
          )}
        </button>

        <div className="relative" style={{ width: u(W), height: u(H) }}>
          {/* the strip, rising out of the slot; clipped at the slot so it comes from inside, free to run off the top */}
          <div
            className="pointer-events-none absolute z-10 overflow-hidden"
            style={{
              left: u(PAPER_X - 40),
              width: u(PAPER_W + 80),
              top: u(-3000),
              height: u(SLOT_Y + 3000),
            }}
          >
            {strip.length > 0 && (
              <motion.div
                role="button"
                tabIndex={0}
                aria-label={L.paperAria}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onKeyDown={onKey}
                className="pointer-events-auto absolute bottom-0 cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-[#d4231a]/60 active:cursor-grabbing"
                style={{
                  left: u(40),
                  width: u(PAPER_W),
                  x: pullX,
                  y: pullY,
                  rotate: pullR,
                  transformOrigin: "50% 100%",
                }}
              >
                <Strip strip={strip} paper={paper} />
              </motion.div>
            )}
          </div>

          {/* the strip that got torn off */}
          {flying && (
            <motion.div
              className="pointer-events-none absolute z-30"
              style={{
                left: u(PAPER_X),
                width: u(PAPER_W),
                bottom: u(H - SLOT_Y),
                transformOrigin: "50% 100%",
                WebkitMask: ZIGZAG_BOTTOM,
                mask: ZIGZAG_BOTTOM,
              }}
              initial={{
                x: flying.x,
                y: flying.y,
                rotate: flying.x * 0.04,
                opacity: 1,
              }}
              animate={{
                x: flying.x + flying.vx * 0.55,
                y: flying.y + flying.vy * 0.55 - 120,
                rotate:
                  flying.x * 0.04 +
                  flying.vx * 0.03 +
                  (flying.vx >= 0 ? 14 : -14),
                opacity: 0,
              }}
              transition={{
                duration: 0.85,
                ease: [0.2, 0.7, 0.3, 1],
                opacity: { duration: 0.85, ease: "easeIn" },
              }}
              onAnimationComplete={() => setFlying(null)}
            >
              <Strip strip={flying.strip} paper={paper} />
            </motion.div>
          )}

          {/* ---- the printer, from above: pearl-matte body, lid, black-glass control panel ---- */}
          <div
            className="absolute"
            style={{ left: u(20), top: u(640), width: u(400), height: u(240) }}
          >
            {/* ambient occlusion on the table, then the soft cast shadow */}
            <div
              aria-hidden
              className="absolute"
              style={{
                inset: `${u(10)} ${u(4)} ${u(-14)} ${u(4)}`,
                borderRadius: u(48),
                background: "rgb(40 30 22 / 0.55)",
                filter: `blur(${u(16)})`,
                transform: `translate(${u(8)}, ${u(14)})`,
              }}
            />
            <div
              aria-hidden
              className="absolute"
              style={{ inset: `${u(2)} ${u(10)} ${u(-4)}`, borderRadius: u(44), background: "rgb(30 22 16 / 0.5)", filter: `blur(${u(3)})` }}
            />

            {/* body shell: 10-stop gradient, bevelled edge, side falloff */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                borderRadius: u(44),
                background:
                  "linear-gradient(180deg, #fbfaf7 0%, #f5f2ec 12%, #efebe4 30%, #ebe6de 48%, #e6e1d8 62%, #e0dad0 76%, #d9d2c7 88%, #cfc8bc 96%, #c4bcaf 100%)",
                boxShadow: [
                  `inset 0 ${u(2)} ${u(1)} rgb(255 255 255 / 0.95)`,
                  `inset 0 ${u(-3)} ${u(2)} rgb(110 98 82 / 0.28)`,
                  `inset ${u(6)} 0 ${u(10)} ${u(-6)} rgb(255 255 255 / 0.7)`,
                  `inset ${u(-8)} 0 ${u(14)} ${u(-8)} rgb(110 98 82 / 0.22)`,
                  `0 ${u(1)} ${u(1)} rgb(60 50 40 / 0.25)`,
                ].join(", "),
              }}
            >
              {/* matte grain */}
              <div className="absolute inset-0 opacity-[0.22] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
              {/* broad soft reflection of a window, top-left */}
              <div
                className="absolute"
                style={{
                  left: u(-40),
                  top: u(-60),
                  width: u(300),
                  height: u(200),
                  background: "radial-gradient(closest-side, rgb(255 255 255 / 0.55), transparent)",
                }}
              />
            </div>

            {/* lid: a separate moulding over the paper bay, with its parting line */}
            <div
              className="absolute"
              style={{
                left: u(10),
                right: u(10),
                top: u(8),
                height: u(94),
                borderRadius: `${u(36)} ${u(36)} ${u(10)} ${u(10)}`,
                background: "linear-gradient(180deg, #fdfcf9 0%, #f6f3ed 45%, #eeeae2 100%)",
                boxShadow: `inset 0 ${u(1.5)} 0 rgb(255 255 255), 0 ${u(1)} 0 rgb(255 255 255 / 0.6), 0 ${u(2)} ${u(3)} rgb(90 78 62 / 0.18)`,
              }}
            />
            <div
              aria-hidden
              className="absolute"
              style={{
                left: u(22),
                right: u(22),
                top: u(103),
                height: u(2),
                borderRadius: u(2),
                background: "linear-gradient(90deg, transparent, rgb(95 84 70 / 0.45) 8%, rgb(95 84 70 / 0.45) 92%, transparent)",
                boxShadow: `0 ${u(1.2)} 0 rgb(255 255 255 / 0.9)`,
              }}
            />
            {/* lid screws */}
            {[26, 374].map((x) => (
              <span
                key={x}
                aria-hidden
                className="absolute rounded-full"
                style={{
                  left: u(x - 5),
                  top: u(80),
                  width: u(10),
                  height: u(10),
                  background: "radial-gradient(circle at 35% 30%, #ffffff, #cfc8bd 55%, #9e968a)",
                  boxShadow: `inset 0 0 0 ${u(0.6)} rgb(0 0 0 / 0.18), 0 ${u(0.8)} 0 rgb(255 255 255 / 0.9)`,
                }}
              >
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[30deg] bg-[#7d7468]" style={{ width: u(6), height: u(1.2) }} />
              </span>
            ))}

            {/* paper slot: deep, with the roll visible inside */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: u(PAPER_X - 20 - 18),
                width: u(PAPER_W + 36),
                top: u(SLOT_Y - 640 - 8),
                height: u(16),
                borderRadius: u(8),
                background: "linear-gradient(180deg, #0e0d0c 0%, #1d1b19 40%, #2e2b27 80%, #3b3833 100%)",
                boxShadow: `inset 0 ${u(3)} ${u(4)} rgb(0 0 0 / 0.9), inset 0 ${u(-1)} 0 rgb(255 255 255 / 0.08), 0 ${u(1.2)} 0 rgb(255 255 255 / 0.95), 0 ${u(-1)} ${u(1)} rgb(80 70 58 / 0.35)`,
              }}
            >
              <div
                aria-hidden
                className="absolute inset-x-[4%]"
                style={{
                  bottom: u(2),
                  height: u(5),
                  borderRadius: u(3),
                  background: "linear-gradient(180deg, #8c8780, #d8d4cb 60%, #b9b4aa)",
                  opacity: 0.55,
                }}
              />
            </div>
            {/* paper lip waiting in the slot */}
            {!strip.length && (
              <div
                className="absolute bg-[#fbfaf6]"
                style={{
                  left: u(PAPER_X - 20),
                  width: u(PAPER_W),
                  top: u(SLOT_Y - 640 - 9),
                  height: u(9),
                  WebkitMask: ZIGZAG_TOP,
                  mask: ZIGZAG_TOP,
                }}
              />
            )}

            {/* speaker grille */}
            <div
              aria-hidden
              className="absolute"
              style={{
                left: u(34),
                top: u(128),
                width: u(118),
                height: u(42),
                borderRadius: u(12),
                backgroundImage: "radial-gradient(circle, rgb(40 34 28 / 0.55) 0 32%, rgb(255 255 255 / 0.65) 40%, transparent 46%)",
                backgroundSize: `${u(9)} ${u(9)}`,
                backgroundPosition: "center",
                WebkitMask: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
                mask: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
              }}
            />

            {/* debossed maker's mark */}
            <span
              aria-hidden
              className="font-script absolute select-none"
              style={{
                left: u(34),
                top: u(176),
                fontSize: u(30),
                lineHeight: 1,
                color: "#d6cfc4",
                textShadow: `0 ${u(-1)} 0 rgb(90 78 62 / 0.55), 0 ${u(1.2)} 0 rgb(255 255 255 / 0.95)`,
              }}
            >
              {mark}
            </span>
            <span
              aria-hidden
              className="absolute select-none font-semibold tracking-[0.28em] uppercase"
              style={{ left: u(36), top: u(214), fontSize: u(6.5), color: "#a39a8d", textShadow: `0 ${u(0.8)} 0 rgb(255 255 255 / 0.9)` }}
            >
              Thermal · 80 mm
            </span>

            {/* black-glass control panel */}
            <div
              className="absolute"
              style={{
                left: u(196),
                top: u(120),
                width: u(184),
                height: u(100),
                borderRadius: u(22),
                background: "linear-gradient(160deg, #3a3532 0%, #232020 30%, #161414 60%, #0d0c0c 100%)",
                boxShadow: [
                  `inset 0 ${u(1)} 0 rgb(255 255 255 / 0.16)`,
                  `inset 0 ${u(-2)} ${u(4)} rgb(0 0 0 / 0.6)`,
                  `0 0 0 ${u(1.5)} rgb(196 186 172 / 0.9)`,
                  `0 ${u(1.5)} 0 ${u(1.5)} rgb(255 255 255 / 0.85)`,
                  `0 ${u(-1)} ${u(2)} ${u(1)} rgb(90 78 62 / 0.35)`,
                ].join(", "),
              }}
            >
              {/* glass sheen */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ borderRadius: u(22) }}
              >
                <div
                  className="absolute"
                  style={{
                    left: u(-30),
                    top: u(-60),
                    width: u(160),
                    height: u(120),
                    transform: "rotate(-18deg)",
                    background: "linear-gradient(180deg, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0))",
                  }}
                />
              </div>

              {/* LEDs with engraved labels */}
              <div className="absolute flex flex-col" style={{ left: u(18), top: u(22), gap: u(12) }}>
                <span className="flex items-center" style={{ gap: u(7) }}>
                  <span
                    className="block rounded-full"
                    style={{ width: u(7), height: u(7), background: "#4fd27a", boxShadow: `0 0 ${u(6)} rgb(79 210 122 / 0.9), inset 0 ${u(-1)} ${u(1)} rgb(0 60 20 / 0.5)` }}
                  />
                  <span className="font-semibold tracking-[0.2em] text-[#8f877e]" style={{ fontSize: u(6.5) }}>POWER</span>
                </span>
                <span className="flex items-center" style={{ gap: u(7) }}>
                  <motion.span
                    className="block rounded-full"
                    style={{ width: u(7), height: u(7) }}
                    animate={
                      phase === "printing"
                        ? {
                            backgroundColor: ["#ffb340", "#5a3d0c", "#ffb340"],
                            boxShadow: [`0 0 ${u(7)} #ffb340`, "0 0 0px #ffb340", `0 0 ${u(7)} #ffb340`],
                          }
                        : { backgroundColor: "#3b2a10", boxShadow: "0 0 0px #ffb340" }
                    }
                    transition={phase === "printing" ? { duration: 0.5, repeat: Infinity } : { duration: 0.3 }}
                  />
                  <span className="font-semibold tracking-[0.2em] text-[#8f877e]" style={{ fontSize: u(6.5) }}>PAPER</span>
                </span>
              </div>

              {/* FEED: a small flush key that also prints */}
              <button
                type="button"
                onClick={print}
                tabIndex={-1}
                aria-hidden
                className="absolute grid cursor-pointer place-items-center rounded-full font-semibold tracking-[0.18em] text-[#bdb4a9] transition-transform active:scale-95"
                style={{
                  left: u(16),
                  top: u(64),
                  width: u(52),
                  height: u(20),
                  fontSize: u(6.5),
                  background: "linear-gradient(180deg, #2b2826, #1a1817)",
                  boxShadow: `inset 0 ${u(1)} 0 rgb(255 255 255 / 0.12), 0 ${u(1.5)} ${u(2)} rgb(0 0 0 / 0.6)`,
                }}
              >
                FEED
              </button>

              {/* PRINT button: rose-gold bezel, glossy red cap */}
              <button
                type="button"
                onClick={print}
                aria-label={L.printAria}
                className="absolute grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4231a]"
                style={{
                  left: u(92),
                  top: u(12),
                  width: u(78),
                  height: u(78),
                  background:
                    "conic-gradient(from 210deg, #f7dcc8, #c99579, #f3d2bd, #a8735a, #e9bfa6, #c38e72, #f7dcc8)",
                  boxShadow: `inset 0 0 0 ${u(1)} rgb(255 255 255 / 0.5), 0 ${u(3)} ${u(6)} rgb(0 0 0 / 0.6)`,
                }}
              >
                <span
                  className="absolute rounded-full"
                  style={{ inset: u(5), background: "radial-gradient(circle at 50% 40%, #1d1a18, #050505)", boxShadow: `inset 0 ${u(2)} ${u(3)} rgb(0 0 0 / 0.9)` }}
                />
                <span
                  className="relative grid place-items-center rounded-full font-bold tracking-[0.14em] text-white transition-[transform,box-shadow,filter] duration-100"
                  style={{
                    width: u(58),
                    height: u(58),
                    fontSize: u(10),
                    background:
                      "radial-gradient(circle at 38% 28%, #ffb3a6 0%, #ff6b5c 18%, #ef3427 42%, #c81d13 72%, #8f110b 100%)",
                    boxShadow: pressed
                      ? `inset 0 ${u(3)} ${u(6)} rgb(80 0 0 / 0.6)`
                      : `inset 0 ${u(-4)} ${u(6)} rgb(80 0 0 / 0.5), inset 0 ${u(2)} ${u(2)} rgb(255 210 200 / 0.75), 0 ${u(4)} ${u(6)} rgb(0 0 0 / 0.55)`,
                    transform: pressed ? `translateY(${u(2)}) scale(0.95)` : "none",
                    filter: pressed ? "brightness(0.9)" : "none",
                    textShadow: `0 ${u(1)} ${u(1)} rgb(100 0 0 / 0.65)`,
                  }}
                >
                  {/* specular highlight on the cap */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute rounded-full"
                    style={{ left: u(12), top: u(7), width: u(24), height: u(12), background: "radial-gradient(closest-side, rgb(255 255 255 / 0.75), transparent)" }}
                  />
                  {L.print}
                </span>
              </button>
            </div>
          </div>

          {/* serrated stainless tear bar over the slot, screwed down at both ends */}
          <div
            className="absolute z-20"
            style={{
              left: u(PAPER_X - 22),
              width: u(PAPER_W + 44),
              top: u(SLOT_Y - 12),
              height: u(7),
              background:
                "linear-gradient(180deg, #ffffff 0%, #e6e8ec 25%, #b9bdc4 55%, #8d929b 80%, #6f747d 100%)",
              WebkitMask: ZIGZAG_TOP_SMALL,
              mask: ZIGZAG_TOP_SMALL,
              filter: `drop-shadow(0 ${u(1)} ${u(1)} rgb(0 0 0 / 0.4))`,
            }}
          />
          {[PAPER_X - 30, PAPER_X + PAPER_W + 22].map((x) => (
            <span
              key={x}
              aria-hidden
              className="absolute z-20 rounded-full"
              style={{
                left: u(x),
                top: u(SLOT_Y - 13),
                width: u(8),
                height: u(8),
                background: "radial-gradient(circle at 35% 30%, #ffffff, #b9bdc4 55%, #6f747d)",
                boxShadow: `0 ${u(1)} ${u(1)} rgb(0 0 0 / 0.35)`,
              }}
            />
          ))}

          {/* hint */}
          <motion.p
            key={hint}
            aria-live="polite"
            initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="absolute inset-x-0 text-center text-[#6f6a60]"
            style={{ top: u(898), fontSize: u(13) }}
          >
            {hint}
          </motion.p>
        </div>
      </div>
    </MotionConfig>
  );
}

/* ---------------------------------------------------------------------------
 * The paper
 * ------------------------------------------------------------------------- */

const ZIGZAG_TOP =
  "conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--u) * 12) 100%";
const ZIGZAG_TOP_SMALL =
  "conic-gradient(from 135deg at top, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--u) * 6) 100%";
const ZIGZAG_BOTTOM =
  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--u) * 12) 100%";

function Row({ l, r, strong }: { l: string; r: string; strong?: boolean }) {
  return (
    <div
      className={cn("flex justify-between gap-3", strong && "font-bold")}
      style={{ fontSize: u(strong ? 14 : 11.5) }}
    >
      <span className="min-w-0 break-words">{l}</span>
      <span className="shrink-0 tabular-nums">{r}</span>
    </div>
  );
}

function Rule() {
  return (
    <div
      className="border-t border-dashed border-[#2a2a2a]/50"
      style={{ margin: `${u(9)} 0` }}
    />
  );
}

type PaperProps = {
  store: string;
  address: string;
  items: ReceiptItem[];
  money: (n: number) => string;
  total: number;
  tax: number;
  taxRate: number;
  orderCode?: string;
  info?: [string, string][];
  qrValue?: string;
  L: ReceiptLabels;
};

/** The strip: receipts joined end to end, each shown as far as it has printed. */
function Strip({ strip, paper }: { strip: Receipt[]; paper: PaperProps }) {
  return (
    <div
      style={{ boxShadow: `0 ${u(10)} ${u(24)} ${u(-6)} rgb(40 35 25 / 0.35)` }}
    >
      {strip.map((r, i) => (
        <Segment key={r.id} receipt={r} first={i === 0} paper={paper} />
      ))}
    </div>
  );
}

function Segment({
  receipt,
  first,
  paper,
}: {
  receipt: Receipt;
  first: boolean;
  paper: PaperProps;
}) {
  const inner = useRef(null as HTMLDivElement | null);
  const full = useMotionValue(0); // the whole receipt's height, measured
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    full.set(el.offsetHeight);
    const ro = new ResizeObserver(() => full.set(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [full]);
  // only the printed part exists yet; as it grows, everything above it rises out of the slot
  const height = useTransform(() => receipt.frac.get() * full.get());
  return (
    <motion.div className="relative overflow-hidden" style={{ height }}>
      <div ref={inner}>
        <Paper receipt={receipt} first={first} {...paper} />
      </div>
    </motion.div>
  );
}

function Paper({
  receipt,
  first,
  store,
  address,
  items,
  money,
  total,
  tax,
  taxRate,
  orderCode,
  info,
  qrValue,
  L,
}: PaperProps & { receipt: Receipt; first?: boolean }) {
  const code = orderCode ?? String(receipt.order).padStart(4, "0");
  const bars = Array.from(
    { length: 46 },
    (_, i) => ((receipt.order * (i + 7) * 31 + i * i) % 3) + 1,
  );

  return (
    <div
      className="relative font-mono text-[#262624]"
      style={{
        padding: `${u(22)} ${u(22)} ${u(30)}`,
        lineHeight: 1.55,
        background:
          "linear-gradient(90deg, #f1f0eb 0%, #fdfdfa 6%, #fdfdfa 94%, #eeede8 100%)",
      }}
    >
      {/* thermal print is never quite black */}
      <div style={{ opacity: 0.88, filter: "blur(0.15px)" }}>
        <div className="text-center">
          <div
            className="font-bold tracking-[0.08em] uppercase"
            style={{ fontSize: u(17) }}
          >
            {store}
          </div>
          <div style={{ fontSize: u(10.5) }}>{address}</div>
        </div>
        <Rule />
        <Row l={`${L.order} #${code}`} r="" />
        <Row l={receipt.date} r="" />
        {info?.map(([k, v]) => <Row key={k} l={`${k}: ${v}`} r="" />)}
        <Rule />
        {items.map((it, i) => (
          <Row
            key={`${it.name}-${it.variant ?? ""}-${i}`}
            l={`${it.qty} x ${it.name}${it.variant ? ` (${it.variant})` : ""}`}
            r={money(it.qty * it.price)}
          />
        ))}
        <Rule />
        {taxRate > 0 && (
          <>
            <Row l={L.subtotal} r={money(total)} />
            <Row l={L.tax(Math.round(taxRate * 100))} r={money(tax)} />
            <div style={{ height: u(6) }} />
          </>
        )}
        <Row l={L.total} r={money(total + tax)} strong />
        <Rule />
        {qrValue ? (
          <div className="flex flex-col items-center" style={{ marginTop: u(6), gap: u(6) }}>
            <QRCodeSVG
              value={qrValue}
              level="M"
              marginSize={0}
              bgColor="transparent"
              fgColor="#262624"
              style={{ width: u(116), height: u(116) }}
            />
            <div className="text-center" style={{ fontSize: u(9.5) }}>
              {L.scan}
            </div>
          </div>
        ) : (
          <div
            className="flex items-stretch justify-center"
            style={{ height: u(46), gap: u(1.5), marginTop: u(6) }}
          >
            {bars.map((w, i) => (
              <span
                key={i}
                className="bg-[#262624]"
                style={{ width: u(w * 1.4), opacity: i % 5 === 0 ? 0.85 : 1 }}
              />
            ))}
          </div>
        )}
        <div
          className="text-center tracking-[0.3em]"
          style={{ fontSize: u(9.5), marginTop: u(4) }}
        >
          {code}
        </div>
        <div
          className="text-center font-bold tracking-[0.2em]"
          style={{ fontSize: u(12), marginTop: u(14) }}
        >
          {L.thanks}
        </div>
      </div>
      {/* the top end of the strip curls a touch */}
      {first && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{
            height: u(26),
            background:
              "linear-gradient(180deg, rgb(0 0 0 / 0.07), transparent)",
          }}
        />
      )}
    </div>
  );
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .4 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ---------------------------------------------------------------------------
 * Sound: tiny WebAudio synth, created on the first touch
 * ------------------------------------------------------------------------- */

let audio: AudioContext | null = null;
const ac = () => (audio ??= new AudioContext());
let master: GainNode | null = null;
let muted = false;
/** Where every sound goes: one gain node, so muting silences everything at once. */
const globalOut = () => {
  const c = ac();
  if (!master) {
    master = c.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(c.destination);
  }
  return master;
};
const setMuted = (m: boolean) => {
  muted = m;
  if (master) master.gain.value = m ? 0 : 1;
};

function tone(
  freq: number,
  dur: number,
  o: { type?: OscillatorType; gain?: number; at?: number; to?: number } = {},
) {
  const c = ac();
  const t = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.15, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(globalOut());
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(
  dur: number,
  o: {
    at?: number;
    gain?: number;
    freq?: number;
    type?: BiquadFilterType;
  } = {},
) {
  const c = ac();
  const t = c.currentTime + (o.at ?? 0);
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = o.type ?? "lowpass";
  f.frequency.value = o.freq ?? 800;
  const g = c.createGain();
  g.gain.setValueAtTime(o.gain ?? 0.3, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(globalOut());
  src.start(t);
}

const sfx = {
  unlock: () => void ac().resume(),
  button: () => {
    noise(0.02, { freq: 1300, type: "bandpass", gain: 0.6 });
    tone(230, 0.05, { gain: 0.08, to: 160 });
  },
  /**
   * The feed motor: a filtered sawtooth whine, chopped fast like a stepper advancing line by line,
   * with a little paper hiss on top. Fades in and out. Returns a stop for when the feed is cut short.
   */
  feed: (dur: number) => {
    const c = ac();
    const t = c.currentTime;
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.06, t + 0.06);
    out.gain.setValueAtTime(0.06, t + Math.max(0.07, dur - 0.1));
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(globalOut());

    const chop = c.createGain(); // swings 0.16..1 at the line rate
    chop.gain.value = 0.58;
    const lfo = c.createOscillator();
    lfo.type = "square";
    lfo.frequency.value = 34;
    const depth = c.createGain();
    depth.gain.value = 0.42;
    lfo.connect(depth).connect(chop.gain);
    chop.connect(out);

    const motor = c.createOscillator();
    motor.type = "sawtooth";
    motor.frequency.setValueAtTime(290, t);
    motor.frequency.linearRampToValueAtTime(320, t + dur);
    const body = c.createBiquadFilter();
    body.type = "bandpass";
    body.frequency.value = 1300;
    body.Q.value = 1.4;
    motor.connect(body).connect(chop);

    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const hiss = c.createBufferSource();
    hiss.buffer = buf;
    const air = c.createBiquadFilter();
    air.type = "bandpass";
    air.frequency.value = 5200;
    air.Q.value = 0.8;
    const hissGain = c.createGain();
    hissGain.gain.value = 0.35;
    hiss.connect(air).connect(hissGain).connect(chop);

    for (const n of [lfo, motor, hiss]) {
      n.start(t);
      n.stop(t + dur + 0.05);
    }
    return () => {
      const now = c.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), now);
      out.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    };
  },
  done: () => {
    tone(1568, 0.09, { gain: 0.03 });
    tone(2093, 0.14, { at: 0.08, gain: 0.025 });
  },
  /** Paper tearing across the serrated bar: a quick run of uneven crackles. */
  rip: () => {
    for (let i = 0; i < 12; i++)
      noise(0.018 + Math.random() * 0.02, {
        at: i * 0.02 + Math.random() * 0.01,
        freq: 2200 + Math.random() * 3000,
        type: "highpass",
        gain: 0.25 + Math.random() * 0.3,
      });
  },
  cut: () => {
    noise(0.04, { freq: 3000, type: "highpass", gain: 0.5 });
    tone(900, 0.04, { gain: 0.05 });
  },
};
