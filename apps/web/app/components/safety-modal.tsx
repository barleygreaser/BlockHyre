import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SafetyModal({ isOpen, onClose }: SafetyModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-safety-orange mb-1">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Safety First</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white font-serif">Safety Check Required</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Please confirm the following to proceed with your rental.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">

                    <label className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        checks.manual ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                    )}>
                        <div className={cn(
                            "mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                            checks.manual ? "bg-green-500 border-green-500 text-white" : "border-slate-300 bg-white"
                        )}>
                            {checks.manual && <CheckCircle className="h-3.5 w-3.5" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={checks.manual}
                            onChange={() => toggleCheck('manual')}
                        />
                        <div>
                            <span className="font-semibold text-slate-900 block">I have read the Safety Manual</span>
                            <span className="text-xs text-slate-500">Confirm you understand the operating procedures.</span>
                        </div>
                    </label>

                    <label className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        checks.waiver ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                    )}>
                        <div className={cn(
                            "mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                            checks.waiver ? "bg-green-500 border-green-500 text-white" : "border-slate-300 bg-white"
                        )}>
                            {checks.waiver && <CheckCircle className="h-3.5 w-3.5" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={checks.waiver}
                            onChange={() => toggleCheck('waiver')}
                        />
                        <div>
                            <span className="font-semibold text-slate-900 block">Liability Waiver & Assumption of Risk</span>
                            <span className="text-xs text-slate-500">You accept full responsibility for safe operation.</span>
                        </div>
                    </label>

                    <label className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        checks.inspection ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                    )}>
                        <div className={cn(
                            "mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                            checks.inspection ? "bg-green-500 border-green-500 text-white" : "border-slate-300 bg-white"
                        )}>
                            {checks.inspection && <CheckCircle className="h-3.5 w-3.5" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={checks.inspection}
                            onChange={() => toggleCheck('inspection')}
                        />
                        <div>
                            <span className="font-semibold text-slate-900 block">Pre-Rental Photo Inspection</span>
                            <span className="text-xs text-slate-500">Agree to document tool condition before use.</span>
                        </div>
                    </label>

                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        disabled={!allChecked}
                        className={cn(
                            "transition-all duration-300",
                            allChecked ? "bg-safety-orange hover:bg-safety-orange/90" : "bg-slate-300 text-slate-500"
                        )}
                    >
                        Proceed to Payment
                    </Button>
                </div>
            </div>
        </div>
    );
}
