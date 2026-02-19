"use client";

import { memo } from "react";
import { Calendar } from "@/app/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface ListingCalendarProps {
    /** Array of specific dates that should be disabled/blocked */
    unavailableDates: Date[];
    /** The currently selected date range */
    dateRange: DateRange | undefined;
    /** Callback when date range changes */
    onDateRangeChange: (range: DateRange | undefined) => void;
    /** Earliest selectable date. Defaults to today. */
    minDate?: Date | null;
    className?: string;
}

export const ListingCalendar = memo(function ListingCalendar({
    unavailableDates,
    dateRange,
    onDateRangeChange,
    minDate = new Date(),
    className
}: ListingCalendarProps) {
    return (
        <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            blockedDates={unavailableDates}
            minDate={minDate}
            numberOfMonths={1}
            className={cn("w-full mx-auto", className)}
        />
    );
});
