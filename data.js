const TRANS = {
    ru: {
        subtitle: "Учим буквы и цифры весело!",
        jun_t: "Малыши", jun_d: "до 6 лет", sen_t: "Старшие", sen_d: "до 10 лет",
        sel_sub: "Выбери предмет:", l_let: "Буквы", l_math: "Математика", l_syllables: "Слоги",
        map: "Карта уровней", dict: "Словарь", hard: "Сложно",
        paint: "Раскрась!", pop: "Лопай!",
        write: "Напиши слово:", task: "Задания", table: "Таблица", choose: "Выбери цифру",
        yes: ["Молодец!", "Отлично!", "Супер!", "Великолепно!"],
        no: ["Попробуй ещё раз!", "Почти получилось!", "Не сдавайся!"],
        find: "Найди слова", find_p: "Найди:",
        syl_basic: "По слогам", syl_advanced: "Собери слово", next_word: "Следующее слово", reset: "Сброс",
        select_mode: "Выбери режим:", click_syllable: "Нажми на слог",
        select_lang: "Выбери язык:",
        // Junior Games
        jun_maze: "Нарисуй букву!", jun_maze_h: "Проведи пальцем по букве",
        jun_bal: "Лопай шарики с буквой",
        jun_col: "Раскрась букву!",
        jun_feed: "Покорми Льва буквой",
        jun_peek: "Где спряталась буква?", jun_peek_found: "Ку-ку! Это буква"
    },
    en: {
        subtitle: "Learn letters and numbers!",
        jun_t: "Junior", jun_d: "up to 6", sen_t: "Senior", sen_d: "up to 10",
        sel_sub: "Select Subject:", l_let: "Letters", l_math: "Math", l_syllables: "Syllables",
        map: "Map", dict: "Dictionary", hard: "Hard",
        paint: "Paint!", pop: "Pop!",
        write: "Write word:", task: "Tasks", table: "Table", choose: "Choose num",
        yes: ["Good job!", "Excellent!", "Super!", "Amazing!"],
        no: ["Try again!", "Almost there!", "Don't give up!"],
        find: "Find Words", find_p: "Find:",
        syl_basic: "Syllables", syl_advanced: "Word Puzzle", next_word: "Next", reset: "Reset",
        select_mode: "Select Mode:", click_syllable: "Click syllable",
        select_lang: "Select Language:",
        // Junior Games
        jun_maze: "Draw the letter!", jun_maze_h: "Trace the letter with your finger",
        jun_bal: "Pop balloons with letter",
        jun_col: "Color the letter!",
        jun_feed: "Feed the Lion with letter",
        jun_peek: "Where is the letter hiding?", jun_peek_found: "Peekaboo! It's letter"
    },
    he: {
        subtitle: "לומדים אותיות ומספרים בכיף!",
        jun_t: "קטנטנים", jun_d: "עד גיל 6", sen_t: "גדולים", sen_d: "עד גיל 10",
        sel_sub: "בחר נושא:", l_let: "אותיות", l_math: "חשבון", l_syllables: "הברות",
        map: "מפת שלבים", dict: "מילון", hard: "קשה",
        paint: "צייר!", pop: "פוצץ!",
        write: "כתוב מילה:", task: "תרגילים", table: "לוח הכפל", choose: "בחר מספר",
        yes: ["כל הכבוד!", "מצוין!", "סופר!", "נהדר!", "אללוף!"],
        no: ["נסה שוב!", "כמעט!", "אל תוותר!"],
        find: "מצא מילים", find_p: "מצא:",
        syl_basic: "קריאה בהברות", syl_advanced: "פאזל מילים", next_word: "הבא", reset: "איפוס",
        select_mode: "בחר מצב:", click_syllable: "לחץ על הברה",
        select_lang: "בחר שפה:",
        // Junior Games
        jun_maze: "צייר את האות!", jun_maze_h: "עבור עם האצבע על האות",
        jun_bal: "פוצץ בלונים עם האות",
        jun_col: "צבע את האות!",
        jun_feed: "האכילו את האריה באות",
        jun_peek: "איפה מסתתרת האות?", jun_peek_found: "קו-קו! הנה האות"
    }
};

// Database (Letters/Numbers remain same)
const DB = {
    ru: { /* ... אותו תוכן כמו קודם ... */ },
    en: { /* ... אותו תוכן כמו קודם ... */ },
    he: { /* ... אותו תוכן כמו קודם ... */ },
    // חשוב: תוודא שכל ה-DB שהיה לך בקובץ data.js המקורי נשאר כאן
};
// כדי לחסוך מקום לא העתקתי את כל ה-DB, תשאיר את ה-DB שהיה לך, רק תחליף את ה-TRANS
