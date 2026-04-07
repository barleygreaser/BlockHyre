import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, CheckSquare, Square, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-eerie-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-signal-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-opal/20">

                {/* Industrial Header */}
                <div className="bg-eerie-black p-8 flex justify-between items-center shrink-0 border-b-4 border-safety-orange">
                    <div className="flex gap-4 items-center">
                        <div className="h-14 w-14 rounded-2xl bg-safety-orange/10 border border-safety-orange/30 flex items-center justify-center">
                            <ShieldAlert className="h-7 w-7 text-safety-orange" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-signal-white font-display uppercase tracking-tighter">SAFETY CLEARANCE REQUIRED</h2>
                            <p className="text-signal-white/60 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">HIGH-POWER TIER 3 EQUIPMENT DETECTED</p>
                        </div>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="p-10 space-y-6">
                    <p className="text-sm font-serif text-slate-700 leading-relaxed mb-6">
                        You are requesting a Tier 3 / High-Power item. To release the security lock and proceed to checkout, you must acknowledge the following operational protocols.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => toggleCheck('manual')}
                            className={cn(
                                "w-full text-left flex items-start gap-4 p-5 border-2 transition-all",
                                checks.manual ? "border-safety-orange bg-safety-orange/5" : "border-[#333333] hover:border-safety-orange/30"
                            )}>
                            <div className="mt-0.5 shrink-0">
                                {checks.manual ? (
                                    <CheckSquare className="h-6 w-6 text-safety-orange" />
                                ) : (
                                    <Square className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 font-mono tracking-widest text-xs uppercase block">MANUAL VERIFICATION</span>
                                <span className="text-xs font-serif text-slate-600 mt-1 block">I confirm I understand the operating procedures and safety constraints of this equipment.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => toggleCheck('waiver')}
                            className={cn(
                                "w-full text-left flex items-start gap-4 p-5 border-2 transition-all",
                                checks.waiver ? "border-safety-orange bg-safety-orange/5" : "border-[#333333] hover:border-safety-orange/30"
                            )}>
                            <div className="mt-0.5 shrink-0">
                                {checks.waiver ? (
                                    <CheckSquare className="h-6 w-6 text-safety-orange" />
                                ) : (
                                    <Square className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 font-mono tracking-widest text-xs uppercase block">LIABILITY WAIVER</span>
                                <span className="text-xs font-serif text-slate-600 mt-1 block">I accept full responsibility for safe operation and assume all risks associated with use.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => toggleCheck('inspection')}
                            className={cn(
                                "w-full text-left flex items-start gap-4 p-5 border-2 transition-all",
                                checks.inspection ? "border-safety-orange bg-safety-orange/5" : "border-[#333333] hover:border-safety-orange/30"
                            )}>
                            <div className="mt-0.5 shrink-0">
                                {checks.inspection ? (
                                    <CheckSquare className="h-6 w-6 text-safety-orange" />
                                ) : (
                                    <Square className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 font-mono tracking-widest text-xs uppercase block">CONDITION PROTOCOL</span>
                                <span className="text-xs font-serif text-slate-600 mt-1 block">I agree to submit required photographic condition reports before unlocking the tool.</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* High-Performance Footer */}
                <div className="p-10 bg-opal/5 border-t border-opal/10 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="group font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors font-bold mr-auto"
                    >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">[</span> 
                        CANCEL CHECKOUT 
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">]</span>
                    </button>

                    <Button
                        onClick={() => {
                            if (allChecked) {
                                onConfirm();
                            }
                        }}
                        disabled={!allChecked}
                        className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold h-12 rounded-none px-8 transition-all duration-200 shadow-[0_4px_0_0_#AF3D2B] hover:shadow-[0_6px_0_0_#AF3D2B] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none w-full sm:w-auto"
                    >
                        ACKNOWLEDGE & PROCEED
                    </Button>
                </div>
            </div>
        </div>
    );
}

