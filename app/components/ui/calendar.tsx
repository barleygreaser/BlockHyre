"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import Datepicker from "./datepicker-src";
import { DateValueType } from "./datepicker-src/types";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    blockedDates?: Date[];
    selected?: any;
    onSelect?: any;
    orientation?: "vertical" | "horizontal";
    minDate?: Date | null;
}

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    blockedDates = [],
    mode,
    selected,
    onSelect,
    orientation = "horizontal",
    ...props
}: CalendarProps) {

    const handleDateChange = (newValue: DateValueType) => {
        if (!onSelect || !newValue?.startDate || !newValue?.endDate) {
            // If we don't have a full range or callback, just bail or pass simple updates
            if (onSelect && newValue?.startDate) {
                // specific handling if you allow single date selection, otherwise ignore
            }
            return;
        }

        const start = new Date(newValue.startDate);
        const end = new Date(newValue.endDate);

        // --- 🛡️ COLLISION DETECTION LOGIC ---
        // Check if ANY blocked date falls inside the selected range
        const hasCollision = blockedDates.some((blockedDate) => {
            const blocked = new Date(blockedDate);
            // Normalize times to ensure fair comparison (set all to midnight)
            blocked.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            // Logic: Is the blocked date strictly greater than Start AND strictly less than End?
            // (If blocked date == start or end, the UI usually prevents clicking it anyway, 
            // but this covers the "tunneling" issue).
            return blocked > start && blocked < end;
        });

        if (hasCollision) {
            // ❌ Invalid selection: Range includes blocked dates.
            // Option A: Do nothing (user clicks, nothing happens)
            // Option B: Show a toast/alert (Recommended)
            alert("The selected range includes dates that are already booked.");
            return;
        }

        // ✅ Valid selection
        // @ts-ignore - Adapting types between libraries
        onSelect({
            from: newValue.startDate,
            to: newValue.endDate
        });
    };

    const value = {
        // @ts-ignore
        startDate: selected?.from || null,
        // @ts-ignore
        endDate: selected?.to || null
    };

    return (
        <div className={className}>
            <Datepicker
                useRange={mode === "range"}
                value={value}
                onChange={handleDateChange}
                inline={true}
                showFooter={false}
                showShortcuts={false}
                orientation={orientation}
                // @ts-ignore
                disabledDates={blockedDates.map(d => ({ startDate: d, endDate: d }))}
                primaryColor={"orange"}
                asSingle={false}
                numberOfMonths={1}
                minDate={props.minDate}
            />
        </div>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
