import { useEffect, useRef, useState } from 'react';
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

type AudienceKey = 'Parents' | 'Students' | 'Teachers';
type Audience = {
  name: AudienceKey;
  eyebrow: string;
  title: string;
  description: string;
  benefits: { number: string; title: string; copy: string }[];
};

type Resource = {
  title: string;
  category: string;
  level: string;
  time: string;
  description: string;
  symbol: string;
};

const audiences: Audience[] = [
  {
    name: 'Parents',
    eyebrow: 'For the people in their corner',
    title: 'Find a tutor who sees the whole child.',
    description: 'Tell us what your learner needs, and we will introduce you to thoughtful, vetted math tutors who teach with patience, clarity, and a plan.',
    benefits: [
      { number: '01', title: 'A considered match', copy: 'Tutor recommendations shaped around level, goals, personality, and availability.' },
      { number: '02', title: 'Clear progress notes', copy: 'Know what clicked, what needs practice, and what to do next after each session.' },
    ],
  },
  {
    name: 'Students',
    eyebrow: 'For the quietly determined',
    title: 'Make math feel possible again.',
    description: 'Build confidence one good question at a time with guided practice, friendly explanations, and tutors who never make you feel behind.',
    benefits: [
      { number: '01', title: 'Practice with purpose', copy: 'Short, focused problems that help you notice the idea underneath the answer.' },
      { number: '02', title: 'A place to ask', copy: 'Bring the question you were afraid to ask in class. We will start exactly there.' },
    ],
  },
  {
    name: 'Teachers',
    eyebrow: 'For people who teach the thinking',
    title: 'Resources you can put to work tomorrow.',
    description: 'Browse curriculum-aligned tasks, explanations, and classroom prompts made by practicing math educators—not content factories.',
    benefits: [
      { number: '01', title: 'Curriculum aligned', copy: 'Resources mapped to familiar learning goals across elementary, middle, and high school.' },
      { number: '02', title: 'Worth your trust', copy: 'Every activity is reviewed for mathematical accuracy, accessibility, and real classroom use.' },
    ],
  },
];

const resources: Resource[] = [
  { title: 'Fractions without the fog', category: 'Foundations', level: 'Grades 4–6', time: '12 min', description: 'A visual route from parts of a whole to comparing unlike fractions.', symbol: '⅜' },
  { title: 'The algebraic thinking warm-up', category: 'Algebra', level: 'Grades 6–8', time: '8 min', description: 'Five low-floor prompts that turn patterns into useful equations.', symbol: 'x + 4' },
  { title: 'A better way to meet π', category: 'Geometry', level: 'Grades 7–9', time: '15 min', description: 'Use circles, string, and one surprising ratio to make the constant stick.', symbol: 'πr²' },
  { title: 'Reading a real-world graph', category: 'Data', level: 'Grades 5–8', time: '10 min', description: 'Help learners ask better questions of charts, axes, and noisy data.', symbol: '↗' },
  { title: 'One problem, three strategies', category: 'Problem solving', level: 'All levels', time: '18 min', description: 'A tutor-led routine for explaining not only what works, but why.', symbol: '∴' },
];

const faqs = [
  ['How do you match us with a private tutor?', 'Start with a short request so we can understand the learner, the level, and the kind of support that would help. We look at subject expertise, teaching style, availability, and fit before making an introduction.'],
  ['What ages and levels do Learnly tutors support?', 'Our network supports learners from upper elementary through college-prep mathematics, including arithmetic, pre-algebra, algebra, geometry, trigonometry, calculus, and statistics.'],
  ['Are the resources aligned to school curriculum?', 'Yes. Each resource is tagged by skill and age band, then reviewed by a practicing educator. We follow the concepts schools are teaching while leaving room for different teaching approaches.'],
  ['What happens after I send a tutoring request?', 'You will receive a thoughtful follow-up from our matching team, usually within one school day. There is no pressure to book a session before you have met the suggested tutor.'],
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAudience, setActiveAudience] = useState<AudienceKey>('Parents');
  const [activeFilter, setActiveFilter] = useState('All resources');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [requestSent, setRequestSent] = useState(false);
  const [form, setForm] = useState({ audience: 'Parent', level: 'Elementary / upper elementary', name: '', contact: '', message: '' });
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

  const selectedAudience = audiences.find((audience) => audience.name === activeAudience) ?? audiences[0];
  const filteredResources = activeFilter === 'All resources' ? resources : resources.filter((resource) => resource.category === activeFilter);

  const updateForm = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestSent(true);
    notify('Your tutoring request is on its way.');
  };

  return (
    <div className="learnly-app">
      <header className={`topbar ${menuOpen ? 'menu-open' : ''}`}>
        <div className="nav-inner">
          <button className="wordmark" onClick={() => goTo('top')} data-testid="button-home" aria-label="Learnly home">
            <span className="wordmark-mark" aria-hidden="true" />
            Learnly
          </button>
          <nav className="nav-links" aria-label="Main navigation">
            <button className="nav-link" onClick={() => goTo('audiences')} data-testid="link-audiences">Who it is for</button>
            <button className="nav-link" onClick={() => goTo('resources')} data-testid="link-resources">Math resources</button>
            <button className="nav-link" onClick={() => goTo('faq')} data-testid="link-faq">Questions</button>
          </nav>
          <div className="nav-actions">
            <button className="nav-login" onClick={() => notify('Family accounts are coming soon.')} data-testid="button-sign-in">Sign in</button>
            <button className="button button-primary" onClick={() => goTo('request')} data-testid="button-request-nav">Find a math tutor <ArrowRight size={15} /></button>
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
              <p className="eyebrow mono">Math support for real life</p>
              <h1 className="display">A clearer way to <em>feel</em> good at math.</h1>
              <p className="hero-copy">Learnly helps families find thoughtful private tutors, gives students guided practice that builds confidence, and puts trusted curriculum resources in teachers' hands.</p>
              <div className="hero-ctas">
                <button className="button button-primary" onClick={() => goTo('request')} data-testid="button-request-hero">Request a tutor <ArrowDownRight size={16} /></button>
                <button className="button button-ghost" onClick={() => goTo('audiences')} data-testid="button-audiences-hero">See how Learnly helps <ArrowRight size={15} /></button>
              </div>
              <div className="hero-note">
                <span className="avatar-stack" aria-hidden="true"><span className="avatar-a">M</span><span className="avatar-b">J</span><span className="avatar-c">R</span></span>
                <span>Vetted educators, trusted by 2,700+ families</span>
              </div>
            </div>
            <div className="math-board reveal reveal-delay-2" aria-label="A preview of a Learnly guided math lesson">
              <div className="math-board-back" />
              <div className="math-card">
                <div className="math-header"><span className="mono">Today's practice</span><span>Grade 7 · 12 min</span></div>
                <h2 className="math-title display">There is more than one way to solve it.</h2>
                <div className="math-equation"><span>3x + 4 = 19</span><small>show your thinking</small></div>
                <div className="math-rule" />
                <div className="math-row"><span className="math-dot">01</span><span><strong>Notice what is staying the same</strong><small>Warm-up · 3 min</small></span></div>
                <div className="math-row"><span className="math-dot">02</span><span><strong>Try a step, then explain it</strong><small>Guided practice · 6 min</small></span></div>
                <div className="math-row"><span className="math-dot">03</span><span><strong>Check if your answer makes sense</strong><small>Reflection · 3 min</small></span></div>
              </div>
              <div className="floating-note"><span className="mono">Tutor note</span><p>Good thinking.<br />Keep going.</p></div>
            </div>
          </div>
        </section>

        <div className="signal">
          <div className="container-wide signal-inner">
            <p>Less panic. More “I can see it now.”</p>
            <div className="signal-list"><span><b>2,700+</b> families</span><span><b>94</b> vetted tutors</span><span><b>12</b> curriculum areas</span></div>
          </div>
        </div>

        <section className="section audience-section" id="audiences">
          <div className="container-wide">
            <div className="section-head reveal">
              <div><p className="section-kicker mono">A place to start</p><h2 className="section-title display">Support that meets <em>the moment.</em></h2></div>
              <p className="section-intro">Different people need different kinds of help. Choose your view of Learnly—we will keep the math human.</p>
            </div>
            <div className="audience-tabs reveal" role="tablist" aria-label="Learnly audiences">
              {audiences.map((audience) => (
                <button key={audience.name} className={`audience-tab ${activeAudience === audience.name ? 'active' : ''}`} onClick={() => setActiveAudience(audience.name)} role="tab" aria-selected={activeAudience === audience.name} data-testid={`tab-audience-${audience.name.toLowerCase()}`}>
                  <strong>{audience.name}</strong><span>{audience.eyebrow}</span>
                </button>
              ))}
            </div>
            <div className="audience-content reveal reveal-delay-1" role="tabpanel">
              <div>
                <p className="section-kicker mono">{selectedAudience.eyebrow}</p>
                <h3 className="display">{selectedAudience.title}</h3>
                <p>{selectedAudience.description}</p>
                <button className="button button-ghost" onClick={() => goTo(activeAudience === 'Teachers' ? 'resources' : 'request')} data-testid={`button-audience-action-${activeAudience.toLowerCase()}`}>
                  {activeAudience === 'Teachers' ? 'Browse teacher resources' : 'Start a tutoring request'} <ArrowRight size={15} />
                </button>
              </div>
              <div className="benefit-list">
                {selectedAudience.benefits.map((benefit) => (
                  <article className="benefit" key={benefit.number}><span>{benefit.number}</span><h4>{benefit.title}</h4><p>{benefit.copy}</p></article>
                ))}
                <article className="benefit"><span>03</span><h4>{activeAudience === 'Teachers' ? 'Made for the school day' : 'Confidence, not shortcuts'}</h4><p>{activeAudience === 'Teachers' ? 'Print, assign, adapt, and keep the good conversation going.' : 'We teach the reasoning so learners can carry it into the next problem.'}</p></article>
              </div>
            </div>
          </div>
        </section>

        <section className="credibility">
          <div className="container-wide credibility-inner">
            <p>Math help should feel rigorous and kind at the same time.</p>
            <div className="credibility-list">
              <div><ShieldCheck size={17} /> Vetted by educators</div>
              <div><GraduationCap size={17} /> Curriculum-aware</div>
              <div><Users size={17} /> Human matching</div>
            </div>
          </div>
        </section>

        <section className="section resources-section" id="resources">
          <div className="container-wide">
            <div className="section-head reveal">
              <div><p className="section-kicker mono">The resource shelf</p><h2 className="section-title display">Good math content, <em>ready when you are.</em></h2></div>
              <p className="section-intro">Short, useful resources for the ideas that tend to need a second look—at the kitchen table or in tomorrow's lesson.</p>
            </div>
            <div className="resource-filters reveal" role="tablist" aria-label="Filter math resources">
              {['All resources', 'Foundations', 'Algebra', 'Geometry', 'Data', 'Problem solving'].map((filter) => (
                <button key={filter} className={`resource-filter ${activeFilter === filter ? 'active' : ''}`} onClick={() => setActiveFilter(filter)} role="tab" aria-selected={activeFilter === filter} data-testid={`button-filter-${filter.toLowerCase().replaceAll(' ', '-')}`}>{filter}</button>
              ))}
            </div>
            <div className="resource-grid">
              {filteredResources.map((resource, index) => (
                <article className={`resource-card reveal reveal-delay-${(index % 3) + 1}`} key={resource.title} onClick={() => notify(`Opened “${resource.title}”.`)} data-testid={`card-resource-${index}`}>
                  <div className="resource-top"><span className="resource-symbol" aria-hidden="true">{resource.symbol}</span><span className="resource-type mono">{resource.category}</span></div>
                  <div><h3 className="display">{resource.title}</h3><p>{resource.description}</p></div>
                  <div className="resource-meta"><span>{resource.level} · {resource.time}</span><strong>Open <ArrowRight size={12} /></strong></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section request-section" id="request">
          <div className="container-wide request-grid">
            <div className="reveal">
              <p className="section-kicker mono">Start with a conversation</p>
              <h2 className="section-title display">Let's find the <em>right next step.</em></h2>
              <p className="request-copy">Share a little about the learner and what has been hard lately. A real person on our team will read it and follow up with a considered tutor match.</p>
              <p className="request-proof">“The first time my daughter said, ‘I know how to start this,’ I knew we had found the right support.”<br /><strong>— Nina, Learnly parent</strong></p>
            </div>
            <div className="request-form reveal reveal-delay-1">
              {requestSent ? (
                <div className="form-success" data-testid="status-request-success">
                  <Check size={22} strokeWidth={2.3} />
                  <h3>We have your note.</h3>
                  <p>Thanks, {form.name || 'there'}. Our matching team will be in touch within one school day with a thoughtful next step.</p>
                  <button onClick={() => setRequestSent(false)} data-testid="button-edit-request">Send another request</button>
                </div>
              ) : (
                <form onSubmit={submitRequest}>
                  <div className="form-row">
                    <div className="field"><label htmlFor="request-audience">I am a…</label><select id="request-audience" value={form.audience} onChange={(event) => updateForm('audience', event.target.value)} data-testid="select-request-audience"><option>Parent</option><option>Student</option><option>Teacher</option></select></div>
                    <div className="field"><label htmlFor="request-level">Math level</label><select id="request-level" value={form.level} onChange={(event) => updateForm('level', event.target.value)} data-testid="select-request-level"><option>Elementary / upper elementary</option><option>Middle school</option><option>High school</option><option>College / adult learner</option></select></div>
                  </div>
                  <div className="form-row">
                    <div className="field"><label htmlFor="request-name">Your name</label><input id="request-name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Nina Patel" data-testid="input-request-name" /></div>
                    <div className="field"><label htmlFor="request-contact">Email or phone</label><input id="request-contact" required value={form.contact} onChange={(event) => updateForm('contact', event.target.value)} placeholder="nina@email.com" data-testid="input-request-contact" /></div>
                  </div>
                  <div className="field"><label htmlFor="request-message">What would make math feel better?</label><textarea id="request-message" required value={form.message} onChange={(event) => updateForm('message', event.target.value)} placeholder="Tell us what they are working on, what feels stuck, or what you hope will change." data-testid="textarea-request-message" /></div>
                  <button className="button button-primary" type="submit" data-testid="button-submit-request">Send tutoring request <ArrowRight size={15} /></button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="quote-section">
          <div className="container-wide quote-wrap reveal"><p className="quote display">“I stopped trying to be <em>fast</em> at math. I started trying to understand it.”</p><div className="quote-by"><span className="quote-face">LE</span><span><strong>Leo E.</strong><br />Grade 8 learner, Learnly student</span></div></div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="container-wide faq-grid">
            <div className="reveal"><p className="section-kicker mono">A few good questions</p><h2 className="section-title display">Nothing silly <em>about asking.</em></h2><p className="section-intro" style={{ marginTop: 24 }}>Choosing math support is personal. Here are the things families, learners, and teachers ask us first.</p></div>
            <div className="faq-list reveal reveal-delay-1">
              {faqs.map(([question, answer], index) => (
                <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}>
                  <button className="faq-button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} data-testid={`button-faq-${index}`}><span>{question}</span><ChevronDown size={18} /></button>
                  <div className="faq-answer">{answer}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container-wide final-inner reveal"><div><p className="mono">No big leap required</p><h2 className="display">A better math moment can start <em>today.</em></h2></div><div><p>Tell us what is going on. We will help you choose a useful next step, not sell you a package.</p><button className="button button-primary" onClick={() => goTo('request')} data-testid="button-request-final">Request a tutor <ArrowRight size={15} /></button></div></div>
        </section>
      </main>

      <footer className="footer">
        <div className="container-wide footer-inner"><button className="wordmark" onClick={() => goTo('top')} data-testid="button-footer-home"><span className="wordmark-mark" aria-hidden="true" />Learnly</button><span className="footer-meta">Math support for the way learning really happens.</span><div className="footer-links"><button onClick={() => notify('Our privacy page is being written with care.')} data-testid="button-privacy">Privacy</button><button onClick={() => notify('Say hello at hello@learnly.example')} data-testid="button-contact">Contact</button></div></div>
      </footer>
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite" data-testid="status-toast">{toast || ' '}</div>
    </div>
  );
}

export default App;