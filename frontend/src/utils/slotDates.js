/**
 * Dynamic Service Slot and Date Generator for Urban Company Checkout
 * 
 * Guarantees exactly 3 active dates:
 * - When today is active: Day 0 (Today, e.g. 24 Oct), Day 1 (Tomorrow, 25 Oct), Day 2 (DayName, 26 Oct) -> 24, 25, 26
 * - When today is completed (past 18:30 or midnight rollover): Day 1 (25 Oct), Day 2 (26 Oct), Day 3 (27 Oct) -> 25, 26, 27
 * Automatically stays synchronized with real-time clock.
 */

export const SERVICE_TIME_SLOTS = [
  { id: '10-11', label: '10:00 AM - 11:00 AM', startHour: 10, startMinute: 0 },
  { id: '14-15', label: '02:00 PM - 03:00 PM', startHour: 14, startMinute: 0 },
  { id: '16-17', label: '04:00 PM - 05:00 PM', startHour: 16, startMinute: 0 },
  { id: '18-19', label: '06:30 PM - 07:30 PM', startHour: 18, startMinute: 30 }
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns whether all service slots for today have completed (past 18:30 / 6:30 PM cutoff)
 */
export function isTodayServiceCompleted(now = new Date()) {
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  // Cutoff is 18:30 (6:30 PM), the start of the final service slot for the day
  return currentHour > 18 || (currentHour === 18 && currentMinute >= 30);
}

/**
 * Returns exactly 3 service dates dynamically based on current time
 */
export function getAvailableServiceDates(baseDate = new Date()) {
  const now = new Date(baseDate);
  const completedToday = isTodayServiceCompleted(now);
  const startOffset = completedToday ? 1 : 0;

  const dates = [];
  for (let i = 0; i < 3; i++) {
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
  if (!slot) return false;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour > slot.startHour) return true;
  if (currentHour === slot.startHour && currentMinute >= slot.startMinute) return true;
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
