window.validateLeave = function (leaveType, startDateStr, endDateStr, holidays, appliedDates = [], specialDates = []) {
    if (leaveType !== "My day" && leaveType !== "Compensatory off" && leaveType !== "Personal Time Off") {
        return { valid: true };
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDS = (date) => date.toISOString().split('T')[0];

    const isWeekday = (date) => {
        const day = date.getDay();
        return day >= 1 && day <= 5;
    };

    const isHoliday = (date) => {
        const dateStr = getDS(date);
        return holidays.some(h => (h.date === dateStr || h.dateStr === dateStr));
    };

    const isAlreadyApplied = (date) => {
        const dateStr = getDS(date);
        return appliedDates.some(applied => {
            let aCurrent = new Date(applied.start);
            let aEnd = new Date(applied.end);
            while (aCurrent <= aEnd) {
                if (getDS(aCurrent) === dateStr) return true;
                aCurrent.setDate(aCurrent.getDate() + 1);
            }
            return false;
        });
    };

    const isSpecialDate = (date) => {
        const dateStr = getDS(date);
        return specialDates.some(s => s.date === dateStr);
    };

    const minDate = new Date(today);
    minDate.setMonth(today.getMonth() - 2);

    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 5);

    let current = new Date(start);
    let daysCount = 0;

    while (current <= end) {
        if (leaveType === "My day") {
            if (!isSpecialDate(current)) {
                return {
                    valid: false,
                    message: `My Day off can ONLY be applied on special dates (Birthday or Anniversary).`
                };
            }
        }

        if (!isWeekday(current)) {
            return {
                valid: false,
                message: `${current.toDateString()} is a weekend. Leave can only be applied for weekdays.`
            };
        }

        if (isHoliday(current)) {
            return {
                valid: false,
                message: `${current.toDateString()} is a holiday.`
            };
        }

        if (isAlreadyApplied(current)) {
            return {
                valid: false,
                message: `You have already applied for leave on ${current.toDateString()}.`
            };
        }

        if (current < minDate || current > maxDate) {
            return {
                valid: false,
                message: `Leave can only be applied within the past 2 months and up to 5 months in the future.`
            };
        }

        daysCount++;
        current.setDate(current.getDate() + 1);
    }

    return { valid: true, daysCount: daysCount };
};
