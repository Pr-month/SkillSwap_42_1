export interface SkillSeedRecord {
  sourceId: number;
  title: string;
  description: string;
  categoryName: string;
  ownerEmail: string;
  images: string[];
}

export const skillsSeed: SkillSeedRecord[] = [
  {
    sourceId: 1,
    title: 'Хатха-йога для начинающих',
    description:
      'Практикую йогу для души и тела. С удовольствием покажу самые комфортные асаны для старта и научу дышать так, чтобы уходило все напряжение дня. Коврик — это место силы!',
    categoryName: 'Управление командой',
    ownerEmail: 'anna.smirnova@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 2,
    title: 'Разговорный английский',
    description:
      'Английский — это не зубрежка, а свобода общения. Давай вместе сломаем языковой барьер? Будем обсуждать то, что интересно тебе, и незаметно подтянем грамматику за чашкой кофе (пусть и виртуальной).',
    categoryName: 'Управление командой',
    ownerEmail: 'elena.nov@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 3,
    title: 'Основы портретной фотографии',
    description:
      'Фотография — моя страсть. Хочу поделиться секретами, как видеть красивый свет и помогать людям расслабляться перед камерой. Твои снимки станут живыми и глубокими, обещаю.',
    categoryName: 'Управление командой',
    ownerEmail: 'ivan.sokolov@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 4,
    title: 'Запуск своего бизнеса с нуля',
    description:
      'За плечами три стартапа и куча набитых шишек. Готов по-дружески рассказать, как превратить идею в работающий бизнес, не потеряв при этом голову и деньги.',
    categoryName: 'Управление командой',
    ownerEmail: 'olga.k@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 5,
    title: 'Цифровая иллюстрация в Procreate',
    description:
      'Рисование на iPad — это магия. Покажу свои любимые кисти и фишки в Procreate. Нарисуем что-нибудь классное вместе, даже если ты никогда раньше не держал стилус.',
    categoryName: 'Управление командой',
    ownerEmail: 'sergey.m@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 6,
    title: 'Игра на барабанах для новичков',
    description:
      'Барабаны — это драйв! Если давно хотелось постучать, заходи. Покажу базовые ритмы, и уже на первой встрече сыграем что-то мощное, чтобы соседи (шутка!) оценили.',
    categoryName: 'Управление командой',
    ownerEmail: 'natasha.f@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 7,
    title: 'Составление рациона питания',
    description:
      'Еда должна быть другом, а не врагом. Помогу разобраться в тарелке без строгих диет, чтобы было вкусно, сытно и полезно именно для твоих целей.',
    categoryName: 'Управление командой',
    ownerEmail: 'andrey.popov@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 8,
    title: 'Основы проектного управления',
    description:
      'Проекты могут не гореть, если ими правильно управлять. Расскажу про Agile и Kanban простым языком, чтобы в делах (и в жизни) появился долгожданный порядок.',
    categoryName: 'Управление командой',
    ownerEmail: 'tanya.v@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 9,
    title: 'Коучинг для достижения целей',
    description:
      'Иногда нужен просто правильный вопрос, чтобы найти ответ. Предлагаю партнерство в поиске твоих истинных целей. Будем разбираться спокойно и глубоко.',
    categoryName: 'Управление командой',
    ownerEmail: 'mikhail.belov@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 10,
    title: 'Уход за комнатными растениями',
    description:
      'Мои подоконники — настоящие джунгли! С радостью научу понимать язык растений: когда полить, когда пересадить, чтобы они радовали зеленью круглый год.',
    categoryName: 'Тайм-менеджмент',
    ownerEmail: 'd.kozlov@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 11,
    title: 'Видеомонтаж в DaVinci Resolve',
    description:
      'Монтаж — это творчество. Покажу, как я работаю в DaVinci Resolve. Вместе соберем твой ролик, покрасим кадры и сделаем звук как в кино, и всё это в бесплатной версии.',
    categoryName: 'Тайм-менеджмент',
    ownerEmail: 'julia.rom@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 12,
    title: 'Подготовка к собеседованию',
    description:
      'Собеседования — это стресс, я знаю. Давай потренируемся в безопасной обстановке? Подскажу, как подсветить твои сильные стороны и чувствовать себя уверенно перед рекрутером.',
    categoryName: 'Тайм-менеджмент',
    ownerEmail: 'nikolay.o@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 13,
    title: 'Базовый ремонт своими руками',
    description:
      'Ремонт может быть медитацией, если знать пару секретов. Научу, как самому уложить плитку или починить кран, чтобы потом гордиться результатом перед друзьями.',
    categoryName: 'Тайм-менеджмент',
    ownerEmail: 'kate.leb@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 14,
    title: 'Испанский с нуля до А2',
    description:
      'Испанский — это страсть и музыка! Забудь про скучные учебники. Будем учить язык через песни и сериалы, чтобы ты заговорил легко и с удовольствием.',
    categoryName: 'Тайм-менеджмент',
    ownerEmail: 'pavel.koz@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 18,
    title: 'Организация пространства по KonMari',
    description:
      'Порядок дома — порядок в голове. Поделюсь системой Мари Кондо, которая изменила мою жизнь. Помогу разобрать завалы и оставить только то, что действительно радует.',
    categoryName: 'Маркетинг и реклама',
    ownerEmail: 'artem.ilyin@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 19,
    title: 'Искусство переговоров',
    description:
      'Переговоры — это искусство слышать. Поделюсь опытом, как договариваться без давления, находить общие интересы и выходить из любых споров с улыбкой.',
    categoryName: 'Маркетинг и реклама',
    ownerEmail: 'alina.z@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 20,
    title: 'Японский для анимешников',
    description:
      'Любишь аниме? Я тоже! Давай учить японский через любимые тайтлы. Разберем фразочки героев и иероглифы, чтобы смотреть в оригинале было еще интереснее.',
    categoryName: 'Маркетинг и реклама',
    ownerEmail: 'vladimir.e@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 21,
    title: 'Силовые тренировки для новичков',
    description:
      'Спорт — это про здоровье, а не про изнурение. Поставлю технику упражнений и составлю план, чтобы тренировки приносили радость и энергию, а не боль в спине.',
    categoryName: 'Продажи и переговоры',
    ownerEmail: 'dasha.n@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 22,
    title: 'Писательское мастерство',
    description:
      'В каждом из нас живет история. Если страшно начать писать, я поддержу. Разберем твои идеи и превратим их в захватывающий текст, шаг за шагом.',
    categoryName: 'Личный бренд',
    ownerEmail: 'roman.sid@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 23,
    title: 'Немецкий для путешествий',
    description:
      'Немецкий вовсе не грубый, он логичный и красивый! Подготовлю тебя к поездке: выучим самое нужное, чтобы чувствовать себя своим в Берлине или Вене.',
    categoryName: 'Личный бренд',
    ownerEmail: 'sveta.b@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 24,
    title: 'Скорочтение за 30 дней',
    description:
      "Книг так много, а времени мало. Покажу техники, которые помогли мне читать быстрее и запоминать лучше. Твой список 'прочитать' начнет таять на глазах!",
    categoryName: 'Резюме и собеседование',
    ownerEmail: 'kirill.m@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 25,
    title: 'Актёрское мастерство',
    description:
      'Сцена помогает раскрыться. Давай поработаем над голосом и телом? Это пригодится не только актерам, но и всем, кто хочет чувствовать себя свободнее в общении.',
    categoryName: 'Проектное управление',
    ownerEmail: 'polina.s@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 26,
    title: 'Личные финансы и бюджет',
    description:
      'Деньги любят счет, но не любят стресс. Помогу наладить отношения с финансами, составить простой бюджет и начать копить на мечту без жестких ограничений.',
    categoryName: 'Проектное управление',
    ownerEmail: 'denis.a@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 27,
    title: 'Китайский: первые шаги',
    description:
      'Китайский кажется космосом, но это увлекательный космос! Начнем с простых иероглифов и тонов. Обещаю, будет интересно погрузиться в эту древнюю культуру.',
    categoryName: 'Проектное управление',
    ownerEmail: 'ksenia.p@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 28,
    title: 'DIY декор для дома',
    description:
      'Уют создается деталями. Обожаю мастерить декор и научу тебя. Сделаем стильные штуки для дома (макраме или свечи), которые выглядят дорого, а стоят копейки.',
    categoryName: 'Предпринимательство',
    ownerEmail: 'georgy.v@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
  {
    sourceId: 43,
    title: 'Управление удалённой командой',
    description:
      'Удаленка — это вызов. Поделюсь опытом, как сохранить командный дух и эффективность, когда все в разных городах. Чтобы работа шла, а люди не чувствовали себя одиноко.',
    categoryName: 'Управление командой',
    ownerEmail: 'sergey.m@email.ru',
    images: [
      '/public/skill-1.jpg',
      '/public/skill-2.jpg',
      '/public/skill-3.jpg',
      '/public/skill-4.jpg',
    ],
  },
];
