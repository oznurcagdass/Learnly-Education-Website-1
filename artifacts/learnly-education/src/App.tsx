import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  GraduationCap,
  Menu,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

type Language = 'tr' | 'en';
type AudienceKey = 'parents' | 'students' | 'teachers';
type FilterKey = 'all' | 'foundations' | 'algebra' | 'geometry' | 'data' | 'problemSolving';

const audienceKeys: AudienceKey[] = ['parents', 'students', 'teachers'];
const filterKeys: FilterKey[] = ['all', 'foundations', 'algebra', 'geometry', 'data', 'problemSolving'];

const translations = {
  tr: {
    nav: {
      audiences: 'Kimin için',
      resources: 'Matematik kaynakları',
      faq: 'Sorular',
      signIn: 'Giriş yap',
      request: 'Matematik eğitmeni bul',
      language: 'Dil seçimi',
      home: 'Learnly ana sayfa',
      openMenu: 'Menüyü aç',
      closeMenu: 'Menüyü kapat',
      main: 'Ana navigasyon',
    },
    hero: {
      eyebrow: 'Günlük hayat için matematik desteği',
      title: 'Matematikte iyi hissetmenin daha net bir yolu.',
      copy: 'Learnly; aileleri özenli özel eğitmenlerle buluşturur, öğrencilerin güvenini güçlendiren rehberli pratikler sunar ve öğretmenlerin kullanımına güvenilir müfredat kaynakları bırakır.',
      request: 'Eğitmen talep et',
      seeHow: 'Learnly nasıl yardımcı olur?',
      trusted: '2.700’den fazla aile tarafından güvenilen, seçilmiş eğitimciler',
      boardAria: 'Learnly rehberli matematik dersinden bir önizleme',
      today: 'Bugünün pratiği',
      gradeTime: '7. sınıf · 12 dk',
      boardTitle: 'Bir soruyu çözmenin birden fazla yolu vardır.',
      showThinking: 'düşünme adımlarını göster',
      rows: [
        ['Değişmeden kalanı fark et', 'Isınma · 3 dk'],
        ['Bir adım dene, sonra açıkla', 'Rehberli pratik · 6 dk'],
        ['Cevabının anlamlı olup olmadığını kontrol et', 'Değerlendirme · 3 dk'],
      ],
      tutorNote: 'Eğitmen notu',
      keepGoing: 'Çok iyi düşünüyorsun.<br />Devam et.',
    },
    signal: {
      line: 'Daha az kaygı. Daha çok “Şimdi görüyorum.”',
      families: 'aile',
      tutors: 'seçilmiş eğitmen',
      areas: 'müfredat alanı',
    },
    audience: {
      kicker: 'Başlamak için bir yer',
      title: 'İhtiyacın olduğu ana <em>uygun destek.</em>',
      intro: 'Herkesin desteğe ihtiyaç duyduğu an farklıdır. Learnly’ye kendi bakış açınızı seçin; matematiği insan merkezli tutalım.',
      tabLabel: 'Learnly toplulukları',
      parents: {
        name: 'Aileler',
        eyebrow: 'Öğrenenin yanında olanlar için',
        title: 'Çocuğun tamamını gören bir eğitmen bulun.',
        description: 'Öğrenenin ihtiyacını bize anlatın; sizi seviyeye, hedeflere, kişiliğe ve zamana göre eşleştirilmiş, sabırlı ve anlaşılır matematik eğitmenleriyle tanıştıralım.',
        benefits: [
          ['Özenle yapılmış eşleşme', 'Eğitmen önerileri; seviyeye, hedeflere, öğrenme biçimine ve uygunluk durumuna göre şekillenir.'],
          ['Açık ilerleme notları', 'Her görüşmeden sonra neyin anlaşıldığını, neyin pratik istediğini ve sıradaki adımı bilin.'],
        ],
      },
      students: {
        name: 'Öğrenciler',
        eyebrow: 'Sessizce kararlı olanlar için',
        title: 'Matematiği yeniden mümkün hissedin.',
        description: 'İyi bir soruyla başlayan küçük adımlarla güven kazanın. Rehberli pratik, anlaşılır açıklamalar ve sizi geride hissettirmeyen eğitmenlerle ilerleyin.',
        benefits: [
          ['Amaçlı pratik yapın', 'Cevabın altındaki fikri fark etmenizi sağlayan kısa ve odaklı sorularla çalışın.'],
          ['Sorularınız için alan', 'Derste sormaya çekindiğiniz soruyu getirin. Tam olarak oradan başlayalım.'],
        ],
      },
      teachers: {
        name: 'Öğretmenler',
        eyebrow: 'Düşünmeyi öğretenler için',
        title: 'Yarın kullanabileceğiniz kaynaklar.',
        description: 'İçerik fabrikaları değil, aktif olarak matematik öğreten eğitimciler tarafından hazırlanan müfredat uyumlu etkinlikleri, açıklamaları ve sınıf fikirlerini keşfedin.',
        benefits: [
          ['Müfredatla uyumlu', 'İlkokul, ortaokul ve lise düzeylerindeki tanıdık öğrenme hedefleriyle eşleşen kaynaklar.'],
          ['Güveninizi hak eder', 'Her etkinlik matematiksel doğruluk, erişilebilirlik ve gerçek sınıf kullanımı açısından incelenir.'],
        ],
      },
      actionResources: 'Öğretmen kaynaklarına göz at',
      actionRequest: 'Eğitmen talebi başlat',
      thirdTeacher: 'Okul gününe uyumlu',
      thirdTeacherCopy: 'Yazdırın, atayın, uyarlayın ve iyi bir matematik sohbetini sürdürün.',
      thirdGeneral: 'Kestirme değil, güven',
      thirdGeneralCopy: 'Akıl yürütmeyi öğrenen kişi, bunu bir sonraki soruya da taşıyabilir.',
    },
    credibility: {
      statement: 'Matematik desteği aynı anda hem sağlam hem de şefkatli olabilir.',
      vetted: 'Eğitimciler tarafından incelenir',
      curriculum: 'Müfredatı gözetir',
      matching: 'İnsan odaklı eşleşme',
    },
    resources: {
      kicker: 'Kaynak rafı',
      title: 'İyi matematik içeriği, <em>ihtiyacınız olduğunda hazır.</em>',
      intro: 'Mutfak masasındaki çalışmadan yarının dersine kadar, ikinci kez bakılması gereken fikirler için kısa ve işe yarar kaynaklar.',
      filterLabel: 'Matematik kaynaklarını filtrele',
      filters: {
        all: 'Tüm kaynaklar',
        foundations: 'Temeller',
        algebra: 'Cebir',
        geometry: 'Geometri',
        data: 'Veri',
        problemSolving: 'Problem çözme',
      },
      cards: [
        ['Kesirlerin sisini dağıtmak', 'Bir bütünün parçalarından farklı paydalı kesirleri karşılaştırmaya görsel bir yol.', '4–6. sınıf', '12 dk'],
        ['Cebirsel düşünme ısınması', 'Örüntüleri işe yarayan denklemlere dönüştüren, eşiği düşük beş soru.', '6–8. sınıf', '8 dk'],
        ['π ile daha iyi tanışmak', 'Çemberleri, ipi ve şaşırtıcı bir oranı kullanarak bu sabiti akılda kalıcı hâle getirin.', '7–9. sınıf', '15 dk'],
        ['Gerçek hayat grafiğini okumak', 'Öğrenenlerin grafikler, eksenler ve gürültülü veriler hakkında daha iyi sorular sormasına yardımcı olun.', '5–8. sınıf', '10 dk'],
        ['Bir soru, üç strateji', 'Sadece neyin işe yaradığını değil, neden işe yaradığını da anlatmak için eğitmen eşliğinde bir rutin.', 'Tüm seviyeler', '18 dk'],
      ],
      open: 'Aç',
      opened: '“{title}” açıldı.',
    },
    request: {
      kicker: 'Bir sohbetle başlayın',
      title: 'Doğru sonraki <em>adımı bulalım.</em>',
      copy: 'Öğrenen ve son zamanlarda zor gelen konular hakkında biraz bilgi paylaşın. Ekibimizden gerçek bir kişi okuyacak ve özenli bir eğitmen eşleşmesiyle size dönüş yapacak.',
      proof: '“Çocuğumun ilk kez ‘Buna nasıl başlayacağımı biliyorum’ dediği an, doğru desteği bulduğumuzu anladım.”',
      proofBy: '— Nina, Learnly ailesi',
      formAudience: 'Ben bir…',
      formLevel: 'Matematik seviyesi',
      formName: 'Adınız',
      formContact: 'E-posta veya telefon',
      formMessage: 'Matematiği ne daha iyi hissettirirdi?',
      namePlaceholder: 'Nina Patel',
      contactPlaceholder: 'nina@eposta.com',
      messagePlaceholder: 'Üzerinde çalışılan konuyu, nerede takıldığınızı veya neyin değişmesini umduğunuzu anlatın.',
      audienceOptions: ['Aile üyesi', 'Öğrenci', 'Öğretmen'],
      levelOptions: ['İlkokul / üst ilkokul', 'Ortaokul', 'Lise', 'Üniversite / yetişkin öğrenen'],
      submit: 'Eğitmen talebini gönder',
      successTitle: 'Notunuzu aldık.',
      successCopy: 'Teşekkürler, {name}. Eşleştirme ekibimiz bir okul günü içinde düşünülmüş bir sonraki adımla size ulaşacak.',
      another: 'Yeni bir talep gönder',
    },
    quote: {
      text: '“Matematikte hızlı olmaya çalışmayı bıraktım. Onu anlamaya çalışmaya başladım.”',
      name: 'Leo E.',
      meta: '8. sınıf öğrencisi, Learnly öğrencisi',
    },
    faq: {
      kicker: 'Birkaç güzel soru',
      title: 'Sormanın <em>yanlış bir tarafı yok.</em>',
      intro: 'Matematik desteği seçmek kişisel bir karardır. Ailelerin, öğrenenlerin ve öğretmenlerin bize ilk sorduğu şeyler burada.',
      items: [
        ['Bizi özel bir eğitmenle nasıl eşleştiriyorsunuz?', 'Öğreneni, seviyeyi ve hangi desteğin işe yarayacağını anlamak için kısa bir taleple başlayın. Tanıştırmadan önce konu uzmanlığını, öğretme biçimini, uygunluk durumunu ve uyumu birlikte değerlendiririz.'],
        ['Learnly eğitmenleri hangi yaş ve seviyeleri destekliyor?', 'Ağımız; ilkokulun üst sınıflarından üniversiteye hazırlık matematiğine kadar aritmetik, ön cebir, cebir, geometri, trigonometri, kalkülüs ve istatistik alanlarında destek sunar.'],
        ['Kaynaklar okul müfredatıyla uyumlu mu?', 'Evet. Her kaynak beceri ve yaş aralığına göre etiketlenir, ardından aktif bir eğitimci tarafından incelenir. Okullarda işlenen kavramları takip ederken farklı öğretme yaklaşımlarına da alan bırakırız.'],
        ['Eğitmen talebini gönderdikten sonra ne olur?', 'Eşleştirme ekibimizden genellikle bir okul günü içinde özenli bir takip mesajı alırsınız. Önerilen eğitmenle tanışmadan bir görüşme planlama baskısı yoktur.'],
      ],
    },
    finalCta: {
      kicker: 'Büyük bir sıçrama gerekmiyor',
      title: 'Daha iyi bir matematik anı <em>bugün</em> başlayabilir.',
      copy: 'Neler olduğunu anlatın. Size bir paket satmak yerine işe yarar bir sonraki adımı seçmenize yardımcı olalım.',
      button: 'Eğitmen talep et',
    },
    footer: {
      meta: 'Öğrenmenin gerçekten gerçekleştiği hâle uygun matematik desteği.',
      privacyLabel: 'Gizlilik',
      contactLabel: 'İletişim',
      privacy: 'Gizlilik sayfamızı özenle hazırlıyoruz.',
      contact: 'Bize hello@learnly.example adresinden ulaşın',
    },
    toasts: {
      signIn: 'Aile hesapları çok yakında burada.',
      requestSent: 'Eğitmen talebiniz yola çıktı.',
    },
  },
  en: {
    nav: {
      audiences: 'Who it is for',
      resources: 'Math resources',
      faq: 'Questions',
      signIn: 'Sign in',
      request: 'Find a math tutor',
      language: 'Language selection',
      home: 'Learnly home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      main: 'Main navigation',
    },
    hero: {
      eyebrow: 'Math support for real life',
      title: 'A clearer way to <em>feel</em> good at math.',
      copy: 'Learnly helps families find thoughtful private tutors, gives students guided practice that builds confidence, and puts trusted curriculum resources in teachers’ hands.',
      request: 'Request a tutor',
      seeHow: 'See how Learnly helps',
      trusted: 'Vetted educators, trusted by 2,700+ families',
      boardAria: 'A preview of a Learnly guided math lesson',
      today: 'Today’s practice',
      gradeTime: 'Grade 7 · 12 min',
      boardTitle: 'There is more than one way to solve it.',
      showThinking: 'show your thinking',
      rows: [
        ['Notice what is staying the same', 'Warm-up · 3 min'],
        ['Try a step, then explain it', 'Guided practice · 6 min'],
        ['Check if your answer makes sense', 'Reflection · 3 min'],
      ],
      tutorNote: 'Tutor note',
      keepGoing: 'Good thinking.<br />Keep going.',
    },
    signal: {
      line: 'Less panic. More “I can see it now.”',
      families: 'families',
      tutors: 'vetted tutors',
      areas: 'curriculum areas',
    },
    audience: {
      kicker: 'A place to start',
      title: 'Support that meets <em>the moment.</em>',
      intro: 'Different people need different kinds of help. Choose your view of Learnly—we will keep the math human.',
      tabLabel: 'Learnly audiences',
      parents: {
        name: 'Parents',
        eyebrow: 'For the people in their corner',
        title: 'Find a tutor who sees the whole child.',
        description: 'Tell us what your learner needs, and we will introduce you to thoughtful, vetted math tutors who teach with patience, clarity, and a plan.',
        benefits: [
          ['A considered match', 'Tutor recommendations shaped around level, goals, personality, and availability.'],
          ['Clear progress notes', 'Know what clicked, what needs practice, and what to do next after each session.'],
        ],
      },
      students: {
        name: 'Students',
        eyebrow: 'For the quietly determined',
        title: 'Make math feel possible again.',
        description: 'Build confidence one good question at a time with guided practice, friendly explanations, and tutors who never make you feel behind.',
        benefits: [
          ['Practice with purpose', 'Short, focused problems that help you notice the idea underneath the answer.'],
          ['A place to ask', 'Bring the question you were afraid to ask in class. We will start exactly there.'],
        ],
      },
      teachers: {
        name: 'Teachers',
        eyebrow: 'For people who teach the thinking',
        title: 'Resources you can put to work tomorrow.',
        description: 'Browse curriculum-aligned tasks, explanations, and classroom prompts made by practicing math educators—not content factories.',
        benefits: [
          ['Curriculum aligned', 'Resources mapped to familiar learning goals across elementary, middle, and high school.'],
          ['Worth your trust', 'Every activity is reviewed for mathematical accuracy, accessibility, and real classroom use.'],
        ],
      },
      actionResources: 'Browse teacher resources',
      actionRequest: 'Start a tutoring request',
      thirdTeacher: 'Made for the school day',
      thirdTeacherCopy: 'Print, assign, adapt, and keep the good conversation going.',
      thirdGeneral: 'Confidence, not shortcuts',
      thirdGeneralCopy: 'We teach the reasoning so learners can carry it into the next problem.',
    },
    credibility: {
      statement: 'Math help should feel rigorous and kind at the same time.',
      vetted: 'Vetted by educators',
      curriculum: 'Curriculum-aware',
      matching: 'Human matching',
    },
    resources: {
      kicker: 'The resource shelf',
      title: 'Good math content, <em>ready when you are.</em>',
      intro: 'Short, useful resources for the ideas that tend to need a second look—at the kitchen table or in tomorrow’s lesson.',
      filterLabel: 'Filter math resources',
      filters: {
        all: 'All resources',
        foundations: 'Foundations',
        algebra: 'Algebra',
        geometry: 'Geometry',
        data: 'Data',
        problemSolving: 'Problem solving',
      },
      cards: [
        ['Fractions without the fog', 'A visual route from parts of a whole to comparing unlike fractions.', 'Grades 4–6', '12 min'],
        ['The algebraic thinking warm-up', 'Five low-floor prompts that turn patterns into useful equations.', 'Grades 6–8', '8 min'],
        ['A better way to meet π', 'Use circles, string, and one surprising ratio to make the constant stick.', 'Grades 7–9', '15 min'],
        ['Reading a real-world graph', 'Help learners ask better questions of charts, axes, and noisy data.', 'Grades 5–8', '10 min'],
        ['One problem, three strategies', 'A tutor-led routine for explaining not only what works, but why.', 'All levels', '18 min'],
      ],
      open: 'Open',
      opened: 'Opened “{title}”.',
    },
    request: {
      kicker: 'Start with a conversation',
      title: 'Let’s find the <em>right next step.</em>',
      copy: 'Share a little about the learner and what has been hard lately. A real person on our team will read it and follow up with a considered tutor match.',
      proof: '“The first time my daughter said, ‘I know how to start this,’ I knew we had found the right support.”',
      proofBy: '— Nina, Learnly parent',
      formAudience: 'I am a…',
      formLevel: 'Math level',
      formName: 'Your name',
      formContact: 'Email or phone',
      formMessage: 'What would make math feel better?',
      namePlaceholder: 'Nina Patel',
      contactPlaceholder: 'nina@email.com',
      messagePlaceholder: 'Tell us what they are working on, what feels stuck, or what you hope will change.',
      audienceOptions: ['Parent', 'Student', 'Teacher'],
      levelOptions: ['Elementary / upper elementary', 'Middle school', 'High school', 'College / adult learner'],
      submit: 'Send tutoring request',
      successTitle: 'We have your note.',
      successCopy: 'Thanks, {name}. Our matching team will be in touch within one school day with a thoughtful next step.',
      another: 'Send another request',
    },
    quote: {
      text: '“I stopped trying to be <em>fast</em> at math. I started trying to understand it.”',
      name: 'Leo E.',
      meta: 'Grade 8 learner, Learnly student',
    },
    faq: {
      kicker: 'A few good questions',
      title: 'Nothing silly <em>about asking.</em>',
      intro: 'Choosing math support is personal. Here are the things families, learners, and teachers ask us first.',
      items: [
        ['How do you match us with a private tutor?', 'Start with a short request so we can understand the learner, the level, and the kind of support that would help. We look at subject expertise, teaching style, availability, and fit before making an introduction.'],
        ['What ages and levels do Learnly tutors support?', 'Our network supports learners from upper elementary through college-prep mathematics, including arithmetic, pre-algebra, algebra, geometry, trigonometry, calculus, and statistics.'],
        ['Are the resources aligned to school curriculum?', 'Yes. Each resource is tagged by skill and age band, then reviewed by a practicing educator. We follow the concepts schools are teaching while leaving room for different teaching approaches.'],
        ['What happens after I send a tutoring request?', 'You will receive a thoughtful follow-up from our matching team, usually within one school day. There is no pressure to book a session before you have met the suggested tutor.'],
      ],
    },
    finalCta: {
      kicker: 'No big leap required',
      title: 'A better math moment can start <em>today.</em>',
      copy: 'Tell us what is going on. We will help you choose a useful next step, not sell you a package.',
      button: 'Request a tutor',
    },
    footer: {
      meta: 'Math support for the way learning really happens.',
      privacyLabel: 'Privacy',
      contactLabel: 'Contact',
      privacy: 'Our privacy page is being written with care.',
      contact: 'Say hello at hello@learnly.example',
    },
    toasts: {
      signIn: 'Family accounts are coming soon.',
      requestSent: 'Your tutoring request is on its way.',
    },
  },
} as const;

const resourceCategories: Record<number, FilterKey> = {
  0: 'foundations',
  1: 'algebra',
  2: 'geometry',
  3: 'data',
  4: 'problemSolving',
};

const symbols = ['⅜', 'x + 4', 'πr²', '↗', '∴'];

function App() {
  const [language, setLanguage] = useState<Language>('tr');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAudience, setActiveAudience] = useState<AudienceKey>('parents');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [requestSent, setRequestSent] = useState(false);
  const [form, setForm] = useState({ audience: 'Aile üyesi', level: 'İlkokul / üst ilkokul', name: '', contact: '', message: '' });
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);
  const t = translations[language];

  useEffect(() => {
    const onScroll = () => document.querySelector('.topbar')?.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    }), { threshold: 0.13 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      audience: t.request.audienceOptions[language === 'tr' ? 0 : 0],
      level: t.request.levelOptions[language === 'tr' ? 0 : 0],
    }));
  }, [language, t.request.audienceOptions, t.request.levelOptions]);

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  };

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const selectedAudience = t.audience[activeAudience];
  const filteredResources = t.resources.cards
    .map((card, index) => ({ card, index }))
    .filter(({ index }) => activeFilter === 'all' || resourceCategories[index] === activeFilter);

  const updateForm = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestSent(true);
    notify(t.toasts.requestSent);
  };

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setMenuOpen(false);
  };

  return (
    <div className="learnly-app">
      <header className={`topbar ${menuOpen ? 'menu-open' : ''}`}>
        <div className="nav-inner">
          <button className="wordmark" onClick={() => goTo('top')} data-testid="button-home" aria-label={t.nav.home}>
            <span className="wordmark-mark" aria-hidden="true" />
            Learnly
          </button>
          <nav className="nav-links" aria-label={t.nav.main}>
            <button className="nav-link" onClick={() => goTo('audiences')} data-testid="link-audiences">{t.nav.audiences}</button>
            <button className="nav-link" onClick={() => goTo('resources')} data-testid="link-resources">{t.nav.resources}</button>
            <button className="nav-link" onClick={() => goTo('faq')} data-testid="link-faq">{t.nav.faq}</button>
          </nav>
          <div className="nav-actions">
            <div className="language-switch" role="group" aria-label={t.nav.language}>
              <button className={language === 'tr' ? 'active' : ''} onClick={() => changeLanguage('tr')} aria-pressed={language === 'tr'} data-testid="button-language-tr">TR</button>
              <button className={language === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')} aria-pressed={language === 'en'} data-testid="button-language-en">EN</button>
            </div>
            <button className="nav-login" onClick={() => notify(t.toasts.signIn)} data-testid="button-sign-in">{t.nav.signIn}</button>
            <button className="button button-primary" onClick={() => goTo('request')} data-testid="button-request-nav">{t.nav.request} <ArrowRight size={15} /></button>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={menuOpen} data-testid="button-mobile-menu">
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container-wide hero-grid">
            <div className="reveal">
              <p className="eyebrow mono">{t.hero.eyebrow}</p>
              <h1 className="display" dangerouslySetInnerHTML={{ __html: t.hero.title }} />
              <p className="hero-copy">{t.hero.copy}</p>
              <div className="hero-ctas">
                <button className="button button-primary" onClick={() => goTo('request')} data-testid="button-request-hero">{t.hero.request} <ArrowDownRight size={16} /></button>
                <button className="button button-ghost" onClick={() => goTo('audiences')} data-testid="button-audiences-hero">{t.hero.seeHow} <ArrowRight size={15} /></button>
              </div>
              <div className="hero-note">
                <span className="avatar-stack" aria-hidden="true"><span className="avatar-a">M</span><span className="avatar-b">J</span><span className="avatar-c">R</span></span>
                <span>{t.hero.trusted}</span>
              </div>
            </div>
            <div className="math-board reveal reveal-delay-2" aria-label={t.hero.boardAria}>
              <div className="math-board-back" />
              <div className="math-card">
                <div className="math-header"><span className="mono">{t.hero.today}</span><span>{t.hero.gradeTime}</span></div>
                <h2 className="math-title display">{t.hero.boardTitle}</h2>
                <div className="math-equation"><span>3x + 4 = 19</span><small>{t.hero.showThinking}</small></div>
                <div className="math-rule" />
                {t.hero.rows.map(([title, detail], index) => (
                  <div className="math-row" key={title}><span className="math-dot">0{index + 1}</span><span><strong>{title}</strong><small>{detail}</small></span></div>
                ))}
              </div>
              <div className="floating-note"><span className="mono">{t.hero.tutorNote}</span><p dangerouslySetInnerHTML={{ __html: t.hero.keepGoing }} /></div>
            </div>
          </div>
        </section>

        <div className="signal">
          <div className="container-wide signal-inner">
            <p>{t.signal.line}</p>
            <div className="signal-list"><span><b>2.700+</b> {t.signal.families}</span><span><b>94</b> {t.signal.tutors}</span><span><b>12</b> {t.signal.areas}</span></div>
          </div>
        </div>

        <section className="section audience-section" id="audiences">
          <div className="container-wide">
            <div className="section-head reveal">
              <div><p className="section-kicker mono">{t.audience.kicker}</p><h2 className="section-title display" dangerouslySetInnerHTML={{ __html: t.audience.title }} /></div>
              <p className="section-intro">{t.audience.intro}</p>
            </div>
            <div className="audience-tabs reveal" role="tablist" aria-label={t.audience.tabLabel}>
              {audienceKeys.map((key) => (
                <button key={key} className={`audience-tab ${activeAudience === key ? 'active' : ''}`} onClick={() => setActiveAudience(key)} role="tab" aria-selected={activeAudience === key} data-testid={`tab-audience-${key}`}>
                  <strong>{t.audience[key].name}</strong><span>{t.audience[key].eyebrow}</span>
                </button>
              ))}
            </div>
            <div className="audience-content reveal reveal-delay-1" role="tabpanel">
              <div>
                <p className="section-kicker mono">{selectedAudience.eyebrow}</p>
                <h3 className="display">{selectedAudience.title}</h3>
                <p>{selectedAudience.description}</p>
                <button className="button button-ghost" onClick={() => goTo(activeAudience === 'teachers' ? 'resources' : 'request')} data-testid={`button-audience-action-${activeAudience}`}>
                  {activeAudience === 'teachers' ? t.audience.actionResources : t.audience.actionRequest} <ArrowRight size={15} />
                </button>
              </div>
              <div className="benefit-list">
                {selectedAudience.benefits.map(([title, copy], index) => (
                  <article className="benefit" key={title}><span>0{index + 1}</span><h4>{title}</h4><p>{copy}</p></article>
                ))}
                <article className="benefit"><span>03</span><h4>{activeAudience === 'teachers' ? t.audience.thirdTeacher : t.audience.thirdGeneral}</h4><p>{activeAudience === 'teachers' ? t.audience.thirdTeacherCopy : t.audience.thirdGeneralCopy}</p></article>
              </div>
            </div>
          </div>
        </section>

        <section className="credibility">
          <div className="container-wide credibility-inner">
            <p>{t.credibility.statement}</p>
            <div className="credibility-list">
              <div><ShieldCheck size={17} /> {t.credibility.vetted}</div>
              <div><GraduationCap size={17} /> {t.credibility.curriculum}</div>
              <div><Users size={17} /> {t.credibility.matching}</div>
            </div>
          </div>
        </section>

        <section className="section resources-section" id="resources">
          <div className="container-wide">
            <div className="section-head reveal">
              <div><p className="section-kicker mono">{t.resources.kicker}</p><h2 className="section-title display" dangerouslySetInnerHTML={{ __html: t.resources.title }} /></div>
              <p className="section-intro">{t.resources.intro}</p>
            </div>
            <div className="resource-filters reveal" role="tablist" aria-label={t.resources.filterLabel}>
              {filterKeys.map((filter) => (
                <button key={filter} className={`resource-filter ${activeFilter === filter ? 'active' : ''}`} onClick={() => setActiveFilter(filter)} role="tab" aria-selected={activeFilter === filter} data-testid={`button-filter-${filter}`}>{t.resources.filters[filter]}</button>
              ))}
            </div>
            <div className="resource-grid">
              {filteredResources.map(({ card, index }) => (
                <article className={`resource-card reveal reveal-delay-${(index % 3) + 1}`} key={card[0]} onClick={() => notify(t.resources.opened.replace('{title}', card[0]))} data-testid={`card-resource-${index}`}>
                  <div className="resource-top"><span className="resource-symbol" aria-hidden="true">{symbols[index]}</span><span className="resource-type mono">{t.resources.filters[resourceCategories[index]]}</span></div>
                  <div><h3 className="display">{card[0]}</h3><p>{card[1]}</p></div>
                  <div className="resource-meta"><span>{card[2]} · {card[3]}</span><strong>{t.resources.open} <ArrowRight size={12} /></strong></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section request-section" id="request">
          <div className="container-wide request-grid">
            <div className="reveal">
              <p className="section-kicker mono">{t.request.kicker}</p>
              <h2 className="section-title display" dangerouslySetInnerHTML={{ __html: t.request.title }} />
              <p className="request-copy">{t.request.copy}</p>
              <p className="request-proof">{t.request.proof}<br /><strong>{t.request.proofBy}</strong></p>
            </div>
            <div className="request-form reveal reveal-delay-1">
              {requestSent ? (
                <div className="form-success" data-testid="status-request-success">
                  <Check size={22} strokeWidth={2.3} />
                  <h3>{t.request.successTitle}</h3>
                  <p>{t.request.successCopy.replace('{name}', form.name || (language === 'tr' ? 'dostum' : 'there'))}</p>
                  <button onClick={() => setRequestSent(false)} data-testid="button-edit-request">{t.request.another}</button>
                </div>
              ) : (
                <form onSubmit={submitRequest}>
                  <div className="form-row">
                    <div className="field"><label htmlFor="request-audience">{t.request.formAudience}</label><select id="request-audience" value={form.audience} onChange={(event) => updateForm('audience', event.target.value)} data-testid="select-request-audience">{t.request.audienceOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
                    <div className="field"><label htmlFor="request-level">{t.request.formLevel}</label><select id="request-level" value={form.level} onChange={(event) => updateForm('level', event.target.value)} data-testid="select-request-level">{t.request.levelOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
                  </div>
                  <div className="form-row">
                    <div className="field"><label htmlFor="request-name">{t.request.formName}</label><input id="request-name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder={t.request.namePlaceholder} data-testid="input-request-name" /></div>
                    <div className="field"><label htmlFor="request-contact">{t.request.formContact}</label><input id="request-contact" required value={form.contact} onChange={(event) => updateForm('contact', event.target.value)} placeholder={t.request.contactPlaceholder} data-testid="input-request-contact" /></div>
                  </div>
                  <div className="field"><label htmlFor="request-message">{t.request.formMessage}</label><textarea id="request-message" required value={form.message} onChange={(event) => updateForm('message', event.target.value)} placeholder={t.request.messagePlaceholder} data-testid="textarea-request-message" /></div>
                  <button className="button button-primary" type="submit" data-testid="button-submit-request">{t.request.submit} <ArrowRight size={15} /></button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="quote-section">
          <div className="container-wide quote-wrap reveal"><p className="quote display" dangerouslySetInnerHTML={{ __html: t.quote.text }} /><div className="quote-by"><span className="quote-face">LE</span><span><strong>{t.quote.name}</strong><br />{t.quote.meta}</span></div></div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="container-wide faq-grid">
            <div className="reveal"><p className="section-kicker mono">{t.faq.kicker}</p><h2 className="section-title display" dangerouslySetInnerHTML={{ __html: t.faq.title }} /><p className="section-intro" style={{ marginTop: 24 }}>{t.faq.intro}</p></div>
            <div className="faq-list reveal reveal-delay-1">
              {t.faq.items.map(([question, answer], index) => (
                <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}>
                  <button className="faq-button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} data-testid={`button-faq-${index}`}><span>{question}</span><ChevronDown size={18} /></button>
                  <div className="faq-answer">{answer}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container-wide final-inner reveal"><div><p className="mono">{t.finalCta.kicker}</p><h2 className="display" dangerouslySetInnerHTML={{ __html: t.finalCta.title }} /></div><div><p>{t.finalCta.copy}</p><button className="button button-primary" onClick={() => goTo('request')} data-testid="button-request-final">{t.finalCta.button} <ArrowRight size={15} /></button></div></div>
        </section>
      </main>

      <footer className="footer">
        <div className="container-wide footer-inner"><button className="wordmark" onClick={() => goTo('top')} data-testid="button-footer-home"><span className="wordmark-mark" aria-hidden="true" />Learnly</button><span className="footer-meta">{t.footer.meta}</span><div className="footer-links"><button onClick={() => notify(t.footer.privacy)} data-testid="button-privacy">{t.footer.privacyLabel}</button><button onClick={() => notify(t.footer.contact)} data-testid="button-contact">{t.footer.contactLabel}</button></div></div>
      </footer>
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite" data-testid="status-toast">{toast || ' '}</div>
    </div>
  );
}

export default App;