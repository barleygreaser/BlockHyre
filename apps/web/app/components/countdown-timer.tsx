"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CountdownTimerProps {
    createdAt: string;
    className?: string;
}

export function CountdownTimer({ createdAt, className = "" }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const created = new Date(createdAt);
            const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24 hours
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeRemaining("Expired");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <div className={`flex items-center gap-1.5 ${isExpired ? "text-red-600" : "text-amber-600"} ${className}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm font-bold">{timeRemaining}</span>
        </div>
    );
}
