import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Instagram,
  Menu,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

type Language = 'tr' | 'en';
type AudienceKey = 'parents' | 'students' | 'teachers' | 'examPrep' | 'adultLearners';
type FilterKey =
  | 'all'
  | 'foundations'
  | 'algebra'
  | 'geometry'
  | 'data'
  | 'problemSolving'
  | 'examStrategy'
  | 'mentalMath'
  | 'accessibility'
  | 'everyday';

const audienceKeys: AudienceKey[] = ['parents', 'students', 'teachers', 'examPrep', 'adultLearners'];
const filterKeys: FilterKey[] = [
  'all',
  'foundations',
  'algebra',
  'geometry',
  'data',
  'problemSolving',
  'examStrategy',
  'mentalMath',
  'accessibility',
  'everyday',
];

const translations = {
  tr: {
    nav: {
      audiences: 'Kimin için',
      resources: 'Matematik kaynakları',
      story: 'Hikâyemiz',
      faq: 'Sorular',
      signIn: 'Giriş yap',
      request: 'Matematik eğitmeni bul',
      language: 'Dil seçimi',
      home: 'Pinin Peşinde Matematik ana sayfa',
      openMenu: 'Menüyü aç',
      closeMenu: 'Menüyü kapat',
      main: 'Ana navigasyon',
    },
    hero: {
      eyebrow: 'Günlük hayat için matematik desteği',
      title: 'Matematikte iyi hissetmenin daha net bir yolu.',
      copy: 'Pinin Peşinde Matematik; aileleri özenli özel eğitmenlerle buluşturur, öğrencilerin güvenini güçlendiren rehberli pratikler sunar ve öğretmenlerin kullanımına güvenilir kaynaklar bırakır.',
      request: 'Eğitmen talep et',
      seeHow: 'Nasıl yardımcı oluyoruz?',
      trusted: '2.700’den fazla aile tarafından güvenilen, seçilmiş eğitimciler',
      boardAria: 'Pinin Peşinde Matematik rehberli dersinden bir önizleme',
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
      areas: 'öğrenme alanı',
    },
    audience: {
      kicker: 'Başlamak için bir yer',
      title: 'İhtiyacın olduğu ana <em>uygun destek.</em>',
      intro: 'Ailelerin, öğrencilerin, öğretmenlerin ve matematiğe yeniden dönen yetişkinlerin ihtiyacı farklıdır. Kendi bakış açınızı seçin.',
      tabLabel: 'Pinin Peşinde Matematik toplulukları',
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
      examPrep: {
        name: 'Sınava hazırlananlar',
        eyebrow: 'Hedefine planla ilerleyenler için',
        title: 'Sınav telaşını anlaşılır bir plana çevirin.',
        description: 'LGS, YKS, okul yazılıları veya başka bir hedef için konu haritası çıkarın; süre yönetimini, soru stratejisini ve eksiklerinizi birlikte çalışın.',
        benefits: [
          ['Sınav stratejisi', 'Soru seçimi, süre bölüşümü ve deneme sonrası düşünme için size uyan rutinler.'],
          ['Eksikten hedefe', 'Kısa tanılamalarla hangi konunun gerçekten sıradaki adım olduğunu görün.'],
        ],
      },
      adultLearners: {
        name: 'Yetişkin öğrenenler',
        eyebrow: 'Matematiğe yeniden dönenler için',
        title: 'Geç kalmış değilsiniz; yeniden başlayabilirsiniz.',
        description: 'Günlük hayat, iş, üniversite ya da merakınız için matematiğe dönün. Yargısız, tempolu ve önceki deneyiminizi hesaba katan bir destek bulun.',
        benefits: [
          ['Temeli kendi hızınızda kurun', 'İhtiyaç duyduğunuz konuyu utanmadan, sağlam bir başlangıçla ele alın.'],
          ['Gerçek hayata taşıyın', 'Bütçe, ölçü, oran ve verilerle matematiğin gündelik karşılığını görün.'],
        ],
      },
      actionResources: 'Kaynaklara göz at',
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
    story: {
      kicker: 'Kurucudan bir not',
      title: 'Matematiği <em>birlikte</em> arıyoruz.',
      copy: 'Pinin Peşinde Matematik, “Ben matematik insanı değilim” cümlesini daha başlamadan değiştirmek için kuruldu. Kurucumuz, öğrenmenin yalnızca doğru cevabı bulmak değil; iyi bir soru sormak, düşünmeye zaman ayırmak ve bir başkasının yanında yeniden denemek olduğunu biliyor.',
      note: 'Her yaşta, her başlangıçta, aynı merakla.',
      instagramLabel: 'Instagram’da bizi takip edin',
      instagramHandle: '@pininpesindematematik',
      instagramAria: 'Pinin Peşinde Matematik Instagram hesabını yeni sekmede aç',
    },
    resources: {
      kicker: 'Kaynak rafı',
      title: 'İyi matematik içeriği, <em>ihtiyacınız olduğunda hazır.</em>',
      intro: 'Mutfak masasındaki çalışmadan yarının dersine, sınav stratejisinden bütçe hesabına kadar farklı başlangıçlara uygun kısa ve işe yarar kaynaklar.',
      filterLabel: 'Matematik kaynaklarını filtrele',
      filters: {
        all: 'Tüm kaynaklar',
        foundations: 'Temeller',
        algebra: 'Cebir',
        geometry: 'Geometri',
        data: 'Veri okuryazarlığı',
        problemSolving: 'Problem çözme',
        examStrategy: 'Sınav stratejisi',
        mentalMath: 'Zihinden matematik',
        accessibility: 'Erişilebilir öğrenme',
        everyday: 'Günlük matematik',
      },
      cards: [
        ['Kesirlerin sisini dağıtmak', 'Bir bütünün parçalarından farklı paydalı kesirleri karşılaştırmaya görsel bir yol.', '4–6. sınıf', '12 dk', 'foundations'],
        ['Zihinden hesap için küçük kestirmeler', 'Alışverişte, yolculukta ve sınıfta sayıları daha esnek düşünmek için kısa rutinler.', 'Tüm seviyeler', '7 dk', 'mentalMath'],
        ['Cebirsel düşünme ısınması', 'Örüntüleri işe yarayan denklemlere dönüştüren, eşiği düşük beş soru.', '6–8. sınıf', '8 dk', 'algebra'],
        ['π ile daha iyi tanışmak', 'Çemberleri, ipi ve şaşırtıcı bir oranı kullanarak bu sabiti akılda kalıcı hâle getirin.', '7–9. sınıf', '15 dk', 'geometry'],
        ['Gerçek hayat grafiğini okumak', 'Grafikler, eksenler ve gürültülü veriler hakkında daha iyi sorular sormayı deneyin.', '5–8. sınıf', '10 dk', 'data'],
        ['Bir soru, üç strateji', 'Ne işe yaradığını değil, neden işe yaradığını anlatmak için eğitmen eşliğinde bir rutin.', 'Tüm seviyeler', '18 dk', 'problemSolving'],
        ['Deneme sonrası sakin inceleme', 'Yanlışları puan değil, bir sonraki çalışma adımını gösteren ipuçlarına dönüştürün.', 'LGS · YKS', '14 dk', 'examStrategy'],
        ['Herkes için matematik dili', 'Okuma, görme ve işlemleme farklılıklarını gözeten yönerge ve temsil fikirleri.', 'Eğitimciler', '11 dk', 'accessibility'],
        ['Bir tarifin oranlarını değiştirmek', 'Ölçüleri, oranları ve tahmini kullanarak matematiği mutfağın içine taşıyın.', 'Aileler · yetişkinler', '9 dk', 'everyday'],
      ],
      open: 'Aç',
      opened: '“{title}” açıldı.',
    },
    request: {
      kicker: 'Bir sohbetle başlayın',
      title: 'Doğru sonraki <em>adımı bulalım.</em>',
      copy: 'Öğrenen ve son zamanlarda zor gelen konular hakkında biraz bilgi paylaşın. Ekibimizden gerçek bir kişi okuyacak ve özenli bir eğitmen eşleşmesiyle size dönüş yapacak.',
      proof: '“Çocuğumun ilk kez ‘Buna nasıl başlayacağımı biliyorum’ dediği an, doğru desteği bulduğumuzu anladım.”',
      proofBy: '— Nina, Pinin Peşinde Matematik ailesi',
      formAudience: 'Ben bir…',
      formLevel: 'Matematik seviyesi',
      formGoals: 'Öncelikli hedefler',
      goalsHint: 'Birden fazla seçebilirsiniz',
      formName: 'Adınız',
      formContact: 'E-posta veya telefon',
      formMessage: 'Matematiği ne daha iyi hissettirirdi?',
      namePlaceholder: 'Nina Patel',
      contactPlaceholder: 'nina@eposta.com',
      messagePlaceholder: 'Üzerinde çalışılan konuyu, nerede takıldığınızı veya neyin değişmesini umduğunuzu anlatın.',
      audienceOptions: ['Aile üyesi', 'Öğrenci', 'Öğretmen', 'Sınava hazırlanan', 'Yetişkin öğrenen'],
      levelOptions: ['İlkokul / üst ilkokul', 'Ortaokul', 'Lise', 'Üniversite / yetişkin öğrenen'],
      goalOptions: ['Okul desteği', 'Sınava hazırlık', 'Temel beceriler', 'İleri matematik', 'Ödev ve çalışma alışkanlıkları', 'Özgüven geliştirme', 'Öğretmen / sınıf desteği'],
      submit: 'Eğitmen talebini gönder',
      successTitle: 'Notunuzu aldık.',
      successCopy: 'Teşekkürler, {name}. Eşleştirme ekibimiz bir okul günü içinde düşünülmüş bir sonraki adımla size ulaşacak.',
      another: 'Yeni bir talep gönder',
    },
    quote: {
      text: '“Matematikte hızlı olmaya çalışmayı bıraktım. Onu anlamaya çalışmaya başladım.”',
      name: 'Leo E.',
      meta: '8. sınıf öğrencisi, Pinin Peşinde Matematik öğrencisi',
    },
    faq: {
      kicker: 'Birkaç güzel soru',
      title: 'Sormanın <em>yanlış bir tarafı yok.</em>',
      intro: 'Matematik desteği seçmek kişisel bir karardır. Ailelerin, öğrenenlerin, eğitimcilerin ve yetişkinlerin bize ilk sorduğu şeyler burada.',
      items: [
        ['Bizi özel bir eğitmenle nasıl eşleştiriyorsunuz?', 'Öğreneni, seviyeyi ve hangi desteğin işe yarayacağını anlamak için kısa bir taleple başlayın. Tanıştırmadan önce konu uzmanlığını, öğretme biçimini, uygunluk durumunu ve uyumu birlikte değerlendiririz.'],
        ['Sınava hazırlık desteği nasıl ilerliyor?', 'Hedef sınavı ve tarihi birlikte netleştirir, konu önceliklerini çıkarır ve deneme analizini çalışma planına dönüştürürüz. Strateji, süre yönetimi ve konu eksiği aynı resmin parçasıdır.'],
        ['Matematiğe yetişkin olarak yeniden başlayabilir miyim?', 'Elbette. Başlangıç noktanızı yargılamadan belirler, günlük hayat veya iş hedefinizle bağlantılı bir tempoda temel becerileri yeniden kurarız.'],
        ['Kaynaklar okul müfredatıyla uyumlu mu?', 'Evet. Her kaynak beceri, yaş aralığı ve kullanım amacına göre etiketlenir, ardından aktif bir eğitimci tarafından incelenir.'],
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
      contact: 'Bize hello@pininpesindematematik.example adresinden ulaşın',
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
      story: 'Our story',
      faq: 'Questions',
      signIn: 'Sign in',
      request: 'Find a math tutor',
      language: 'Language selection',
      home: 'Pinin Peşinde Matematik home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      main: 'Main navigation',
    },
    hero: {
      eyebrow: 'Math support for real life',
      title: 'A clearer way to <em>feel</em> good at math.',
      copy: 'Pinin Peşinde Matematik helps families find thoughtful private tutors, gives students guided practice that builds confidence, and puts trusted resources in educators’ hands.',
      request: 'Request a tutor',
      seeHow: 'See how we help',
      trusted: 'Vetted educators, trusted by 2,700+ families',
      boardAria: 'A preview of a Pinin Peşinde Matematik guided math lesson',
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
      areas: 'learning areas',
    },
    audience: {
      kicker: 'A place to start',
      title: 'Support that meets <em>the moment.</em>',
      intro: 'Families, students, teachers, exam learners, and adults returning to math all need different things. Choose your view.',
      tabLabel: 'Pinin Peşinde Matematik communities',
      parents: {
        name: 'Families',
        eyebrow: 'For the people in their corner',
        title: 'Find a tutor who sees the whole child.',
        description: 'Tell us what your learner needs, and we will introduce you to thoughtful, vetted math tutors who teach with patience, clarity, and a plan.',
        benefits: [['A considered match', 'Tutor recommendations shaped around level, goals, personality, and availability.'], ['Clear progress notes', 'Know what clicked, what needs practice, and what to do next after each session.']],
      },
      students: {
        name: 'Students',
        eyebrow: 'For the quietly determined',
        title: 'Make math feel possible again.',
        description: 'Build confidence one good question at a time with guided practice, friendly explanations, and tutors who never make you feel behind.',
        benefits: [['Practice with purpose', 'Short, focused problems that help you notice the idea underneath the answer.'], ['A place to ask', 'Bring the question you were afraid to ask in class. We will start exactly there.']],
      },
      teachers: {
        name: 'Teachers',
        eyebrow: 'For people who teach the thinking',
        title: 'Resources you can put to work tomorrow.',
        description: 'Browse curriculum-aligned tasks, explanations, and classroom prompts made by practicing math educators—not content factories.',
        benefits: [['Curriculum aligned', 'Resources mapped to familiar learning goals across elementary, middle, and high school.'], ['Worth your trust', 'Every activity is reviewed for mathematical accuracy, accessibility, and real classroom use.']],
      },
      examPrep: {
        name: 'Exam prep',
        eyebrow: 'For focused, steady progress',
        title: 'Turn exam pressure into a clear plan.',
        description: 'For LGS, YKS, school tests, or another goal, map the topics, practice timing, and review mistakes with a tutor who keeps the plan human.',
        benefits: [['Exam strategy', 'Question selection, pacing, and post-practice reflection built around your habits.'], ['From gaps to goals', 'Short check-ins reveal which topic is truly the next step.']],
      },
      adultLearners: {
        name: 'Adult learners',
        eyebrow: 'For people returning to math',
        title: 'It is not too late to begin again.',
        description: 'Return to math for daily life, work, university, or curiosity with support that respects your experience, your pace, and your starting point.',
        benefits: [['Build the base at your pace', 'Work on the topic you need without shame, with a steady beginning.'], ['Carry it into life', 'See the everyday meaning of budgets, measurement, ratios, and data.']],
      },
      actionResources: 'Browse resources',
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
    story: {
      kicker: 'A note from the founder',
      title: 'We are following math <em>together.</em>',
      copy: 'Pinin Peşinde Matematik was started to change the sentence “I am not a math person” before it stops someone from beginning. Our founder believes learning is not only finding the right answer; it is asking a useful question, making room to think, and trying again beside someone.',
      note: 'Every age, every starting point, the same curiosity.',
      instagramLabel: 'Follow along on Instagram',
      instagramHandle: '@pininpesindematematik',
      instagramAria: 'Open the Pinin Peşinde Matematik Instagram account in a new tab',
    },
    resources: {
      kicker: 'The resource shelf',
      title: 'Good math content, <em>ready when you are.</em>',
      intro: 'Short, useful resources for the kitchen table, tomorrow’s lesson, exam strategy, everyday budgets, and many ways of learning.',
      filterLabel: 'Filter math resources',
      filters: {
        all: 'All resources',
        foundations: 'Foundations',
        algebra: 'Algebra',
        geometry: 'Geometry',
        data: 'Data literacy',
        problemSolving: 'Problem solving',
        examStrategy: 'Exam strategy',
        mentalMath: 'Mental math',
        accessibility: 'Accessible learning',
        everyday: 'Everyday math',
      },
      cards: [
        ['Fractions without the fog', 'A visual route from parts of a whole to comparing unlike fractions.', 'Grades 4–6', '12 min', 'foundations'],
        ['Small shortcuts for mental math', 'Flexible number routines for shopping, travel, and the classroom.', 'All levels', '7 min', 'mentalMath'],
        ['The algebraic thinking warm-up', 'Five low-floor prompts that turn patterns into useful equations.', 'Grades 6–8', '8 min', 'algebra'],
        ['A better way to meet π', 'Use circles, string, and one surprising ratio to make the constant stick.', 'Grades 7–9', '15 min', 'geometry'],
        ['Reading a real-world graph', 'Help learners ask better questions of charts, axes, and noisy data.', 'Grades 5–8', '10 min', 'data'],
        ['One problem, three strategies', 'A tutor-led routine for explaining not only what works, but why.', 'All levels', '18 min', 'problemSolving'],
        ['A calm review after a practice test', 'Turn missed questions into clues for the next study step, not a score.', 'LGS · YKS', '14 min', 'examStrategy'],
        ['A math language for everyone', 'Prompting and representation ideas that respect different ways of reading, seeing, and processing.', 'Educators', '11 min', 'accessibility'],
        ['Changing the ratio in a recipe', 'Bring measurement, ratios, and estimation into the kitchen and daily life.', 'Families · adults', '9 min', 'everyday'],
      ],
      open: 'Open',
      opened: 'Opened “{title}”.',
    },
    request: {
      kicker: 'Start with a conversation',
      title: 'Let’s find the <em>right next step.</em>',
      copy: 'Share a little about the learner and what has been hard lately. A real person on our team will read it and follow up with a considered tutor match.',
      proof: '“The first time my daughter said, ‘I know how to start this,’ I knew we had found the right support.”',
      proofBy: '— Nina, Pinin Peşinde Matematik family',
      formAudience: 'I am a…',
      formLevel: 'Math level',
      formGoals: 'Priority goals',
      goalsHint: 'Choose as many as you like',
      formName: 'Your name',
      formContact: 'Email or phone',
      formMessage: 'What would make math feel better?',
      namePlaceholder: 'Nina Patel',
      contactPlaceholder: 'nina@email.com',
      messagePlaceholder: 'Tell us what they are working on, what feels stuck, or what you hope will change.',
      audienceOptions: ['Family member', 'Student', 'Teacher', 'Exam learner', 'Adult learner'],
      levelOptions: ['Elementary / upper elementary', 'Middle school', 'High school', 'College / adult learner'],
      goalOptions: ['School support', 'Exam preparation', 'Foundational skills', 'Advanced mathematics', 'Homework and study habits', 'Confidence building', 'Teacher / classroom support'],
      submit: 'Send tutoring request',
      successTitle: 'We have your note.',
      successCopy: 'Thanks, {name}. Our matching team will be in touch within one school day with a thoughtful next step.',
      another: 'Send another request',
    },
    quote: {
      text: '“I stopped trying to be <em>fast</em> at math. I started trying to understand it.”',
      name: 'Leo E.',
      meta: 'Grade 8 learner, Pinin Peşinde Matematik student',
    },
    faq: {
      kicker: 'A few good questions',
      title: 'Nothing silly <em>about asking.</em>',
      intro: 'Choosing math support is personal. Here are the things families, learners, educators, and adults ask us first.',
      items: [
        ['How do you match us with a private tutor?', 'Start with a short request so we can understand the learner, the level, and the kind of support that would help. We look at subject expertise, teaching style, availability, and fit before making an introduction.'],
        ['How does exam preparation work?', 'We clarify the target and date, map topic priorities, and turn practice-test review into a study plan. Strategy, pacing, and content gaps are all part of the picture.'],
        ['Can I return to math as an adult?', 'Absolutely. We find your starting point without judgment and rebuild the skills you need at a pace connected to daily life, work, or study.'],
        ['Are the resources aligned to school curriculum?', 'Yes. Each resource is tagged by skill, age band, and use case, then reviewed by a practicing educator.'],
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
      contact: 'Say hello at hello@pininpesindematematik.example',
    },
    toasts: {
      signIn: 'Family accounts are coming soon.',
      requestSent: 'Your tutoring request is on its way.',
    },
  },
} as const;

const symbols = ['⅜', '≈', 'x + 4', 'πr²', '↗', '∴', '15:40', '□', '%'];

function App() {
  const [language, setLanguage] = useState<Language>('tr');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAudience, setActiveAudience] = useState<AudienceKey>('parents');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [requestSent, setRequestSent] = useState(false);
  const [form, setForm] = useState({
    audience: 'Aile üyesi',
    level: 'İlkokul / üst ilkokul',
    goals: [] as string[],
    name: '',
    contact: '',
    message: '',
  });
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
  }, [language, activeFilter, activeAudience]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      audience: t.request.audienceOptions[0],
      level: t.request.levelOptions[0],
      goals: [],
    }));
  }, [language]);

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
  const filteredResources = t.resources.cards.filter((card) => activeFilter === 'all' || card[4] === activeFilter);
  const updateForm = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const toggleGoal = (goal: string) => setForm((current) => ({
    ...current,
    goals: current.goals.includes(goal) ? current.goals.filter((item) => item !== goal) : [...current.goals, goal],
  }));

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
            <span className="wordmark-copy"><strong>Learnly</strong><small>Pinin Peşinde Matematik</small></span>
          </button>
          <nav className="nav-links" aria-label={t.nav.main}>
            <button className="nav-link" onClick={() => goTo('audiences')} data-testid="link-audiences">{t.nav.audiences}</button>
            <button className="nav-link" onClick={() => goTo('resources')} data-testid="link-resources">{t.nav.resources}</button>
            <button className="nav-link" onClick={() => goTo('story')} data-testid="link-story">{t.nav.story}</button>
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

        <section className="section story-section" id="story">
          <div className="container-wide story-grid">
            <div className="story-paper reveal">
              <span className="story-mark" aria-hidden="true">∴</span>
              <p className="story-hand">{t.story.note}</p>
              <div className="story-line" />
              <p className="mono">Pinin Peşinde Matematik</p>
            </div>
            <div className="story-copy reveal reveal-delay-1">
              <p className="section-kicker mono">{t.story.kicker}</p>
              <h2 className="section-title display" dangerouslySetInnerHTML={{ __html: t.story.title }} />
              <p>{t.story.copy}</p>
              <a className="instagram-link" href="https://www.instagram.com/pininpesindematematik/" target="_blank" rel="noreferrer" aria-label={t.story.instagramAria} data-testid="link-instagram">
                <span className="instagram-icon"><Instagram size={18} /></span>
                <span><strong>{t.story.instagramLabel}</strong><small>{t.story.instagramHandle}</small></span>
                <ExternalLink size={15} />
              </a>
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
              {filteredResources.map((card, index) => (
                <article className={`resource-card reveal reveal-delay-${(index % 3) + 1}`} key={card[0]} onClick={() => notify(t.resources.opened.replace('{title}', card[0]))} data-testid={`card-resource-${index}`}>
                  <div className="resource-top"><span className="resource-symbol" aria-hidden="true">{symbols[index % symbols.length]}</span><span className="resource-type mono">{t.resources.filters[card[4]]}</span></div>
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
                  <fieldset className="goals-field"><legend>{t.request.formGoals} <small>{t.request.goalsHint}</small></legend><div className="goal-options">{t.request.goalOptions.map((goal) => <label className={`goal-option ${form.goals.includes(goal) ? 'selected' : ''}`} key={goal}><input type="checkbox" checked={form.goals.includes(goal)} onChange={() => toggleGoal(goal)} data-testid={`checkbox-goal-${goal}`} /><span>{goal}</span></label>)}</div></fieldset>
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
        <div className="container-wide footer-inner"><button className="wordmark" onClick={() => goTo('top')} data-testid="button-footer-home"><span className="wordmark-mark" aria-hidden="true" /><span className="wordmark-copy"><strong>Learnly</strong><small>Pinin Peşinde Matematik</small></span></button><span className="footer-meta">{t.footer.meta}</span><div className="footer-links"><button onClick={() => notify(t.footer.privacy)} data-testid="button-privacy">{t.footer.privacyLabel}</button><button onClick={() => notify(t.footer.contact)} data-testid="button-contact">{t.footer.contactLabel}</button></div></div>
      </footer>
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite" data-testid="status-toast">{toast || ' '}</div>
    </div>
  );
}

export default App;