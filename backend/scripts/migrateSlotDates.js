import { connectDB } from '../config/db.js';
import { Booking } from '../models/Booking.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getAccurateSlotAndDate(booking, baseDate = new Date()) {
  const rawSlot = String(booking.slot || '').trim();
  let targetDate = null;
  let timeStr = '';

  if (booking.scheduledDate) {
    const d = new Date(booking.scheduledDate);
    if (!isNaN(d.getTime())) targetDate = d;
  }

  const timeMatch = rawSlot.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*(?:-|to)\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
  if (timeMatch) {
    timeStr = timeMatch[1].trim();
  } else {
    const singleTime = rawSlot.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
    if (singleTime) timeStr = singleTime[1].trim();
  }

  const dateInParen = rawSlot.match(/\((\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?\)/);
  const isoMatch = rawSlot.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  const dayMonthMatch = rawSlot.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+(\d{4}))?\b/i);

  if (dateInParen) {
    const day = parseInt(dateInParen[1], 10);
    const mStr = dateInParen[2].slice(0, 3).toLowerCase();
    const mIndex = MONTH_NAMES.findIndex(m => m.toLowerCase() === mStr);
    const yr = dateInParen[3]
      ? parseInt(dateInParen[3], 10)
      : (targetDate ? targetDate.getFullYear() : (booking.createdAt ? new Date(booking.createdAt).getFullYear() : baseDate.getFullYear()));
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
      : (targetDate ? targetDate.getFullYear() : (booking.createdAt ? new Date(booking.createdAt).getFullYear() : baseDate.getFullYear()));
    if (mIndex !== -1) {
      targetDate = new Date(yr, mIndex, day);
    }
  } else if (!targetDate && booking.createdAt) {
    const cDate = new Date(booking.createdAt);
    if (!isNaN(cDate.getTime())) {
      targetDate = new Date(cDate);
      if (/^tomorrow/i.test(rawSlot)) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }
  }

  if (!targetDate) return null;

  const startOfBase = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const startOfTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const diffDays = Math.round((startOfTarget - startOfBase) / (1000 * 60 * 60 * 24));

  const dayOfWeek = DAY_NAMES[targetDate.getDay()];
  const dayNum = targetDate.getDate();
  const month = MONTH_NAMES[targetDate.getMonth()];
  const dateFormatted = `${dayNum} ${month}`;

  let datePrefix = '';
  if (diffDays === 0) {
    datePrefix = `Today (${dateFormatted})`;
  } else if (diffDays === 1) {
    datePrefix = `Tomorrow (${dateFormatted})`;
  } else {
    // For past days or days further in future, use Day of week!
    datePrefix = `${dayOfWeek} (${dateFormatted})`;
  }

  const updatedSlot = timeStr ? `${datePrefix}, ${timeStr}` : datePrefix;

  return {
    updatedSlot,
    scheduledDate: targetDate
  };
}

async function run() {
  await connectDB();
  const bookings = await Booking.find({});
  console.log(`Found ${bookings.length} bookings to examine.`);

  let updatedCount = 0;
  for (const b of bookings) {
    const res = getAccurateSlotAndDate(b);
    if (res) {
      const needsSlotUpdate = b.slot !== res.updatedSlot;
      const needsDateUpdate = !b.scheduledDate || new Date(b.scheduledDate).getTime() !== res.scheduledDate.getTime();

      if (needsSlotUpdate || needsDateUpdate) {
        console.log(`Updating ${b.id}: "${b.slot}" -> "${res.updatedSlot}" (Date: ${res.scheduledDate.toISOString().slice(0, 10)})`);
        await Booking.updateOne(
          { _id: b._id },
          {
            $set: {
              slot: res.updatedSlot,
              scheduledDate: res.scheduledDate
            }
          }
        );
        updatedCount++;
      }
    }
  }

  console.log(`Updated ${updatedCount} bookings in MongoDB Atlas.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
