import type { MantineSize, StyleProp } from "@mantine/core";
import { Box } from "@mantine/core";
import { Calendar as MantineCalendar } from "@mantine/dates";
import dayjs from "dayjs";
import type { CSSProperties } from "react";
import { memo, useEffect, useState } from "react";

import { colorsMantine } from "~/constants/colorsMantine";

type T_Calendar = {
  activeDay: Date | null;
  allowDeselect?: boolean;
  availableDays?: string[];
  h?: StyleProp<CSSProperties["height"]>;
  maxDate?: Date;
  onChange?: (date: Date | null) => void;
  onMonthYearChange?: (date: Date) => void;
  requireConfirmDays?: string[];
  size?: MantineSize;
};

const CalendarToMemoize = ({
  activeDay,
  allowDeselect = false,
  availableDays,
  h = 345,
  maxDate,
  onChange,
  onMonthYearChange,
  requireConfirmDays,
  size = "md",
}: T_Calendar) => {
  const [date, setDate] = useState(new Date());
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (activeDay) {
      setDate(activeDay);
    }
  }, [activeDay]);

  const handleSelect = (date: Date) => {
    const isSelected = dayjs(date).isSame(activeDay, "date");
    const newValue = (() => {
      if (!allowDeselect) {
        return date;
      }
      return isSelected ? null : date;
    })();
    onChange?.(newValue);
  };

  const handleDateChange = (newDate: string) => {
    if (isBlocked) {
      return;
    }

    setDate(new Date(newDate));
    onMonthYearChange?.(new Date(newDate));
    setIsBlocked(true);

    setTimeout(() => {
      setIsBlocked(false);
    }, 1000);
  };

  return (
    <Box h={h}>
      <MantineCalendar
        date={date}
        getDayProps={date => {
          const currentDate = dayjs(date);
          const formattedDate = currentDate.format("YYYY-MM-DD");
          const isSelectedDay = currentDate.isSame(activeDay, "date");
          const isDayInAvailableDays = availableDays?.includes(formattedDate);

          const isDayInRequireConfirmDays =
            requireConfirmDays?.includes(formattedDate);

          const bg = (() => {
            if (!isSelectedDay) {
              return `light-dark(${colorsMantine.white0}, ${colorsMantine.background})`;
            }
            if (isDayInAvailableDays) {
              if (isDayInRequireConfirmDays) {
                return "indigo";
              }
              return "grape";
            }
            return "gray";
          })();

          const c = (() => {
            if (isSelectedDay) {
              return "white";
            }
            if (isDayInAvailableDays) {
              if (isDayInRequireConfirmDays) {
                return "indigo";
              }
              return "grape";
            }
            if ((availableDays ?? []).length > 0) {
              return "gray";
            }
            return "inherit";
          })();

          return {
            bg,
            c,
            fw: isDayInAvailableDays ? "bold" : "normal",
            onClick: () => handleSelect(new Date(date)),
            selected: isSelectedDay,
          };
        }}
        hideOutsideDates
        highlightToday
        maxDate={maxDate}
        minDate={dayjs().toDate()}
        onMonthSelect={handleDateChange}
        onNextMonth={handleDateChange}
        onNextYear={handleDateChange}
        onPreviousMonth={handleDateChange}
        onPreviousYear={handleDateChange}
        size={size}
      />
    </Box>
  );
};

export const Calendar = memo(CalendarToMemoize);
