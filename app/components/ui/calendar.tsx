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

    // Map DayPicker props to Datepicker props
    const handleDateChange = (newValue: DateValueType) => {
        if (onSelect && newValue) {
            // @ts-ignore - Adapting types between libraries
            onSelect({
                from: newValue.startDate,
                to: newValue.endDate
            });
        }
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
                asSingle={false} // Ensure it's range mode
                numberOfMonths={1} // Pass this new prop
            />
        </div>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
