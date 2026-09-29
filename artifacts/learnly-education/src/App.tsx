import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Instagram,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { authErrorMessage, fetchMe, loginUser, logoutUser, registerUser, type AuthUser, type Role } from '@/lib/auth';
import { listUploadedResources, resourceFileUrl, uploadResource } from '@/lib/resources-api';
import {
  createExamAttempt,
  deleteExamAttempt,
  listExamAttempts,
  YKS_EXAM_TYPES,
  YKS_SUBJECTS,
  type ExamSubjectInput,
  type YksExamType,
} from '@/lib/exams-api';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  getListLearningContentQueryKey,
  getListNotificationsQueryKey,
  useCreateLearningContent,
  useListLearningContent,
  useListNotifications,
  useMarkNotificationRead,
} from '@workspace/api-client-react';
import type { LearningContentInputContentType } from '@workspace/api-client-react';

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

type WorkspaceRole = 'teacher' | 'student' | 'parent' | 'examAnalysis';
const roleKeys: WorkspaceRole[] = ['teacher', 'student', 'parent', 'examAnalysis'];

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
const resourceCategoryKeys = filterKeys.filter((key): key is Exclude<FilterKey, 'all'> => key !== 'all');
const authRoleKeys: Role[] = ['teacher', 'parent', 'student'];

const translations = {
  tr: {
    nav: {
      audiences: 'Kimin için',
      resources: 'Matematik kaynakları',
      story: 'Hikâyemiz',
      faq: 'Sorular',
      workspace: 'Çalışma alanı',
      signIn: 'Giriş yap',
      request: 'Matematik eğitmeni bul',
      language: 'Dil seçimi',
      home: 'Pinin Peşinde Matematik ana sayfa',
      openMenu: 'Menüyü aç',
      closeMenu: 'Menüyü kapat',
      main: 'Ana navigasyon',
    },
    auth: {
      loginTitle: 'Giriş yap',
      registerTitle: 'Hesap oluştur',
      loginTab: 'Giriş yap',
      registerTab: 'Kayıt ol',
      nameLabel: 'Ad soyad',
      namePlaceholder: 'Ayşe Öğretmen',
      emailLabel: 'E-posta',
      emailPlaceholder: 'ornek@eposta.com',
      passwordLabel: 'Şifre',
      passwordHint: 'En az 8 karakter',
      roleLabel: 'Hesap türü',
      roleOptions: { teacher: 'Öğretmen', parent: 'Veli', student: 'Öğrenci' },
      submitLogin: 'Giriş yap',
      submitRegister: 'Hesap oluştur',
      submitting: 'Gönderiliyor…',
      switchToRegister: 'Hesabınız yok mu? Kayıt olun',
      switchToLogin: 'Zaten hesabınız var mı? Giriş yapın',
      close: 'Kapat',
      loggedInAs: 'Hoş geldin, {name}',
      logout: 'Çıkış yap',
      genericError: 'Bir şeyler ters gitti, lütfen tekrar deneyin.',
      loginSuccess: 'Giriş yapıldı.',
      registerSuccess: 'Hesabınız oluşturuldu.',
      logoutSuccess: 'Çıkış yapıldı.',
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
        description: 'İçerik fabrikaları değil, aktif olarak matematik öğreten eğitimciler tarafından hazırlanan; Türkiye Yüzyılı Maarif Modeli’nin beceri temelli yaklaşımıyla uyumlu etkinlikleri, açıklamaları ve sınıf fikirlerini keşfedin.',
        benefits: [
          ['Maarif Modeli’ne uyumlu', 'İlkokul, ortaokul ve lise kademelerindeki güncel öğrenme çıktılarıyla ve beceri çerçevesiyle eşleşen kaynaklar.'],
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
      pdfBadge: 'PDF',
      download: 'İndir',
      uploadedBy: 'Yükleyen',
      loadError: 'Kaynaklar yüklenemedi.',
      retry: 'Tekrar dene',
      upload: {
        heading: 'Kaynak yükle',
        intro: 'Öğretmenler, ders notu ve çalışma kâğıtlarını PDF olarak buraya yükleyebilir — bu rafta anında herkese görünür olur.',
        loginPrompt: 'Kaynak yüklemek için öğretmen hesabıyla giriş yapmalısınız.',
        loginCta: 'Giriş yap',
        rolePrompt: 'Kaynak yükleme yalnızca öğretmen hesaplarına açıktır.',
        titleLabel: 'Başlık',
        titlePlaceholder: 'Kesirler Çalışma Kâğıdı',
        descriptionLabel: 'Açıklama',
        descriptionPlaceholder: 'Bu kaynağın ne içerdiğini kısaca anlatın.',
        levelLabel: 'Seviye',
        levelPlaceholder: 'ör. 5–6. sınıf',
        categoryLabel: 'Kategori',
        fileLabel: 'PDF dosyası',
        fileHint: 'Yalnızca PDF, en fazla 15MB',
        submit: 'Yükle',
        submitting: 'Yükleniyor…',
        success: 'Kaynak yayınlandı.',
        error: 'Yükleme başarısız oldu.',
      },
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
      levelOptions: ['İlkokul (1–4. sınıf)', 'Ortaokul (5–8. sınıf)', 'Lise (9–12. sınıf)', 'Üniversite / yetişkin öğrenen'],
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
        ['Kaynaklar okul müfredatıyla uyumlu mu?', 'Evet. Kaynaklarımızı Türkiye Yüzyılı Maarif Modeli’nin beceri çerçevesini gözeterek hazırlıyoruz; her biri kademe, yaş aralığı ve kullanım amacına göre etiketlenir, ardından aktif bir eğitimci tarafından incelenir.'],
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
    workspace: {
      kicker: 'Ortak öğrenme alanı',
      title: 'Dersin ötesinde, birlikte ilerleyin.',
      intro: 'Öğretmenlerin paylaştığı içerikleri keşfedin, öğrenciler için sıradaki adımı görün ve veliler olarak önemli duyuruları kaçırmayın.',
      tabLabel: 'Çalışma alanı rolleri',
      roles: {
        teacher: 'Öğretmen paneli',
        student: 'Öğrenci paneli',
        parent: 'Veli paneli',
        examAnalysis: 'Deneme analizi',
      },
      teacher: {
        label: 'Yeni içerik yayınla',
        title: 'Başlık',
        titlePlaceholder: 'Örneğin: Kesirleri görselleştirme',
        description: 'Açıklama',
        descriptionPlaceholder: 'İçeriğin ne öğrettiğini ve nasıl kullanılacağını kısaca anlatın.',
        type: 'İçerik türü',
        level: 'Seviye',
        levelPlaceholder: 'Örneğin: 6–8. sınıf',
        author: 'Yayınlayan',
        authorPlaceholder: 'Adınız',
        publish: 'İçeriği yayınla',
        publishing: 'Yayınlanıyor…',
        success: 'İçerik yayınlandı. Öğrenciler ve veliler kısa süre içinde görebilir.',
        types: {
          lesson: 'Ders',
          practice: 'Pratik',
          resource: 'Kaynak',
          announcement: 'Duyuru',
        },
      },
      examAnalysis: {
        label: 'YKS deneme takibi',
        intro: 'TYT ve AYT denemelerinin branş bazlı doğru/yanlış/boş sayılarını girin, netlerinizin zaman içindeki değişimini görün.',
        loginPrompt: 'Deneme sonucu eklemek için öğrenci hesabıyla giriş yapmalısınız.',
        loginCta: 'Giriş yap',
        rolePrompt: 'Deneme analizi, kayıtları kişisel tutabilmek için yalnızca öğrenci hesaplarına açıktır.',
        examType: 'Sınav türü',
        examTypes: {
          TYT: 'TYT',
          AYT_SAY: 'AYT — Sayısal',
          AYT_EA: 'AYT — Eşit Ağırlık',
          AYT_SOZ: 'AYT — Sözel',
          AYT_DIL: 'AYT — Dil (YDT)',
        },
        examDate: 'Tarih',
        examName: 'Deneme adı (opsiyonel)',
        examNamePlaceholder: 'Örneğin: 3D Yayınları 5. Deneme',
        correct: 'Doğru',
        wrong: 'Yanlış',
        blank: 'Boş',
        net: 'Net',
        totalNet: 'Toplam net',
        submit: 'Denemeyi kaydet',
        submitting: 'Kaydediliyor…',
        success: 'Deneme kaydedildi.',
        error: 'Deneme kaydedilemedi.',
        chartTitle: 'Net gelişimi',
        historyTitle: 'Geçmiş denemeler',
        empty: 'Henüz eklenmiş bir deneme yok.',
        emptyDetail: 'İlk denemenizi ekleyerek net gelişiminizi takip etmeye başlayın.',
        delete: 'Sil',
        deleted: 'Deneme silindi.',
        overLimit: 'soru sayısını aşamaz',
      },
      student: {
        label: 'Yeni yayınlar',
        refresh: 'Otomatik yenilenir',
        refreshDetail: 'Yeni içerikler yaklaşık 15 saniyede görünür.',
        empty: 'Henüz yayınlanmış içerik yok.',
        emptyDetail: 'Bir öğretmen içerik yayınladığında burada görünecek.',
        by: 'Yayınlayan',
      },
      parent: {
        label: 'Bildirimler',
        unread: 'okunmamış',
        empty: 'Yeni bildiriminiz yok.',
        emptyDetail: 'Yeni bir içerik yayınlandığında burada bilgi göreceksiniz.',
        markRead: 'Okundu olarak işaretle',
        markedRead: 'Okundu',
      },
      loading: 'Yükleniyor',
      error: 'İçerik yüklenemedi.',
      retry: 'Tekrar dene',
      contentTypes: {
        lesson: 'Ders',
        practice: 'Pratik',
        resource: 'Kaynak',
        announcement: 'Duyuru',
      },
      published: 'Yayınlandı',
    },
  },
  en: {
    nav: {
      audiences: 'Who it is for',
      resources: 'Math resources',
      story: 'Our story',
      faq: 'Questions',
      workspace: 'Learning workspace',
      signIn: 'Sign in',
      request: 'Find a math tutor',
      language: 'Language selection',
      home: 'Pinin Peşinde Matematik home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      main: 'Main navigation',
    },
    auth: {
      loginTitle: 'Sign in',
      registerTitle: 'Create an account',
      loginTab: 'Sign in',
      registerTab: 'Sign up',
      nameLabel: 'Full name',
      namePlaceholder: 'Ada Lovelace',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordHint: 'At least 8 characters',
      roleLabel: 'Account type',
      roleOptions: { teacher: 'Teacher', parent: 'Parent', student: 'Student' },
      submitLogin: 'Sign in',
      submitRegister: 'Create account',
      submitting: 'Submitting…',
      switchToRegister: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Sign in',
      close: 'Close',
      loggedInAs: 'Welcome, {name}',
      logout: 'Sign out',
      genericError: 'Something went wrong, please try again.',
      loginSuccess: 'Signed in.',
      registerSuccess: 'Your account was created.',
      logoutSuccess: 'Signed out.',
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
      pdfBadge: 'PDF',
      download: 'Download',
      uploadedBy: 'Uploaded by',
      loadError: 'Could not load resources.',
      retry: 'Retry',
      upload: {
        heading: 'Upload a resource',
        intro: 'Teachers can upload lesson notes and worksheets as a PDF — it appears on this shelf for everyone right away.',
        loginPrompt: 'Sign in with a teacher account to upload resources.',
        loginCta: 'Sign in',
        rolePrompt: 'Uploading resources is only available to teacher accounts.',
        titleLabel: 'Title',
        titlePlaceholder: 'Fractions Worksheet',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Briefly describe what this resource covers.',
        levelLabel: 'Level',
        levelPlaceholder: 'e.g. grades 5–6',
        categoryLabel: 'Category',
        fileLabel: 'PDF file',
        fileHint: 'PDF only, up to 15MB',
        submit: 'Upload',
        submitting: 'Uploading…',
        success: 'Resource published.',
        error: 'Upload failed.',
      },
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
    workspace: {
      kicker: 'Shared learning space',
      title: 'Keep learning together, beyond the lesson.',
      intro: 'Explore teacher-published content, give students a clear next step, and help families stay close to important updates.',
      tabLabel: 'Learning workspace roles',
      roles: {
        teacher: 'Teacher panel',
        student: 'Student panel',
        parent: 'Parent panel',
        examAnalysis: 'Exam analysis',
      },
      teacher: {
        label: 'Publish new content',
        title: 'Title',
        titlePlaceholder: 'For example: Visualising fractions',
        description: 'Description',
        descriptionPlaceholder: 'Briefly explain what this content teaches and how to use it.',
        type: 'Content type',
        level: 'Level',
        levelPlaceholder: 'For example: Grades 6–8',
        author: 'Published by',
        authorPlaceholder: 'Your name',
        publish: 'Publish content',
        publishing: 'Publishing…',
        success: 'Content published. Students and parents will see it shortly.',
        types: {
          lesson: 'Lesson',
          practice: 'Practice',
          resource: 'Resource',
          announcement: 'Announcement',
        },
      },
      examAnalysis: {
        label: 'University entrance exam tracker',
        intro: "Log branch-by-branch correct/wrong/blank counts for TYT and AYT practice exams and watch your net score trend over time.",
        loginPrompt: 'Sign in with a student account to log an exam result.',
        loginCta: 'Sign in',
        rolePrompt: 'Exam analysis is only available to student accounts, so history stays personal.',
        examType: 'Exam type',
        examTypes: {
          TYT: 'TYT',
          AYT_SAY: 'AYT — Science',
          AYT_EA: 'AYT — Equal Weight',
          AYT_SOZ: 'AYT — Verbal',
          AYT_DIL: 'AYT — Language',
        },
        examDate: 'Date',
        examName: 'Exam name (optional)',
        examNamePlaceholder: 'For example: Publisher X — Practice 5',
        correct: 'Correct',
        wrong: 'Wrong',
        blank: 'Blank',
        net: 'Net',
        totalNet: 'Total net',
        submit: 'Save exam',
        submitting: 'Saving…',
        success: 'Exam saved.',
        error: 'Could not save the exam.',
        chartTitle: 'Net score trend',
        historyTitle: 'Past exams',
        empty: 'No exams logged yet.',
        emptyDetail: 'Add your first exam to start tracking your net score.',
        delete: 'Delete',
        deleted: 'Exam deleted.',
        overLimit: 'cannot exceed the question count',
      },
      student: {
        label: 'New publications',
        refresh: 'Refreshes automatically',
        refreshDetail: 'New content appears approximately every 15 seconds.',
        empty: 'No published content yet.',
        emptyDetail: 'A teacher post will appear here when it is published.',
        by: 'Published by',
      },
      parent: {
        label: 'Notifications',
        unread: 'unread',
        empty: 'You have no new notifications.',
        emptyDetail: 'You will see an update here when new content is published.',
        markRead: 'Mark as read',
        markedRead: 'Read',
      },
      loading: 'Loading',
      error: 'Could not load content.',
      retry: 'Try again',
      contentTypes: {
        lesson: 'Lesson',
        practice: 'Practice',
        resource: 'Resource',
        announcement: 'Announcement',
      },
      published: 'Published',
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

  const [activeRole, setActiveRole] = useState<WorkspaceRole>('teacher');
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    contentType: 'lesson' as LearningContentInputContentType,
    level: '',
    authorName: '',
  });

  const queryClient = useQueryClient();

  // Student panel polls the shared feed; parent panel polls notifications.
  // A 15s interval is what makes newly published content and alerts show up
  // for the other two roles without anyone refreshing the page.
  const learningContentQuery = useListLearningContent({ query: { queryKey: getListLearningContentQueryKey(), refetchInterval: 15000 } });
  const notificationsQuery = useListNotifications({ query: { queryKey: getListNotificationsQueryKey(), refetchInterval: 15000 } });

  // --- Kimlik doğrulama ---
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'teacher' as Role });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    fetchMe().then(setCurrentUser);
  }, []);

  // --- Kaynak rafı: yüklenen PDF'ler ---
  const uploadedResourcesQuery = useQuery({ queryKey: ['uploaded-resources'], queryFn: listUploadedResources });
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', level: '', category: 'foundations' as string });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!uploadFile) throw new Error('no-file');
      return uploadResource({ ...uploadForm, file: uploadFile });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-resources'] });
      setUploadForm({ title: '', description: '', level: '', category: 'foundations' });
      setUploadFile(null);
      notify(t.resources.upload.success);
    },
  });

  // --- Deneme (YKS) analizi: yalnızca öğrenci hesabına özel geçmiş ---
  const examAttemptsQuery = useQuery({
    queryKey: ['exam-attempts'],
    queryFn: listExamAttempts,
    enabled: Boolean(currentUser),
  });

  const emptyExamSubjects = (examType: YksExamType): ExamSubjectInput[] =>
    YKS_SUBJECTS[examType].map((def) => ({ subject: def.subject, correct: 0, wrong: 0, blank: 0 }));

  const [examForm, setExamForm] = useState<{ examType: YksExamType; examDate: string; examName: string; subjects: ExamSubjectInput[] }>(() => ({
    examType: 'TYT',
    examDate: new Date().toISOString().slice(0, 10),
    examName: '',
    subjects: emptyExamSubjects('TYT'),
  }));

  const updateExamType = (examType: YksExamType) => {
    setExamForm((current) => ({ ...current, examType, subjects: emptyExamSubjects(examType) }));
  };

  const updateExamSubjectField = (index: number, field: 'correct' | 'wrong' | 'blank', value: string) => {
    const numeric = Math.max(0, Math.floor(Number(value) || 0));
    setExamForm((current) => ({
      ...current,
      subjects: current.subjects.map((entry, i) => (i === index ? { ...entry, [field]: numeric } : entry)),
    }));
  };

  const createExamMutation = useMutation({
    mutationFn: () => createExamAttempt(examForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
      setExamForm((current) => ({ ...current, examName: '', subjects: emptyExamSubjects(current.examType) }));
      notify(t.workspace.examAnalysis.success);
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: (id: number) => deleteExamAttempt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts'] });
      notify(t.workspace.examAnalysis.deleted);
    },
  });

  const submitExamAttempt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createExamMutation.mutate();
  };

  const examDateFormatter = new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' });
  const examChartData = (examAttemptsQuery.data ?? []).map((attempt) => ({
    date: examDateFormatter.format(new Date(attempt.examDate)),
    net: Math.round(attempt.totalNet * 100) / 100,
  }));

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

  const createContent = useCreateLearningContent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLearningContentQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        setContentForm((current) => ({ ...current, title: '', description: '', level: '' }));
        notify(t.workspace.teacher.success);
      },
    },
  });

  const markNotificationRead = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      },
    },
  });

  const updateContentForm = (field: keyof typeof contentForm, value: string) =>
    setContentForm((current) => ({ ...current, [field]: value }));

  const submitContent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createContent.mutate({ data: contentForm });
  };

  const updateAuthForm = (field: keyof typeof authForm, value: string) =>
    setAuthForm((current) => ({ ...current, [field]: value }));

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    setAuthError('');
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const user = authMode === 'login'
        ? await loginUser({ email: authForm.email, password: authForm.password })
        : await registerUser(authForm);
      setCurrentUser(user);
      setAuthOpen(false);
      setAuthForm({ name: '', email: '', password: '', role: 'teacher' });
      notify(authMode === 'login' ? t.auth.loginSuccess : t.auth.registerSuccess);
    } catch (error) {
      setAuthError(authErrorMessage(error, t.auth.genericError));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    notify(t.auth.logoutSuccess);
  };

  const updateUploadForm = (field: keyof typeof uploadForm, value: string) =>
    setUploadForm((current) => ({ ...current, [field]: value }));

  const submitUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uploadFile) return;
    uploadMutation.mutate();
  };

  const uploadedResources = uploadedResourcesQuery.data ?? [];
  const filteredUploadedResources = uploadedResources.filter(
    (resource) => activeFilter === 'all' || resource.category === activeFilter,
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const unreadCount = notificationsQuery.data?.filter((item) => !item.isRead).length ?? 0;

  const formatTimestamp = (value: string | Date) =>
    new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

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
          <div className="nav-panel">
            <nav className="nav-links" aria-label={t.nav.main}>
              <button className="nav-link" onClick={() => goTo('audiences')} data-testid="link-audiences">{t.nav.audiences}</button>
              <button className="nav-link" onClick={() => goTo('resources')} data-testid="link-resources">{t.nav.resources}</button>
              <button className="nav-link" onClick={() => goTo('story')} data-testid="link-story">{t.nav.story}</button>
              <button className="nav-link" onClick={() => goTo('faq')} data-testid="link-faq">{t.nav.faq}</button>
              <button className="nav-link" onClick={() => goTo('workspace')} data-testid="link-workspace">{t.nav.workspace}</button>
            </nav>
            <div className="nav-actions">
              <div className="language-switch" role="group" aria-label={t.nav.language}>
                <button className={language === 'tr' ? 'active' : ''} onClick={() => changeLanguage('tr')} aria-pressed={language === 'tr'} data-testid="button-language-tr">TR</button>
                <button className={language === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')} aria-pressed={language === 'en'} data-testid="button-language-en">EN</button>
              </div>
              {currentUser ? (
                <div className="nav-account">
                  <span className="nav-account-name">{t.auth.loggedInAs.replace('{name}', currentUser.name)}</span>
                  <button className="nav-login" onClick={handleLogout} data-testid="button-sign-out"><LogOut size={14} /> {t.auth.logout}</button>
                </div>
              ) : (
                <button className="nav-login" onClick={() => openAuth('login')} data-testid="button-sign-in"><LogIn size={14} /> {t.nav.signIn}</button>
              )}
              <button className="button button-primary" onClick={() => goTo('request')} data-testid="button-request-nav">{t.nav.request} <ArrowRight size={15} /></button>
            </div>
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
              {filteredUploadedResources.map((resource, index) => (
                <article className={`resource-card resource-card-pdf reveal reveal-delay-${(index % 3) + 1}`} key={`upload-${resource.id}`} data-testid={`card-uploaded-resource-${resource.id}`}>
                  <div className="resource-top"><span className="resource-symbol resource-symbol-pdf" aria-hidden="true"><FileText size={16} /></span><span className="resource-type mono">{t.resources.filters[resource.category as FilterKey] ?? resource.category}</span></div>
                  <div><h3 className="display">{resource.title}</h3><p>{resource.description}</p></div>
                  <div className="resource-meta"><span>{resource.level} · {t.resources.uploadedBy} {resource.uploadedByName}</span>
                    <a className="resource-download" href={resourceFileUrl(resource.id)} target="_blank" rel="noreferrer" data-testid={`link-download-${resource.id}`}>{t.resources.download} <Download size={12} /></a>
                  </div>
                </article>
              ))}
            </div>
            {uploadedResourcesQuery.isError && (
              <p className="workspace-status">{t.resources.loadError} <button className="button-ghost" onClick={() => uploadedResourcesQuery.refetch()} data-testid="button-retry-resources">{t.resources.retry}</button></p>
            )}

            <div className="resource-upload-panel reveal">
              <p className="workspace-panel-label"><Upload size={16} /> {t.resources.upload.heading}</p>
              <p className="resource-upload-intro">{t.resources.upload.intro}</p>
              {!currentUser && (
                <p className="resource-upload-gate">{t.resources.upload.loginPrompt} <button className="button-ghost" onClick={() => openAuth('login')} data-testid="button-upload-login">{t.resources.upload.loginCta}</button></p>
              )}
              {currentUser && currentUser.role !== 'teacher' && (
                <p className="resource-upload-gate">{t.resources.upload.rolePrompt}</p>
              )}
              {currentUser && currentUser.role === 'teacher' && (
                <form className="workspace-form" onSubmit={submitUpload}>
                  <div className="field">
                    <label htmlFor="resource-title">{t.resources.upload.titleLabel}</label>
                    <input id="resource-title" required value={uploadForm.title} onChange={(event) => updateUploadForm('title', event.target.value)} placeholder={t.resources.upload.titlePlaceholder} data-testid="input-resource-title" />
                  </div>
                  <div className="field">
                    <label htmlFor="resource-description">{t.resources.upload.descriptionLabel}</label>
                    <textarea id="resource-description" required value={uploadForm.description} onChange={(event) => updateUploadForm('description', event.target.value)} placeholder={t.resources.upload.descriptionPlaceholder} data-testid="textarea-resource-description" />
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="resource-category">{t.resources.upload.categoryLabel}</label>
                      <select id="resource-category" value={uploadForm.category} onChange={(event) => updateUploadForm('category', event.target.value)} data-testid="select-resource-category">
                        {resourceCategoryKeys.map((key) => <option key={key} value={key}>{t.resources.filters[key]}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="resource-level">{t.resources.upload.levelLabel}</label>
                      <input id="resource-level" required value={uploadForm.level} onChange={(event) => updateUploadForm('level', event.target.value)} placeholder={t.resources.upload.levelPlaceholder} data-testid="input-resource-level" />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="resource-file">{t.resources.upload.fileLabel}</label>
                    <input id="resource-file" type="file" required accept="application/pdf" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} data-testid="input-resource-file" />
                    <small className="field-hint">{t.resources.upload.fileHint}{uploadFile ? ` · ${uploadFile.name} (${formatFileSize(uploadFile.size)})` : ''}</small>
                  </div>
                  {uploadMutation.isError && <p className="auth-error" role="alert">{authErrorMessage(uploadMutation.error, t.resources.upload.error)}</p>}
                  <button className="button button-primary" type="submit" disabled={uploadMutation.isPending || !uploadFile} data-testid="button-upload-resource">
                    {uploadMutation.isPending ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
                    {uploadMutation.isPending ? t.resources.upload.submitting : t.resources.upload.submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="section workspace-section" id="workspace">
          <div className="container-wide">
            <div className="section-head reveal">
              <div><p className="section-kicker mono">{t.workspace.kicker}</p><h2 className="section-title display">{t.workspace.title}</h2></div>
              <p className="section-intro">{t.workspace.intro}</p>
            </div>

            <div className="role-tabs reveal" role="tablist" aria-label={t.workspace.tabLabel}>
              {roleKeys.map((key) => (
                <button key={key} className={`role-tab ${activeRole === key ? 'active' : ''}`} onClick={() => setActiveRole(key)} role="tab" aria-selected={activeRole === key} data-testid={`tab-role-${key}`}>
                  {key === 'teacher' && <Send size={16} />}
                  {key === 'student' && <BookOpen size={16} />}
                  {key === 'parent' && <Bell size={16} />}
                  {key === 'examAnalysis' && <TrendingUp size={16} />}
                  <span>{t.workspace.roles[key]}</span>
                  {key === 'parent' && unreadCount > 0 && <em className="role-badge">{unreadCount}</em>}
                </button>
              ))}
            </div>

            <div className="workspace-panel reveal reveal-delay-1" role="tabpanel">
              {activeRole === 'teacher' && (
                <form className="workspace-form" onSubmit={submitContent}>
                  <p className="workspace-panel-label">{t.workspace.teacher.label}</p>
                  <div className="field">
                    <label htmlFor="content-title">{t.workspace.teacher.title}</label>
                    <input id="content-title" required value={contentForm.title} onChange={(event) => updateContentForm('title', event.target.value)} placeholder={t.workspace.teacher.titlePlaceholder} data-testid="input-content-title" />
                  </div>
                  <div className="field">
                    <label htmlFor="content-description">{t.workspace.teacher.description}</label>
                    <textarea id="content-description" required value={contentForm.description} onChange={(event) => updateContentForm('description', event.target.value)} placeholder={t.workspace.teacher.descriptionPlaceholder} data-testid="textarea-content-description" />
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="content-type">{t.workspace.teacher.type}</label>
                      <select id="content-type" value={contentForm.contentType} onChange={(event) => updateContentForm('contentType', event.target.value)} data-testid="select-content-type">
                        {(Object.keys(t.workspace.teacher.types) as LearningContentInputContentType[]).map((type) => (
                          <option key={type} value={type}>{t.workspace.teacher.types[type]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="content-level">{t.workspace.teacher.level}</label>
                      <input id="content-level" required value={contentForm.level} onChange={(event) => updateContentForm('level', event.target.value)} placeholder={t.workspace.teacher.levelPlaceholder} data-testid="input-content-level" />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="content-author">{t.workspace.teacher.author}</label>
                    <input id="content-author" required value={contentForm.authorName} onChange={(event) => updateContentForm('authorName', event.target.value)} placeholder={t.workspace.teacher.authorPlaceholder} data-testid="input-content-author" />
                  </div>
                  <button className="button button-primary" type="submit" disabled={createContent.isPending} data-testid="button-publish-content">
                    {createContent.isPending ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                    {createContent.isPending ? t.workspace.teacher.publishing : t.workspace.teacher.publish}
                  </button>
                </form>
              )}

              {activeRole === 'student' && (
                <div className="workspace-feed">
                  <div className="workspace-panel-head">
                    <p className="workspace-panel-label">{t.workspace.student.label}</p>
                    <span className="workspace-refresh mono"><RefreshCw size={12} /> {t.workspace.student.refresh}</span>
                  </div>
                  <p className="workspace-refresh-detail">{t.workspace.student.refreshDetail}</p>
                  {learningContentQuery.isLoading && <p className="workspace-status"><Loader2 size={15} className="spin" /> {t.workspace.loading}</p>}
                  {learningContentQuery.isError && (
                    <p className="workspace-status">{t.workspace.error} <button className="button-ghost" onClick={() => learningContentQuery.refetch()} data-testid="button-retry-content">{t.workspace.retry}</button></p>
                  )}
                  {learningContentQuery.data?.length === 0 && (
                    <div className="workspace-empty"><p>{t.workspace.student.empty}</p><small>{t.workspace.student.emptyDetail}</small></div>
                  )}
                  <div className="content-list">
                    {learningContentQuery.data?.map((item) => (
                      <article className="content-card" key={item.id} data-testid={`card-content-${item.id}`}>
                        <div className="content-card-top">
                          <span className="resource-type mono">{t.workspace.contentTypes[item.contentType]}</span>
                          <span className="content-card-level">{item.level}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <div className="content-card-meta"><span>{t.workspace.student.by} {item.authorName}</span><span>{formatTimestamp(item.createdAt)}</span></div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {activeRole === 'parent' && (
                <div className="workspace-feed">
                  <div className="workspace-panel-head">
                    <p className="workspace-panel-label">{t.workspace.parent.label}</p>
                    {unreadCount > 0 && <span className="workspace-unread mono">{unreadCount} {t.workspace.parent.unread}</span>}
                  </div>
                  {notificationsQuery.isLoading && <p className="workspace-status"><Loader2 size={15} className="spin" /> {t.workspace.loading}</p>}
                  {notificationsQuery.isError && (
                    <p className="workspace-status">{t.workspace.error} <button className="button-ghost" onClick={() => notificationsQuery.refetch()} data-testid="button-retry-notifications">{t.workspace.retry}</button></p>
                  )}
                  {notificationsQuery.data?.length === 0 && (
                    <div className="workspace-empty"><p>{t.workspace.parent.empty}</p><small>{t.workspace.parent.emptyDetail}</small></div>
                  )}
                  <div className="notification-list">
                    {notificationsQuery.data?.map((item) => (
                      <article className={`notification-item ${item.isRead ? 'read' : ''}`} key={item.id} data-testid={`notification-${item.id}`}>
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.message}</p>
                          <span className="mono">{formatTimestamp(item.createdAt)}</span>
                        </div>
                        {item.isRead ? (
                          <span className="notification-read-tag"><Check size={13} /> {t.workspace.parent.markedRead}</span>
                        ) : (
                          <button className="button-ghost" onClick={() => markNotificationRead.mutate({ id: item.id })} disabled={markNotificationRead.isPending} data-testid={`button-mark-read-${item.id}`}>
                            {t.workspace.parent.markRead}
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {activeRole === 'examAnalysis' && (
                <div className="workspace-feed">
                  <p className="workspace-panel-label"><TrendingUp size={16} /> {t.workspace.examAnalysis.label}</p>
                  <p className="resource-upload-intro">{t.workspace.examAnalysis.intro}</p>

                  {!currentUser && (
                    <p className="resource-upload-gate">{t.workspace.examAnalysis.loginPrompt} <button className="button-ghost" onClick={() => openAuth('login')} data-testid="button-exam-login">{t.workspace.examAnalysis.loginCta}</button></p>
                  )}
                  {currentUser && currentUser.role !== 'student' && (
                    <p className="resource-upload-gate">{t.workspace.examAnalysis.rolePrompt}</p>
                  )}

                  {currentUser && currentUser.role === 'student' && (
                    <>
                      {examChartData.length > 0 && (
                        <div className="exam-chart">
                          <p className="workspace-panel-label exam-chart-title">{t.workspace.examAnalysis.chartTitle}</p>
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={examChartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ink-soft)' }} />
                              <YAxis tick={{ fontSize: 11, fill: 'var(--ink-soft)' }} width={32} />
                              <Tooltip contentStyle={{ fontSize: '0.78rem', borderRadius: 8, border: '1px solid var(--line)' }} formatter={(value: number) => [value, t.workspace.examAnalysis.net]} />
                              <Line type="monotone" dataKey="net" stroke="var(--indigo)" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      <form className="workspace-form exam-form" onSubmit={submitExamAttempt}>
                        <div className="form-row">
                          <div className="field">
                            <label htmlFor="exam-type">{t.workspace.examAnalysis.examType}</label>
                            <select id="exam-type" value={examForm.examType} onChange={(event) => updateExamType(event.target.value as YksExamType)} data-testid="select-exam-type">
                              {YKS_EXAM_TYPES.map((key) => <option key={key} value={key}>{t.workspace.examAnalysis.examTypes[key]}</option>)}
                            </select>
                          </div>
                          <div className="field">
                            <label htmlFor="exam-date">{t.workspace.examAnalysis.examDate}</label>
                            <input id="exam-date" type="date" required value={examForm.examDate} onChange={(event) => setExamForm((current) => ({ ...current, examDate: event.target.value }))} data-testid="input-exam-date" />
                          </div>
                        </div>
                        <div className="field">
                          <label htmlFor="exam-name">{t.workspace.examAnalysis.examName}</label>
                          <input id="exam-name" value={examForm.examName} onChange={(event) => setExamForm((current) => ({ ...current, examName: event.target.value }))} placeholder={t.workspace.examAnalysis.examNamePlaceholder} data-testid="input-exam-name" />
                        </div>

                        <div className="exam-subject-table">
                          <div className="exam-subject-row exam-subject-head">
                            <span />
                            <span>{t.workspace.examAnalysis.correct}</span>
                            <span>{t.workspace.examAnalysis.wrong}</span>
                            <span>{t.workspace.examAnalysis.blank}</span>
                          </div>
                          {examForm.subjects.map((entry, index) => {
                            const def = YKS_SUBJECTS[examForm.examType][index];
                            return (
                              <div className="exam-subject-row" key={entry.subject}>
                                <span className="exam-subject-name">{entry.subject} <small>({def.totalQuestions})</small></span>
                                <input type="number" min={0} max={def.totalQuestions} value={entry.correct} onChange={(event) => updateExamSubjectField(index, 'correct', event.target.value)} data-testid={`input-exam-correct-${index}`} />
                                <input type="number" min={0} max={def.totalQuestions} value={entry.wrong} onChange={(event) => updateExamSubjectField(index, 'wrong', event.target.value)} data-testid={`input-exam-wrong-${index}`} />
                                <input type="number" min={0} max={def.totalQuestions} value={entry.blank} onChange={(event) => updateExamSubjectField(index, 'blank', event.target.value)} data-testid={`input-exam-blank-${index}`} />
                              </div>
                            );
                          })}
                        </div>

                        {createExamMutation.isError && <p className="auth-error" role="alert">{authErrorMessage(createExamMutation.error, t.workspace.examAnalysis.error)}</p>}
                        <button className="button button-primary" type="submit" disabled={createExamMutation.isPending} data-testid="button-submit-exam">
                          {createExamMutation.isPending ? <Loader2 size={15} className="spin" /> : <TrendingUp size={15} />}
                          {createExamMutation.isPending ? t.workspace.examAnalysis.submitting : t.workspace.examAnalysis.submit}
                        </button>
                      </form>

                      <p className="workspace-panel-label exam-history-title">{t.workspace.examAnalysis.historyTitle}</p>
                      {examAttemptsQuery.isLoading && <p className="workspace-status"><Loader2 size={15} className="spin" /> {t.workspace.loading}</p>}
                      {examAttemptsQuery.data?.length === 0 && (
                        <div className="workspace-empty"><p>{t.workspace.examAnalysis.empty}</p><small>{t.workspace.examAnalysis.emptyDetail}</small></div>
                      )}
                      <div className="exam-history-list">
                        {[...(examAttemptsQuery.data ?? [])].reverse().map((attempt) => (
                          <article className="exam-history-card" key={attempt.id} data-testid={`card-exam-${attempt.id}`}>
                            <div className="exam-history-top">
                              <div>
                                <strong>{t.workspace.examAnalysis.examTypes[attempt.examType]}</strong>
                                {attempt.examName && <span className="exam-history-name"> · {attempt.examName}</span>}
                                <div className="mono">{new Date(attempt.examDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</div>
                              </div>
                              <div className="exam-history-total">{attempt.totalNet.toFixed(2)} <small>{t.workspace.examAnalysis.totalNet}</small></div>
                              <button className="button-ghost" onClick={() => deleteExamMutation.mutate(attempt.id)} disabled={deleteExamMutation.isPending} aria-label={t.workspace.examAnalysis.delete} data-testid={`button-delete-exam-${attempt.id}`}><Trash2 size={14} /></button>
                            </div>
                            <div className="exam-history-subjects">
                              {attempt.subjects.map((subject) => (
                                <span key={subject.subject} className="exam-history-subject"><span>{subject.subject}</span><strong>{subject.net.toFixed(2)}</strong></span>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
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
      {authOpen && (
        <div className="auth-overlay" onClick={closeAuth} data-testid="overlay-auth">
          <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
            <button className="auth-close" onClick={closeAuth} aria-label={t.auth.close} data-testid="button-auth-close"><X size={18} /></button>
            <h2 id="auth-title" className="auth-title">{authMode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}</h2>
            <div className="auth-tabs" role="tablist">
              <button className={authMode === 'login' ? 'active' : ''} onClick={() => openAuth('login')} role="tab" aria-selected={authMode === 'login'} data-testid="tab-auth-login">{t.auth.loginTab}</button>
              <button className={authMode === 'register' ? 'active' : ''} onClick={() => openAuth('register')} role="tab" aria-selected={authMode === 'register'} data-testid="tab-auth-register">{t.auth.registerTab}</button>
            </div>
            <form className="auth-form" onSubmit={submitAuth}>
              {authMode === 'register' && (
                <div className="field">
                  <label htmlFor="auth-name">{t.auth.nameLabel}</label>
                  <input id="auth-name" required minLength={2} autoComplete="name" value={authForm.name} onChange={(event) => updateAuthForm('name', event.target.value)} placeholder={t.auth.namePlaceholder} data-testid="input-auth-name" />
                </div>
              )}
              <div className="field">
                <label htmlFor="auth-email">{t.auth.emailLabel}</label>
                <input id="auth-email" type="email" required autoComplete="email" value={authForm.email} onChange={(event) => updateAuthForm('email', event.target.value)} placeholder={t.auth.emailPlaceholder} data-testid="input-auth-email" />
              </div>
              <div className="field">
                <label htmlFor="auth-password">{t.auth.passwordLabel}</label>
                <input id="auth-password" type="password" required minLength={authMode === 'register' ? 8 : 1} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={authForm.password} onChange={(event) => updateAuthForm('password', event.target.value)} data-testid="input-auth-password" />
                {authMode === 'register' && <small className="field-hint">{t.auth.passwordHint}</small>}
              </div>
              {authMode === 'register' && (
                <div className="field">
                  <label htmlFor="auth-role">{t.auth.roleLabel}</label>
                  <select id="auth-role" value={authForm.role} onChange={(event) => updateAuthForm('role', event.target.value)} data-testid="select-auth-role">
                    {authRoleKeys.map((key) => <option key={key} value={key}>{t.auth.roleOptions[key]}</option>)}
                  </select>
                </div>
              )}
              {authError && <p className="auth-error" role="alert" data-testid="text-auth-error">{authError}</p>}
              <button className="button button-primary" type="submit" disabled={authSubmitting} data-testid="button-auth-submit">
                {authSubmitting ? <Loader2 size={15} className="spin" /> : <LogIn size={15} />}
                {authSubmitting ? t.auth.submitting : authMode === 'login' ? t.auth.submitLogin : t.auth.submitRegister}
              </button>
            </form>
            <button className="auth-switch" onClick={() => openAuth(authMode === 'login' ? 'register' : 'login')} data-testid="button-auth-switch">
              {authMode === 'login' ? t.auth.switchToRegister : t.auth.switchToLogin}
            </button>
          </div>
        </div>
      )}
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite" data-testid="status-toast">{toast || ' '}</div>
    </div>
  );
}

export default App;