import { darkTheme } from "./constants";

export interface CalendarDate {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isBooked?: boolean;
  isBlocked?: boolean;
}

export interface DateRange {
  start: string | null;
  end: string | null;
}

export type CalendarMode = "date" | "month" | "year" | "month-year" | "time";

export interface CalendarConfig {
  mode: CalendarMode;
  title: string;
  format: string;
  viewMode: "day" | "month" | "year";
}
export interface CalendarViewProps {
  initialDate?: string;
  initialMode?: CalendarMode;
  enableRangeMode?: boolean;
  showModeSelector?: boolean;
  showRangeToggle?: boolean;
  theme?: Partial<typeof darkTheme>;
  onDateSelect?: (date: string) => void;
  onRangeSelect?: (range: DateRange) => void;
  onTimeSelect?: (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => void;
  onModeChange?: (mode: CalendarMode) => void;
  dateFormat?: string;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  bookedDates?: string[];
  blockedDates?: string[];
  renderTrigger?: (params: {
    selectedValue: string;
    onPress: () => void;
    isRangeMode: boolean;
  }) => React.ReactNode;
  hideTrigger?: boolean;
  sheetSizes?: (string | number)[];
  inline?: boolean;
}

export interface CalendarViewRef {
  open: () => void;
  close: () => void;
  reset: () => void;
  goToToday: () => void;
  getValue: () => string | DateRange;
  setDate: (date: string) => void;
  setRange: (range: DateRange) => void;
}
