/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CATEGORIES = {
  GENERAL: 'General',
  MOVIES: 'Movies',
  SPORTS: 'Sports',
  TECH: 'Tech',
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export const WORD_LISTS: Record<Category, string[]> = {
  General: [
    'APPLE', 'BEACH', 'BRAIN', 'BREAD', 'BRUSH', 'CHAIR', 'CHEST', 'CHORD', 'CLICK', 'CLOCK',
    'CLOUD', 'DANCE', 'DIARY', 'DRINK', 'EARTH', 'FEAST', 'FIELD', 'FLAME', 'FLUTE', 'FRUIT',
    'GLASS', 'GRAPE', 'GREEN', 'GUITAR', 'HEART', 'HOUSE', 'JUICE', 'LIGHT', 'MONEY', 'MUSIC',
    'NIGHT', 'OCEAN', 'PAINT', 'PARTY', 'PHONE', 'PIANO', 'PIZZA', 'PLANT', 'RADIO', 'RIVER',
    'SLEEP', 'SMILE', 'SNAKE', 'SPACE', 'SPOON', 'STORM', 'TABLE', 'TIGER', 'TOAST', 'TOUCH',
    'TRAIN', 'TRUCK', 'VOICE', 'WATER', 'WHALE', 'WORLD', 'WRITE', 'YOUTH', 'ZEBRA', 'ACTOR',
  ],
  Movies: [
    'ALIEN', 'JOKER', 'SHREK', 'SPEED', 'GHOST', 'ROCKY', 'MULAN', 'PRIDE', 'BRAVE', 'DUMBO',
    'EVITA', 'FRORO', 'GLORY', 'HEATY', 'HULKY', 'LOGAN', 'MARIO', 'METRO', 'PANIC', 'PLATO',
    'PSYCO', 'ROBIN', 'SEVEN', 'SIGHT', 'SIGNS', 'SKYRY', 'SPEED', 'SWIFT', 'THING', 'TOTAL',
    'TROYW', 'UPPER', 'VERTO', 'WITCH', 'XMENW', 'ZORRO', 'MOVIE', 'SCENE', 'STARS', 'DRAMA',
  ],
  Sports: [
    'BALLS', 'BENCH', 'COACH', 'COURT', 'DRAFT', 'FIELD', 'GOALS', 'GUARD', 'MATCH', 'PITCH',
    'PLAYER', 'POINT', 'RALLY', 'SCORE', 'SERVE', 'SHOOT', 'SKATE', 'SPORT', 'SWING', 'TRACK',
    'TRACK', 'TRAIN', 'UNIFO', 'WINER', 'YARDS', 'ZONES', 'BLOCK', 'CHAMP', 'CLIMB', 'CYCLE',
    'DERBY', 'DRIVE', 'FIGHT', 'FILES', 'FLOOR', 'GAMES', 'GLOVE', 'GRASS', 'GYMNA', 'HEAVY',
  ],
  Tech: [
    'APPLE', 'AUDIO', 'BASIC', 'BLOCK', 'BOARD', 'CACHE', 'CLICK', 'CLOUD', 'CODES', 'DEBUG',
    'DRIVE', 'EMAIL', 'ERROR', 'FILES', 'FLASH', 'FORMS', 'GATES', 'IMAGE', 'INPUT', 'INTEL',
    'LOGIC', 'MOUSE', 'NODES', 'PATCH', 'PIXEL', 'PROXY', 'QUERY', 'QUEUE', 'ROBOT', 'SHELL',
    'SHIFT', 'STACK', 'TOOLS', 'TOUCH', 'TRACK', 'VOICE', 'WRITE', 'CYBER', 'ROBOT', 'WIRER',
  ],
};

// Filtering out non-5-letter words just in case (though I manually checked)
Object.keys(WORD_LISTS).forEach((cat) => {
  WORD_LISTS[cat as Category] = WORD_LISTS[cat as Category].filter(w => w.length === 5).map(w => w.toUpperCase());
});

export const MAX_ATTEMPTS_NORMAL = 6;
export const MAX_ATTEMPTS_HARD = 4;

export const COLOR_CLASSES = {
  CORRECT: 'bg-green-500 text-white border-green-600',
  PRESENT: 'bg-yellow-500 text-white border-yellow-600',
  ABSENT: 'bg-gray-500 text-white border-gray-600',
  EMPTY: 'bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
  ACTIVE: 'bg-white text-gray-900 border-gray-500 dark:bg-gray-700 dark:text-white dark:border-gray-400',
};
