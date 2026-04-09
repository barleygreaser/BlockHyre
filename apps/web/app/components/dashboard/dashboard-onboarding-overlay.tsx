"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/app/context/auth-context";
import { usePathname } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowRight, Check, X, MousePointer2, Menu } from "lucide-react";
import { useDashboard } from "@/app/context/dashboard-context";

const POPOVER_WIDTH = 320;
const PADDING = 12;
const MAX_POLLING_ATTEMPTS = 15; // 15 × 200ms = 3s max

// ─────────────────────────────────────────────────────────────────────────────
// Step definitions
// mobileSkip: true  → skip this step entirely on small screens
// mobileStep: true  → ONLY show this step on small screens
// ─────────────────────────────────────────────────────────────────────────────
const RENTER_TOUR_STEPS_ALL = [
  {
    selector: 'aside.hidden.lg\\:flex [data-tour="renter-toggle"]',
    mobileSelector: null,
    mobileSkip: true,
    title: "Renter Mode",
    description:
      "Your default view. Manage the tools you are currently renting, pending requests, and track your history all in one place.",
    icon: null,
  },
  {
    selector: 'aside.hidden.lg\\:flex [data-tour="owner-toggle"]',
    mobileSelector: null,
    mobileSkip: true,
    title: "Owner Mode",
    description:
      "Click here to switch to the Dashboard. Manage your listed tools, approve bookings, and track your rental earnings instantly.",
    icon: null,
  },
  // Mobile-only replacement for the two steps above
  {
    selector: null,
    mobileSelector: '[data-tour="mobile-nav-trigger"]',
    mobileOnly: true,
    title: "Switch Modes Here",
    description:
      "Tap the hamburger menu icon highlighted above to open navigation. From there you can instantly switch between Renter and Owner mode.",
    icon: "menu",
  },
  {
    selector: '[data-tour="active-rentals-stat"]',
    mobileSelector: '[data-tour="active-rentals-stat"]',
    title: "Action Required Alerts",
    description:
      "Keep an eye on these indicators. We'll alert you here if any of your rentals are overdue or need attention today.",
    icon: null,
  },
  {
    selector: 'aside.hidden.lg\\:flex [data-tour="messages-link"]',
    mobileSelector: null,
    title: "Consolidated Inbox",
    description:
      "Rentals live and die in the DMs. All inquiries and negotiations with a specific neighbor happen in a single, persistent thread here in your Messages.",
    icon: null,
  },
  {
    selector: '[data-tour="find-tools-btn"]',
    mobileSelector: '[data-tour="find-tools-btn"]',
    title: "Browse Inventory",
    description:
      "Ready to build? Click here to find the tools you need in your neighborhood.",
    icon: null,
  },
] as const;

const OWNER_TOUR_STEPS_ALL = [
  {
    selector: 'aside.hidden.lg\\:flex [data-tour="owner-toggle"]',
    mobileSelector: null,
    mobileSkip: true,
    title: "Dashboard",
    description:
      "Welcome to the Owner view! This is your control room for managing rentals, tracking your earnings, and organizing your inventory.",
    icon: null,
  },
  {
    selector: null,
    mobileSelector: '[data-tour="mobile-nav-trigger"]',
    mobileOnly: true,
    title: "Command Center",
    description:
      "Welcome to the Owner view! Open the menu here to find your owner-specific links like My Fleet and Transactions.",
    icon: "menu",
  },
  {
    selector: 'aside.hidden.lg\\:flex [data-tour="transactions-link"]',
    mobileSelector: null,
    title: "Track Your Earnings",
    description:
      "Monitor your payouts and connect your bank account via Stripe to receive payments securely.",
    icon: null,
  },
  {
    selector: 'aside.hidden.lg\\:flex [data-tour="fleet-link"]',
    mobileSelector: null,
    title: "Manage Your Fleet",
    description:
      "Keep track of all your listed tools, update their availability, and adjust your daily pricing here.",
    icon: null,
  },
] as const;

type Step =
  | (typeof RENTER_TOUR_STEPS_ALL)[number]
  | (typeof OWNER_TOUR_STEPS_ALL)[number];

/** Filter step list based on the current viewport. */
function getStepsForViewport(role: "owner" | "renter"): Step[] {
  const isMobile = window.innerWidth < 1024;
  const steps = role === "owner" ? OWNER_TOUR_STEPS_ALL : RENTER_TOUR_STEPS_ALL;
  return steps.filter((step) => {
    if ("mobileSkip" in step && step.mobileSkip && isMobile) return false;
    if ("mobileOnly" in step && step.mobileOnly && !isMobile) return false;
    return true;
  });
}

/** Resolve the best visible DOM element for a tour step. Returns null for mobile-only steps that use bottom-sheet mode. */
function resolveElement(step: Step): HTMLElement | null {
  const isMobile = window.innerWidth < 1024;

  const primarySelector = isMobile
    ? "mobileSelector" in step
      ? step.mobileSelector
      : step.selector
    : step.selector;

  if (!primarySelector) return null; // mobile-only step — no spotlight needed

  let el = document.querySelector(primarySelector) as HTMLElement | null;

  // Last-resort: strip the aside prefix
  if ((!el || el.offsetWidth === 0) && "selector" in step && step.selector) {
    const stripped = step.selector.replace("aside.hidden.lg\\:flex ", "");
    const fallback = document.querySelector(stripped) as HTMLElement | null;
    el = fallback && fallback.offsetWidth > 0 ? fallback : null;
  }

  return el && el.offsetWidth > 0 ? el : null;
}

/** Calculate popover position for desktop — never overflows the viewport. */
function calcPopoverPosition(rect: DOMRect): { top: number; left: number } {
  const popoverWidth = Math.min(POPOVER_WIDTH, window.innerWidth - 32);
  // Use a safer estimated height since text can wrap and cause the element to grow downward.
  const estimatedHeight = 320;

  // If the element is flush to the left (like our sidebar links), we have room to render
  // the popover entirely to its right, side-by-side, avoiding any vertical collision.
  if (
    rect.left < 40 &&
    rect.right + PADDING + popoverWidth < window.innerWidth
  ) {
    const left = rect.right + PADDING;
    // Vertically align it roughly with the item, clamping so it doesn't bleed off screen
    const top = Math.max(
      16,
      Math.min(rect.top - PADDING, window.innerHeight - estimatedHeight - 16),
    );
    return { top, left };
  }

  const spaceBelow = window.innerHeight - rect.bottom - PADDING;
  const spaceAbove = rect.top - PADDING;

  const top =
    spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove
      ? rect.bottom + PADDING
      : Math.max(16, rect.top - PADDING - estimatedHeight);

  const left = Math.max(
    16,
    Math.min(rect.left, window.innerWidth - popoverWidth - 16),
  );

  return { top, left };
}

// ─────────────────────────────────────────────────────────────────────────────
export function DashboardOnboardingOverlay() {
  const { user, userProfile, userProfileLoading } = useAuth();
  const { activeRole } = useDashboard();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tourSteps, setTourSteps] = useState<Step[]>([]);
  const rafRef = useRef<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Initialise viewport-aware step list
  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 1024);
      setTourSteps(getStepsForViewport(activeRole));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeRole]);

  // ── Polling: wait for first step element to appear in DOM ──
  useEffect(() => {
    if (!pathname?.includes("/dashboard")) {
      setIsOpen(false);
      return;
    }
    if (userProfileLoading || !user || !userProfile?.neighborhoodId) return;

    const storageKey =
      activeRole === "owner"
        ? "blockhyre_owner_onboarding_v1"
        : "blockhyre_dashboard_onboarding_v1";
    const hasSeen = localStorage.getItem(storageKey);
    if (hasSeen) return;

    let attempts = 0;
    const interval = setInterval(() => {
      const steps = getStepsForViewport(activeRole);
      if (!steps.length) return;

      const firstStep = steps[0];
      const el = resolveElement(firstStep);
      // For mobile-only steps that have no element, we still open immediately
      const noElementNeeded =
        !("selector" in firstStep && firstStep.selector) &&
        !("mobileSelector" in firstStep && firstStep.mobileSelector);

      if (el || noElementNeeded || attempts >= MAX_POLLING_ATTEMPTS) {
        clearInterval(interval);
        setTourSteps(steps);
        setStepIndex(0);
        setIsOpen(true);
      }
      attempts++;
    }, 200);

    return () => clearInterval(interval);
  }, [pathname, user, userProfile, userProfileLoading, activeRole]);

  // ── Core rect measurement ──
  const updateTarget = useCallback(() => {
    if (!isOpen || !tourSteps.length) return;
    const step = tourSteps[stepIndex];
    if (!step) return;

    const el = resolveElement(step);

    if (el) {
      const rect = el.getBoundingClientRect();
      // Treat as offscreen only when genuinely scrolled out of view.
      // Exclude fixed/sticky elements at the top of the viewport (top < 10)
      // since scrollIntoView on position:fixed elements is a no-op and
      // causes confusing state.
      const isFixedAtTop = rect.top < 10 && rect.top >= 0;
      const isOffscreen =
        !isFixedAtTop &&
        (rect.bottom > window.innerHeight - 80 || rect.top < 80);
      if (isOffscreen) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setTargetRect(el.getBoundingClientRect()), 420);
      } else {
        setTargetRect(rect);
      }
    } else {
      // No element to highlight (mobile-only step) — clear spotlight
      setTargetRect(null);
    }
  }, [isOpen, stepIndex, tourSteps]);

  // ── isMounted gate: allows opacity-0 to paint before transitioning ──
  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => setIsMounted(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  // ── rAF-throttled resize/scroll + keyboard navigation ──
  // stepIndex in deps ensures handleKeyDown never sees a stale closure
  useEffect(() => {
    if (!isOpen) return;

    const throttledUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateTarget);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleComplete();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("resize", throttledUpdate);
    window.addEventListener("scroll", throttledUpdate, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    throttledUpdate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", throttledUpdate);
      window.removeEventListener("scroll", throttledUpdate);
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, updateTarget, stepIndex]);

  // ── Focus trap: auto-focus popover when step changes ──
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      const first = popoverRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }
  }, [isOpen, stepIndex]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const storageKey =
      activeRole === "owner"
        ? "blockhyre_owner_onboarding_v1"
        : "blockhyre_dashboard_onboarding_v1";
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen || tourSteps.length === 0) return null;

  const currentStep = tourSteps[stepIndex];

  // Spotlight rect — null when no element exists for this step
  const rect =
    targetRect ??
    (isMobile
      ? null
      : new DOMRect(
          window.innerWidth / 2 - 50,
          window.innerHeight / 2 - 25,
          100,
          50,
        ));

  // Desktop: floating popover anchored to element. Mobile: bottom sheet.
  const desktopPos = rect ? calcPopoverPosition(rect) : { top: 0, left: 0 };
  const popoverWidth = Math.min(POPOVER_WIDTH, window.innerWidth - 32);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Onboarding tour — step ${stepIndex + 1} of ${tourSteps.length}: ${currentStep.title}`}
    >
      {/* Backdrop — neutral click-blocker, fades in */}
      <div
        className={`absolute inset-0 cursor-default transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
      />

      {/* ── Spotlight: box-shadow mask + ring (only when element exists) ── */}
      {rect ? (
        <>
          {/* Single-div overlay: massive outward box-shadow leaves a perfectly rounded hole */}
          <div
            className={`absolute rounded-xl pointer-events-none transition-all duration-500 ease-in-out ${isMounted ? "opacity-100" : "opacity-0"}`}
            style={{
              top: rect.top - PADDING,
              left: rect.left - PADDING,
              width: rect.width + PADDING * 2,
              height: rect.height + PADDING * 2,
              boxShadow: "0 0 0 9999px rgba(15,23,42,0.8)",
            }}
          />
          {/* Pulsing orange ring — same dimensions, layered on top */}
          <div
            className={`absolute border-2 border-safety-orange rounded-xl pointer-events-none transition-all duration-500 ease-in-out ${isMounted ? "opacity-100 animate-pulse" : "opacity-0"}`}
            style={{
              top: rect.top - PADDING,
              left: rect.left - PADDING,
              width: rect.width + PADDING * 2,
              height: rect.height + PADDING * 2,
              boxShadow: "0 0 20px rgba(255,102,0,0.4)",
            }}
          />
        </>
      ) : (
        /* No element to highlight (mobile-only step) — plain full-screen overlay */
        <div
          className={`absolute inset-0 bg-slate-900/80 transition-opacity duration-500 pointer-events-none ${isMounted ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {/* ── DESKTOP: Floating popover anchored to element ── */}
      {!isMobile && (
        <div
          ref={popoverRef}
          className={`absolute bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-out z-[110] ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
          style={{
            top: desktopPos.top,
            left: desktopPos.left,
            width: popoverWidth,
          }}
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const focusable = popoverRef.current?.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (!focusable || focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          <PopoverContent
            step={currentStep}
            stepIndex={stepIndex}
            total={tourSteps.length}
            onNext={handleNext}
            onComplete={handleComplete}
            isMobile={false}
          />
        </div>
      )}

      {/* ── MOBILE: Bottom sheet ── */}
      {isMobile && (
        <div
          ref={popoverRef}
          className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[110] transition-all duration-500 ease-out ${isMounted ? "opacity-100 translate-y-0" : "opacity-100 translate-y-full"}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const focusable = popoverRef.current?.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (!focusable || focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>
          <PopoverContent
            step={currentStep}
            stepIndex={stepIndex}
            total={tourSteps.length}
            onNext={handleNext}
            onComplete={handleComplete}
            isMobile={true}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared popover body — renders identically in floating + bottom-sheet modes
// ─────────────────────────────────────────────────────────────────────────────
function PopoverContent({
  step,
  stepIndex,
  total,
  onNext,
  onComplete,
  isMobile,
}: {
  step: Step;
  stepIndex: number;
  total: number;
  onNext: () => void;
  onComplete: () => void;
  isMobile: boolean;
}) {
  return (
    <>
      {/* Step progress bar */}
      <div className="flex w-full h-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 transition-colors duration-300 ${i <= stepIndex ? "bg-safety-orange" : "bg-slate-100"} ${i < total - 1 ? "border-r border-white" : ""}`}
          />
        ))}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {"icon" in step && step.icon === "menu" ? (
              <Menu className="w-4 h-4 text-safety-orange" />
            ) : (
              <MousePointer2 className="w-4 h-4 text-safety-orange" />
            )}
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
              Step {stepIndex + 1} of {total}
            </span>
          </div>
          <button
            onClick={onComplete}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold font-serif text-slate-900 mb-2">
          {step.title}
        </h3>

        {/* Visual cue for the mobile-only "switch modes" step */}
        {"icon" in step && step.icon === "menu" && isMobile && (
          <div className="flex items-center gap-3 mb-4 px-3 py-2.5 bg-safety-orange/10 border border-safety-orange/30 rounded-xl">
            <div className="flex flex-col items-center animate-bounce text-safety-orange shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
            <p className="text-xs font-bold text-safety-orange font-mono uppercase tracking-wider">
              That button — top left corner
            </p>
          </div>
        )}

        <p className="text-sm font-sans text-slate-600 leading-relaxed mb-6 min-h-[3.5rem]">
          {step.description}
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="text-xs font-bold uppercase tracking-wider h-10"
            onClick={onComplete}
          >
            Skip
          </Button>
          <Button
            className="flex-1 bg-safety-orange hover:bg-safety-orange/90 text-white text-xs font-bold uppercase tracking-wider h-10"
            onClick={onNext}
          >
            {stepIndex < total - 1 ? (
              <>
                Next <ArrowRight className="ml-2 w-3 h-3" />
              </>
            ) : (
              <>
                Finish <Check className="ml-2 w-3 h-3" />
              </>
            )}
          </Button>
        </div>

        {/* Contextual hint — keyboard on desktop, tap on mobile */}
        <p className="text-center text-[10px] text-slate-300 font-mono mt-3">
          {isMobile ? (
            "Tap Next to continue the tour"
          ) : (
            <>
              Press{" "}
              <kbd className="bg-slate-100 text-slate-500 px-1 rounded">↵</kbd>{" "}
              to advance ·{" "}
              <kbd className="bg-slate-100 text-slate-500 px-1 rounded">
                Esc
              </kbd>{" "}
              to skip
            </>
          )}
        </p>
      </div>
    </>
  );
}
