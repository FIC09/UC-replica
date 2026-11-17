/**
 * Dynamic Service Slot and Date Generator for Urban Company Checkout
 * 
 * Guarantees exactly 3 active dates:
 * - When today is active: Day 0 (Today, e.g. 24 Oct), Day 1 (Tomorrow, 25 Oct), Day 2 (DayName, 26 Oct) -> 24, 25, 26
 * - When today is completed (past 18:30 or midnight rollover): Day 1 (25 Oct), Day 2 (26 Oct), Day 3 (27 Oct) -> 25, 26, 27
 * Automatically stays synchronized with real-time clock.
 */

export const SERVICE_TIME_SLOTS = [
  { id: '08-09', label: '08:00 AM - 09:00 AM', period: 'Morning', startHour: 8, startMinute: 0 },
  { id: '09-10', label: '09:00 AM - 10:00 AM', period: 'Morning', startHour: 9, startMinute: 0 },
  { id: '10-11', label: '10:00 AM - 11:00 AM', period: 'Morning', startHour: 10, startMinute: 0 },
  { id: '11-12', label: '11:00 AM - 12:00 PM', period: 'Morning', startHour: 11, startMinute: 0 },
  { id: '12-13', label: '12:00 PM - 01:00 PM', period: 'Afternoon', startHour: 12, startMinute: 0 },
  { id: '13-14', label: '01:00 PM - 02:00 PM', period: 'Afternoon', startHour: 13, startMinute: 0 },
  { id: '14-15', label: '02:00 PM - 03:00 PM', period: 'Afternoon', startHour: 14, startMinute: 0 },
  { id: '15-16', label: '03:00 PM - 04:00 PM', period: 'Afternoon', startHour: 15, startMinute: 0 },
  { id: '16-17', label: '04:00 PM - 05:00 PM', period: 'Evening', startHour: 16, startMinute: 0 },
  { id: '17-18', label: '05:00 PM - 06:00 PM', period: 'Evening', startHour: 17, startMinute: 0 },
  { id: '18-19', label: '06:30 PM - 07:30 PM', period: 'Evening', startHour: 18, startMinute: 30 },
  { id: '19-20', label: '07:30 PM - 08:30 PM', period: 'Evening', startHour: 19, startMinute: 30 },
  { id: '20-21', label: '08:30 PM - 09:30 PM', period: 'Night', startHour: 20, startMinute: 30 }
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns whether all service slots for today have completed (past 20:30 / 8:30 PM cutoff)
 */
export function isTodayServiceCompleted(now = new Date()) {
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  // Cutoff is 20:30 (8:30 PM), the start of the final service slot for the day
  return currentHour > 20 || (currentHour === 20 && currentMinute >= 30);
}

/**
 * Returns available service dates dynamically based on current time (up to 30 days / full month)
 */
export function getAvailableServiceDates(baseDate = new Date(), daysCount = 30) {
  const now = new Date(baseDate);
  const completedToday = isTodayServiceCompleted(now);
  const startOffset = completedToday ? 1 : 0;

  const dates = [];
  for (let i = 0; i < daysCount; i++) {
    const offset = startOffset + i;
    const target = new Date(now);
    target.setDate(now.getDate() + offset);

    const dayNum = target.getDate();
    const month = MONTH_NAMES[target.getMonth()];
    const dayOfWeek = DAY_NAMES[target.getDay()];

    let prefix = '';
    if (offset === 0) {
      prefix = 'Today';
    } else if (offset === 1) {
      prefix = 'Tomorrow';
    } else {
      prefix = dayOfWeek;
    }

    const label = `${prefix} (${dayNum} ${month})`;

    dates.push({
      label,
      prefix,
      sub: `${dayNum} ${month}`,
      dayNum,
      month,
      dayOfWeek,
      isToday: offset === 0,
      offset,
      dateObj: target
    });
  }

  return dates;
}

/**
 * Checks if a specific slot is in the past for today
 */
export function isSlotPassed(slotLabel, isToday = false, now = new Date()) {
  if (!isToday) return false;
  const slot = SERVICE_TIME_SLOTS.find(s => s.label === slotLabel);
  if (slot) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > slot.startHour) return true;
    if (currentHour === slot.startHour && currentMinute >= slot.startMinute) return true;
    return false;
  }

  // Handle custom manual time selection (e.g. "05:15 PM" or "05:15 PM - 06:15 PM")
  if (typeof slotLabel === 'string') {
    const match = slotLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = (match[3] || '').toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (currentHour > h) return true;
      if (currentHour === h && currentMinute >= m) return true;
    }
  }
  return false;
}

/**
 * Returns the first available time slot for a selected date
 */
export function getFirstAvailableSlot(isToday = false, now = new Date()) {
  for (const slot of SERVICE_TIME_SLOTS) {
    if (!isSlotPassed(slot.label, isToday, now)) {
      return slot.label;
    }
  }
  return SERVICE_TIME_SLOTS[0].label;
}

/**
 * Parses and dynamically formats a booking slot to reflect real-time date and day of week.
 * Prevents stale 'Today' / 'Tomorrow' labels from being shown for past days.
 *
 * @param {string} slot - The raw slot string (e.g. 'Tomorrow (1 Nov), 10:00 AM - 11:00 AM')
 * @param {Date|string} scheduledDate - Optional scheduledDate field
 * @param {Date|string} createdAt - Optional createdAt field
 * @param {Date} baseDate - Reference clock (defaults to new Date())
 * @returns {object} Object with formatted string, datePart, timePart, isToday, isTomorrow, isPast, dayOfWeek
 */
export function parseSlotInfo(slot, scheduledDate, createdAt, baseDate = new Date()) {
  if (!slot && !scheduledDate && !createdAt) {
    return {
      formatted: 'Pending Slot',
      datePart: 'Pending Slot',
      timePart: '',
      dayOfWeek: '',
      dateFormatted: '',
      diffDays: 0,
      isToday: false,
      isTomorrow: false,
      isPast: false
    };
  }

  let targetDate = null;
  let timeStr = '';

  // 1. Try scheduledDate
  if (scheduledDate) {
    const d = new Date(scheduledDate);
    if (!isNaN(d.getTime())) targetDate = d;
  }

  // 2. Parse date & time from slot string
  const rawSlot = String(slot || '').trim();

  // Extract time portion (e.g., '10:00 AM - 11:00 AM' or '06:30 PM - 07:30 PM' or '14:00 - 15:30')
  const timeMatch = rawSlot.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*(?:-|to)\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
  if (timeMatch) {
    timeStr = timeMatch[1].trim();
  } else {
    const singleTime = rawSlot.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
    if (singleTime) timeStr = singleTime[1].trim();
  }

  // Check explicit date in parentheses: e.g. (30 Oct), (1 Nov), (30 Oct 2026)
  const dateInParen = rawSlot.match(/\((\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?\)/);
  // Check ISO date format: e.g. 2026-11-02
  const isoMatch = rawSlot.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  // Check standalone day + month: e.g. 30 Oct 2026 or 30 Oct
  const dayMonthMatch = rawSlot.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+(\d{4}))?\b/i);

  if (dateInParen) {
    const day = parseInt(dateInParen[1], 10);
    const mStr = dateInParen[2].slice(0, 3).toLowerCase();
    const mIndex = MONTH_NAMES.findIndex(m => m.toLowerCase() === mStr);
    const yr = dateInParen[3]
      ? parseInt(dateInParen[3], 10)
      : (targetDate ? targetDate.getFullYear() : (createdAt ? new Date(createdAt).getFullYear() : baseDate.getFullYear()));
    if (mIndex !== -1) {
      targetDate = new Date(yr, mIndex, day);
    }
  } else if (isoMatch) {
    targetDate = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  } else if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const mStr = dayMonthMatch[2].slice(0, 3).toLowerCase();
    const mIndex = MONTH_NAMES.findIndex(m => m.toLowerCase() === mStr);
    const yr = dayMonthMatch[3]
      ? parseInt(dayMonthMatch[3], 10)
      : (targetDate ? targetDate.getFullYear() : (createdAt ? new Date(createdAt).getFullYear() : baseDate.getFullYear()));
    if (mIndex !== -1) {
      targetDate = new Date(yr, mIndex, day);
    }
  } else if (!targetDate && createdAt) {
    const cDate = new Date(createdAt);
    if (!isNaN(cDate.getTime())) {
      targetDate = new Date(cDate);
      if (/^tomorrow/i.test(rawSlot)) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }
  }

  if (!targetDate) {
    return {
      formatted: rawSlot || 'Pending Slot',
      datePart: rawSlot,
      timePart: timeStr,
      dayOfWeek: '',
      dateFormatted: '',
      diffDays: 0,
      isToday: false,
      isTomorrow: false,
      isPast: false
    };
  }

  const startOfBase = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const startOfTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const diffDays = Math.round((startOfTarget - startOfBase) / (1000 * 60 * 60 * 24));

  const dayOfWeek = DAY_NAMES[targetDate.getDay()];
  const dayNum = targetDate.getDate();
  const month = MONTH_NAMES[targetDate.getMonth()];
  const dateFormatted = `${dayNum} ${month}`;

  let datePrefix = '';
  let isToday = false;
  let isTomorrow = false;
  let isPast = false;

  if (diffDays === 0) {
    datePrefix = `Today (${dateFormatted})`;
    isToday = true;
  } else if (diffDays === 1) {
    datePrefix = `Tomorrow (${dateFormatted})`;
    isTomorrow = true;
  } else if (diffDays < 0) {
    datePrefix = `${dayOfWeek} (${dateFormatted})`;
    isPast = true;
  } else {
    datePrefix = `${dayOfWeek} (${dateFormatted})`;
  }

  const finalFormatted = timeStr ? `${datePrefix}, ${timeStr}` : datePrefix;

  return {
    formatted: finalFormatted,
    datePart: datePrefix,
    timePart: timeStr,
    dayOfWeek,
    dateFormatted,
    diffDays,
    isToday,
    isTomorrow,
    isPast,
    targetDate
  };
}

/**
 * Convenience helper returning the formatted string
 */
export function formatSlotDisplay(slot, scheduledDate, createdAt) {
  return parseSlotInfo(slot, scheduledDate, createdAt).formatted;
}

