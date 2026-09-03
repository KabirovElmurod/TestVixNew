export const mockUsers = [
    { id: 1, username: 'admin', first_name: 'Elmurod', last_name: 'Kabirov', email: 'admin@testvix.uz', phone: '+998901112233', is_active: true, is_staff: true, is_superuser: true, date_joined: '2025-01-12', last_login: '2026-08-26' },
    { id: 2, username: 'aziz_dev', first_name: 'Aziz', last_name: 'Karimov', email: 'aziz@gmail.com', phone: '+998933214455', is_active: true, is_staff: false, is_superuser: false, date_joined: '2025-03-04', last_login: '2026-08-25' },
    { id: 3, username: 'malika01', first_name: 'Malika', last_name: 'Yusupova', email: 'malika@gmail.com', phone: '+998971234567', is_active: true, is_staff: false, is_superuser: false, date_joined: '2025-05-19', last_login: '2026-08-20' },
    { id: 4, username: 'jasur_t', first_name: 'Jasur', last_name: 'Tosheva', email: 'jasur@mail.ru', phone: '+998907654321', is_active: false, is_staff: false, is_superuser: false, date_joined: '2025-06-30', last_login: '2026-07-11' },
    { id: 5, username: 'nilufar', first_name: 'Nilufar', last_name: 'Rashidova', email: 'nilufar@gmail.com', phone: '+998935556677', is_active: true, is_staff: true, is_superuser: false, date_joined: '2025-08-02', last_login: '2026-08-27' },
    { id: 6, username: 'bobur99', first_name: 'Bobur', last_name: 'Aliyev', email: 'bobur@gmail.com', phone: '+998998887766', is_active: true, is_staff: false, is_superuser: false, date_joined: '2025-09-15', last_login: '2026-08-18' },
    { id: 7, username: 'dilnoza', first_name: 'Dilnoza', last_name: 'Saidova', email: 'dilnoza@inbox.uz', phone: '+998901010101', is_active: false, is_staff: false, is_superuser: false, date_joined: '2025-11-21', last_login: '2026-05-30' },
    { id: 8, username: 'sardor_m', first_name: 'Sardor', last_name: 'Mirzayev', email: 'sardor@gmail.com', phone: '+998932023030', is_active: true, is_staff: false, is_superuser: false, date_joined: '2026-01-08', last_login: '2026-08-24' },
];

export const mockTests = [
    { id: 1, user_id: 2, test_id: 58203941, nom: 'Algebra asoslari', fan: 'Matematika', tavsif: 'Kvadrat tenglamalar va funksiyalar boyicha test.', public: true, created: '2026-02-10' },
    { id: 2, user_id: 2, test_id: 61457820, nom: 'Organik kimyo', fan: 'Kimyo', tavsif: 'Uglevodorodlar va ularning xossalari.', public: true, created: '2026-02-18' },
    { id: 3, user_id: 3, test_id: 73920184, nom: 'Ingliz tili B1', fan: 'Ingliz tili', tavsif: 'Grammar va vocabulary boyicha oraliq test.', public: false, created: '2026-03-01' },
    { id: 4, user_id: 5, test_id: 55018472, nom: 'Mexanika', fan: 'Fizika', tavsif: 'Nyuton qonunlari va harakat kinematikasi.', public: true, created: '2026-03-14' },
    { id: 5, user_id: 6, test_id: 68301957, nom: 'Ona tili sintaksis', fan: 'Ona tili', tavsif: 'Gap bolaklari va murakkab gaplar.', public: true, created: '2026-04-05' },
    { id: 6, user_id: 3, test_id: 82047163, nom: 'Jahon tarixi', fan: 'Tarix', tavsif: 'XX asr jahon tarixi boyicha savollar.', public: false, created: '2026-04-22' },
    { id: 7, user_id: 8, test_id: 59371046, nom: 'Informatika: Python', fan: 'Informatika', tavsif: 'Python dasturlash tili asoslari.', public: true, created: '2026-05-09' },
    { id: 8, user_id: 5, test_id: 77250391, nom: 'Elektr va magnetizm', fan: 'Fizika', tavsif: 'Elektr zanjirlari va magnit maydon.', public: true, created: '2026-05-27' },
    { id: 9, user_id: 6, test_id: 64890215, nom: 'Geometriya: planimetriya', fan: 'Matematika', tavsif: 'Uchburchak va aylana boyicha masalalar.', public: false, created: '2026-06-13' },
    { id: 10, user_id: 8, test_id: 71503826, nom: 'Biologiya: hujayra', fan: 'Biologiya', tavsif: 'Hujayra tuzilishi va funksiyalari.', public: true, created: '2026-07-01' },
];

export const mockQuestions = [
    { id: 1, test_id: 1, text: 'Kvadrat tenglamaning ildizlari nechta bo\'lishi mumkin?', svg_json: null },
    { id: 2, test_id: 1, text: 'Funksiya grafigini qanday chizish mumkin?', svg_json: '{"type": "graph", "data": [...]}' },
    { id: 3, test_id: 2, text: 'Metan formulasi nima?', svg_json: null },
    { id: 4, test_id: 2, text: 'Uglevodorodlar nechta turga bo\'linadi?', svg_json: null },
    { id: 5, test_id: 3, text: 'Present Perfect tense qachon ishlatiladi?', svg_json: null },
    { id: 6, test_id: 4, text: 'Nyutonning birinchi qonuni nimani ifodalaydi?', svg_json: null },
    { id: 7, test_id: 5, text: 'Gapning bo\'laklari qaysilar?', svg_json: null },
    { id: 8, test_id: 6, text: 'XX asrda qaysi yirik voqealar sodir bo\'ldi?', svg_json: null },
    { id: 9, test_id: 7, text: 'Python da o\'zgaruvchini qanday e\'lon qilish mumkin?', svg_json: null },
    { id: 10, test_id: 8, text: 'Ohm qonuni formulasi nima?', svg_json: null },
];

export const mockVariants = [
    { id: 1, savol_id: 1, text: '1 ta', is_true: false },
    { id: 2, savol_id: 1, text: '2 ta', is_true: true },
    { id: 3, savol_id: 1, text: '0 ta', is_true: false },
    { id: 4, savol_id: 1, text: 'Cheksiz', is_true: false },
    { id: 5, savol_id: 2, text: 'Qalam bilan', is_true: false },
    { id: 6, savol_id: 2, text: 'Kompyuter dasturlari yordamida', is_true: true },
    { id: 7, savol_id: 3, text: 'CH4', is_true: true },
    { id: 8, savol_id: 3, text: 'C2H6', is_true: false },
    { id: 9, savol_id: 3, text: 'C3H8', is_true: false },
    { id: 10, savol_id: 4, text: '2 turga', is_true: false },
    { id: 11, savol_id: 4, text: '3 turga', is_true: true },
    { id: 12, savol_id: 4, text: '4 turga', is_true: false },
];

export const mockHashtags = [
    { id: 1, name: 'matematika' },
    { id: 2, name: 'algebra' },
    { id: 3, name: 'geometriya' },
    { id: 4, name: 'kimyo' },
    { id: 5, name: 'fizika' },
    { id: 6, name: 'ingliz-tili' },
    { id: 7, name: 'tarix' },
    { id: 8, name: 'biologiya' },
    { id: 9, name: 'informatika' },
    { id: 10, name: 'ona-tili' },
];

export const mockTestHashtags = [
    { id: 1, test_id: 1, hashtag_id: 1, tag: true },
    { id: 2, test_id: 1, hashtag_id: 2, tag: false },
    { id: 3, test_id: 2, hashtag_id: 4, tag: true },
    { id: 4, test_id: 3, hashtag_id: 6, tag: true },
    { id: 5, test_id: 4, hashtag_id: 5, tag: true },
    { id: 6, test_id: 5, hashtag_id: 10, tag: true },
    { id: 7, test_id: 6, hashtag_id: 7, tag: true },
    { id: 8, test_id: 7, hashtag_id: 9, tag: true },
    { id: 9, test_id: 8, hashtag_id: 5, tag: true },
    { id: 10, test_id: 9, hashtag_id: 3, tag: true },
];

export const mockResults = [
    { id: 1, user_id: 2, test_id: 1, sum_son: 10, true_son: 8, false_son: 2, answer: {}, isfinish: true, created: '2026-08-20' },
    { id: 2, user_id: 3, test_id: 1, sum_son: 10, true_son: 6, false_son: 4, answer: {}, isfinish: true, created: '2026-08-21' },
    { id: 3, user_id: 2, test_id: 2, sum_son: 15, true_son: 12, false_son: 3, answer: {}, isfinish: true, created: '2026-08-22' },
    { id: 4, user_id: 5, test_id: 3, sum_son: 20, true_son: 15, false_son: 5, answer: {}, isfinish: true, created: '2026-08-23' },
    { id: 5, user_id: 6, test_id: 4, sum_son: 12, true_son: 10, false_son: 2, answer: {}, isfinish: false, created: '2026-08-24' },
    { id: 6, user_id: 3, test_id: 5, sum_son: 8, true_son: 7, false_son: 1, answer: {}, isfinish: true, created: '2026-08-25' },
    { id: 7, user_id: 8, test_id: 6, sum_son: 10, true_son: 5, false_son: 5, answer: {}, isfinish: true, created: '2026-08-26' },
    { id: 8, user_id: 5, test_id: 7, sum_son: 15, true_son: 14, false_son: 1, answer: {}, isfinish: true, created: '2026-08-26' },
    { id: 9, user_id: 6, test_id: 8, sum_son: 12, true_son: 9, false_son: 3, answer: {}, isfinish: false, created: '2026-08-27' },
    { id: 10, user_id: 8, test_id: 9, sum_son: 10, true_son: 8, false_son: 2, answer: {}, isfinish: true, created: '2026-08-27' },
];

export const getUniqueTestId = (tests) => {
    let number;
    do {
        number = Math.floor(Math.random() * (90000000 - 50000000) + 50000000);
    } while (tests.some((t) => t.test_id === number));
    return number;
};