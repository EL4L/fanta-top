export const PLAYER_NOTES_VERSION = 1;

const NOTE_MAX_LENGTH = 1000;

export const playerNotesStorageKey = (profileId) =>
  `fanta-player-notes-v${PLAYER_NOTES_VERSION}:${encodeURIComponent(
    profileId || "default",
  )}`;

export const emptyMark = () => ({
  target: false,
  note: "",
  maxPrice: null,
});

export const normalizePlayerNotes = (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const entries = Object.entries(raw).flatMap(([id, value]) => {
    if (!value || typeof value !== "object") return [];

    const target = value.target === true;

    const note =
      typeof value.note === "string"
        ? value.note.slice(0, NOTE_MAX_LENGTH)
        : "";

    const parsedMaxPrice = Number(value.maxPrice);

    const maxPrice =
      Number.isFinite(parsedMaxPrice) &&
      parsedMaxPrice >= 0 &&
      Number.isInteger(parsedMaxPrice)
        ? parsedMaxPrice
        : null;

    return target || note || maxPrice !== null
      ? [
          [
            String(id),
            {
              target,
              note,
              maxPrice,
            },
          ],
        ]
      : [];
  });

  return Object.fromEntries(entries);
};

export const playerMark = (notes, playerId) =>
  (notes || {})[String(playerId)] || emptyMark();

const writeMark = (notes, playerId, mark) => {
  const key = String(playerId);
  const next = { ...(notes || {}) };

  if (!mark.target && !mark.note && mark.maxPrice === null) {
    delete next[key];
  } else {
    next[key] = mark;
  }

  return next;
};

export const withTarget = (notes, playerId, target) =>
  writeMark(notes, playerId, {
    ...playerMark(notes, playerId),
    target: target === true,
  });

export const withNote = (notes, playerId, note) =>
  writeMark(notes, playerId, {
    ...playerMark(notes, playerId),
    note: String(note ?? "").slice(0, NOTE_MAX_LENGTH),
  });

export const withMaxPrice = (notes, playerId, maxPrice) =>
  writeMark(notes, playerId, {
    ...playerMark(notes, playerId),
    maxPrice:
      maxPrice === "" || maxPrice === null
        ? null
        : Math.max(0, Number(maxPrice)),
  });

export const targetCount = (notes) =>
  Object.values(notes || {}).filter((mark) => mark?.target).length;

export const loadPlayerNotes = (profileId) => {
  try {
    return normalizePlayerNotes(
      JSON.parse(
        localStorage.getItem(playerNotesStorageKey(profileId)) || "null",
      ),
    );
  } catch {
    return {};
  }
};

export const savePlayerNotes = (profileId, notes) => {
  try {
    localStorage.setItem(
      playerNotesStorageKey(profileId),
      JSON.stringify(notes),
    );
    return true;
  } catch {
    return false;
  }
};