import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckSquare, Square, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
}

export function SafetyModal({ isOpen, onClose, onConfirm }: SafetyModalProps) {
    const [checks, setChecks] = useState({
        manual: false,
        waiver: false,
        inspection: false,
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setChecks({
                manual: false,
                waiver: false,
                inspection: false,
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const allChecked = Object.values(checks).every(Boolean);

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-charcoal/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-signal-white rounded-card md:rounded-boutique shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-slate-200/80">

                {/* Industrial Header */}
                <div className="bg-midnight-navy p-6 md:p-8 flex justify-between items-center shrink-0 border-b-4 border-safety-orange">
                    <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-interactive bg-safety-orange/15 border border-safety-orange/30 flex items-center justify-center">
                            <ShieldAlert className="h-6 w-6 text-safety-orange" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-signal-white font-display uppercase tracking-tight">SAFETY CLEARANCE REQUIRED</h2>
                            <p className="text-signal-white/70 text-2xs font-mono font-bold uppercase tracking-industrial mt-1">HIGH-POWER TIER 3 EQUIPMENT DETECTED</p>
                        </div>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="p-6 md:p-8 space-y-5">
                    <p className="text-sm font-sans text-slate-700 leading-relaxed mb-4">
                        You are requesting a Tier 3 / High-Power item. To release the security lock and proceed to checkout, you must acknowledge the following operational protocols.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => toggleCheck('manual')}
                            className={cn("w-full text-left flex items-start gap-4 p-4 md:p-5 rounded-interactive border-2 transition-all", checks.manual ? "border-safety-orange bg-safety-orange/5" : "border-slate-200 hover:border-safety-orange/30")}>
                            <div className="mt-0.5 shrink-0">
                                {checks.manual ? (
                                    <CheckSquare className="h-6 w-6 text-safety-orange" />
                                ) : (
                                    <Square className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 font-mono tracking-industrial text-xs uppercase block">MANUAL VERIFICATION</span>
                                <span className="text-xs font-sans text-slate-600 mt-1 block">I confirm I understand the operating procedures and safety constraints of this equipment.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => toggleCheck('waiver')}
                            className={cn("w-full text-left flex items-start gap-4 p-4 md:p-5 rounded-interactive border-2 transition-all", checks.waiver ? "border-safety-orange bg-safety-orange/5" : "border-slate-200 hover:border-safety-orange/30")}>
                            <div className="mt-0.5 shrink-0">
                                {checks.waiver ? (
                                    <CheckSquare className="h-6 w-6 text-safety-orange" />
                                ) : (
                                    <Square className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 font-mono tracking-industrial text-xs uppercase block">LIABILITY WAIVER</span>
                                <span className="text-xs font-sans text-slate-600 mt-1 block">I accept full responsibility for safe operation and assume all risks associated with use.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => toggleCheck('inspection')}
                            className={cn("w-full text-left flex items-start gap-4 p-4 md:p-5 rounded-interactive border-2 transition-all", checks.inspection ? "border-safety-orange bg-safety-orange/5" : "border-slate-200 hover:border-safety-orange/30")}>
                            <div className="mt-0.5 shrink-0">
                                {checks.inspection ? (
                                    <CheckSquare className="h-6 w-6 text-safety-orange" />
                                ) : (
                                    <Square className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 font-mono tracking-industrial text-xs uppercase block">CONDITION PROTOCOL</span>
                                <span className="text-xs font-sans text-slate-600 mt-1 block">I agree to submit required photographic condition reports before unlocking the tool.</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* High-Performance Footer */}
                <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="group font-mono text-xs uppercase tracking-industrial text-slate-500 hover:text-slate-900 transition-colors font-bold mr-auto"
                    >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">[</span> 
                        CANCEL CHECKOUT 
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">]</span>
                    </button>

                    <Button
                        variant="urgent"
                        onClick={() => {
                            if (allChecked) {
                                if (onConfirm) onConfirm();
                                else onClose();
                            }
                        }}
                        disabled={!allChecked}
                        className="h-12 rounded-interactive font-bold px-8 active:translate-y-0.5 w-full sm:w-auto"
                    >
                        ACKNOWLEDGE & PROCEED
                    </Button>
                </div>
            </div>
        </div>
    );
}

