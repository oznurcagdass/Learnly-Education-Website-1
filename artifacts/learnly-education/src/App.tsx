import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Feather,
  Menu,
  PenLine,
  Play,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Course = {
  title: string;
  category: string;
  level: string;
  time: string;
  description: string;
  icon: LucideIcon;
};

const courses: Course[] = [
  { title: 'Build a portfolio that gets read', category: 'Career', level: 'Starter', time: '4 weeks', description: 'Turn the work you have into a story people remember.', icon: PenLine },
  { title: 'The calm way to learn data', category: 'Tech', level: 'Growing', time: '6 weeks', description: 'Make friends with spreadsheets, patterns, and clear decisions.', icon: Target },
  { title: 'Write with a point of view', category: 'Creative', level: 'Starter', time: '3 weeks', description: 'Find your voice and put it to work on the page.', icon: Feather },
  { title: 'Present ideas like you mean them', category: 'Career', level: 'Growing', time: '4 weeks', description: 'A practical studio for clearer thinking and better rooms.', icon: Sparkles },
  { title: 'Your first line of code', category: 'Tech', level: 'Starter', time: '5 weeks', description: 'A gentle, useful introduction to making things on the web.', icon: BookOpen },
  { title: 'Make space for the next chapter', category: 'Life', level: 'Starter', time: '2 weeks', description: 'A small reset for a bigger, more intentional direction.', icon: Compass },
];

const faqs = [
  ['Is Learnly for complete beginners?', 'Yes. Every path starts with the assumption that you are smart, busy, and new to this particular thing. No insider vocabulary required.'],
  ['How much time should I set aside?', 'Most lessons take 20–35 minutes, with one practical project each week. You can keep your momentum in about two focused hours.'],
  ['What makes Learnly different?', 'We design every course around a useful outcome, not a pile of videos. You will make, share, and reflect as you go.'],
  ['Can I learn alongside a full-time job?', 'That is exactly who the platform is built for. Save lessons, pick up where you left off, and make a schedule that belongs to you.'],
];

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All paths');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

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

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  };

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const filteredCourses = activeCategory === 'All paths'
    ? courses
    : courses.filter((course) => course.category === activeCategory);

  return (
    <div className="learnly-app">
      <header className={`topbar ${menuOpen ? 'menu-open' : ''}`}>
        <div className="nav-inner">
          <button className="wordmark" onClick={() => goTo('top')} data-testid="button-home">
            <span className="wordmark-mark" aria-hidden="true" />
            Learnly
          </button>
          <nav className="nav-links" aria-label="Main navigation">
            <button className="nav-link" onClick={() => goTo('courses')} data-testid="link-courses">Explore courses</button>
            <button className="nav-link" onClick={() => goTo('method')} data-testid="link-method">Our approach</button>
            <button className="nav-link" onClick={() => goTo('stories')} data-testid="link-stories">Learner stories</button>
          </nav>
          <div className="nav-actions">
            <button className="nav-login" onClick={() => notify('A sign-in space is coming soon.')} data-testid="button-sign-in">Sign in</button>
            <button className="button button-primary" onClick={() => goTo('courses')} data-testid="button-start-nav">Find your next step <ArrowRight size={15} /></button>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container-wide hero-grid">
            <div className="reveal">
              <p className="eyebrow mono">For the gloriously curious</p>
              <h1 className="display">Make room for a <em>new</em> idea.</h1>
              <p className="hero-copy">Learnly is a practical learning studio for adults in motion. Short lessons, thoughtful teachers, and a clear next step when you are ready for one.</p>
              <div className="hero-ctas">
                <button className="button button-primary" onClick={() => goTo('courses')} data-testid="button-explore-hero">Explore the paths <ArrowDownRight size={16} /></button>
                <button className="button button-ghost" onClick={() => goTo('method')} data-testid="button-how-it-works">How it works <ArrowRight size={15} /></button>
              </div>
              <div className="hero-note">
                <span className="avatar-stack" aria-hidden="true"><span className="avatar-a">J</span><span className="avatar-b">M</span><span className="avatar-c">R</span></span>
                <span>Joined by 18,400 people making a change</span>
              </div>
            </div>
            <div className="desk reveal reveal-delay-2" aria-label="A preview of a Learnly lesson">
              <div className="desk-back" />
              <div className="desk-card">
                <div className="desk-header"><span className="mono">Today’s page</span><span>12 min read</span></div>
                <h2 className="desk-title display">A small start is still a start.</h2>
                <div className="desk-rule" />
                <div className="lesson-row"><span className="lesson-dot">01</span><span><strong>Notice what pulls you in</strong><small>Warm-up · 4 min</small></span></div>
                <div className="lesson-row"><span className="lesson-dot">02</span><span><strong>Try one useful question</strong><small>Practice · 6 min</small></span></div>
                <div className="lesson-row"><span className="lesson-dot">03</span><span><strong>Leave a note for tomorrow</strong><small>Reflection · 2 min</small></span></div>
              </div>
              <div className="floating-note"><Sparkles size={16} /><p>Keep going.<br />You are onto something.</p></div>
            </div>
          </div>
        </section>

        <div className="signal">
          <div className="container-wide signal-inner">
            <p>Good learning should fit inside a good life.</p>
            <div className="signal-list"><span><b>20–35</b> min lessons</span><span><b>48</b> curious teachers</span><span><b>∞</b> ways forward</span></div>
          </div>
        </div>

        <section className="section" id="method">
          <div className="container-wide">
            <div className="section-head reveal">
              <div><p className="section-kicker mono">A different kind of classroom</p><h2 className="section-title display">Useful, human, <em>and yours.</em></h2></div>
              <p className="section-intro">No performance. No 40-hour rabbit holes. Just the right amount of structure to help an idea become a habit.</p>
            </div>
            <div className="principles">
              <article className="principle reveal"><div className="principle-number mono">01 / START SMALL</div><h3>Momentum over mastery</h3><p>We make the first ten minutes feel possible. Confidence has somewhere to begin.</p></article>
              <article className="principle reveal reveal-delay-1"><div className="principle-number mono">02 / STAY CLOSE</div><h3>Teachers who remember being new</h3><p>Learn from working people who share the messy middle, not just the polished outcome.</p></article>
              <article className="principle reveal reveal-delay-2"><div className="principle-number mono">03 / MAKE IT REAL</div><h3>Practice you can take with you</h3><p>Every course leaves you with something useful: a project, a plan, or a better question.</p></article>
            </div>
          </div>
        </section>

        <section className="section courses-section" id="courses">
          <div className="container-wide">
            <div className="section-head reveal">
              <div><p className="section-kicker mono">Choose your next page</p><h2 className="section-title display">There is more than one way <em>in.</em></h2></div>
              <p className="section-intro">Browse by what is tugging at you lately. You do not need a five-year plan to get started.</p>
            </div>
            <div className="course-tabs reveal">
              {['All paths', 'Career', 'Tech', 'Creative', 'Life'].map((category) => (
                <button key={category} className={`tab ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} data-testid={`button-filter-${category.toLowerCase().replace(' ', '-')}`}>{category}</button>
              ))}
            </div>
            <div className="course-grid">
              {filteredCourses.map((course, index) => {
                const Icon = course.icon;
                return <article className={`course-card reveal reveal-delay-${(index % 3) + 1}`} key={course.title} onClick={() => notify(`Saved “${course.title}” to your starting list.`)} data-testid={`card-course-${index}`}>
                  <div className="course-top"><span className="course-icon"><Icon size={18} strokeWidth={1.7} /></span><span className="course-level mono">{course.level}</span></div>
                  <div><h3 className="display">{course.title}</h3><p>{course.description}</p></div>
                  <div className="course-meta"><span>{course.time}</span><strong>Begin <ArrowRight size={12} /></strong></div>
                </article>;
              })}
            </div>
            <div className="course-footer reveal"><button className="button button-ghost" onClick={() => { setActiveCategory('All paths'); notify('Showing every Learnly path.'); }} data-testid="button-view-all-courses">View all paths <ArrowRight size={15} /></button></div>
          </div>
        </section>

        <section className="section path-section" id="path">
          <div className="container-wide path-grid">
            <div className="path-aside reveal"><p className="section-kicker mono">The Learnly loop</p><h2 className="section-title display">A little structure goes a <em>long way.</em></h2><p>We built a rhythm that respects your attention. Follow it once, then make it your own.</p><button className="button button-primary" onClick={() => goTo('courses')} data-testid="button-start-loop">Find a course to try <ArrowRight size={15} /></button></div>
            <div className="path-steps">
              {[['01', 'Pick a question', 'Start with the thing you keep circling back to. Curiosity is a better compass than a job title.'], ['02', 'Make a small thing', 'A prompt, a sketch, a spreadsheet, a conversation. Learning gets sticky when it leaves the screen.'], ['03', 'Share the rough draft', 'Get kind, useful feedback from a teacher and fellow learners. No perfect work required.'], ['04', 'Notice what changed', 'Close the loop with a short reflection, then choose what deserves your attention next.']].map(([number, title, copy], index) => <div className={`path-step reveal reveal-delay-${index % 3}`} key={number} onClick={() => notify(`Step ${number}: ${title}`)} data-testid={`step-learning-${number}`}><span className="step-no">{number}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowDownRight className="step-arrow" size={18} /></div>)}
            </div>
          </div>
        </section>

        <section className="quote-section" id="stories">
          <div className="container-wide quote-wrap reveal"><p className="quote display">“I thought I needed a new <em>identity.</em> Turns out I needed one good hour and somewhere safe to begin.”</p><div className="quote-by"><span className="quote-face">AL</span><span><strong>Amara Lewis</strong><br />Product designer, formerly “figuring it out”</span></div></div>
        </section>

        <section className="section faq-section">
          <div className="container-wide faq-grid">
            <div className="reveal"><p className="section-kicker mono">A few good questions</p><h2 className="section-title display">No silly questions <em>here.</em></h2><p className="section-intro" style={{ marginTop: 24 }}>Still wondering if this is your kind of place? That is a good sign. Start here.</p></div>
            <div className="faq-list reveal reveal-delay-1">
              {faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button className="faq-button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} data-testid={`button-faq-${index}`}><span>{question}</span><ChevronDown size={18} /></button><div className="faq-answer">{answer}</div></div>)}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container-wide final-inner reveal"><div><p className="mono">Your next chapter can be practical</p><h2 className="display">Bring your curiosity.<br /><em>We’ll bring the map.</em></h2></div><div><p>Find a course that meets you where you are, then take the next ten minutes.</p><button className="button button-primary" onClick={() => goTo('courses')} data-testid="button-browse-final">Browse Learnly <ArrowRight size={15} /></button></div></div>
        </section>
      </main>

      <footer className="footer">
        <div className="container-wide footer-inner"><button className="wordmark" onClick={() => goTo('top')} data-testid="button-footer-home"><span className="wordmark-mark" aria-hidden="true" />Learnly</button><span className="footer-meta">Made for people in the middle of becoming.</span><div className="footer-links"><button onClick={() => notify('Our privacy page is being written with care.')} data-testid="button-privacy">Privacy</button><button onClick={() => notify('Say hello at hello@learnly.example')} data-testid="button-contact">Contact</button></div></div>
      </footer>
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite" data-testid="status-toast">{toast || ' '}</div>
    </div>
  );
}

export default Home;
