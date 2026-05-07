import React from 'react';
import { ArrowRight, ChevronDown, Globe2, ShieldCheck, Trophy, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { ApplicationForm } from '@/components/application-form';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    title: 'Tryouts',
    body: 'Evaluation-based events built around live reads, coachability, and pressure performance, not empty volume.',
    number: '01'
  },
  {
    title: 'Individual Workouts',
    body: 'Direct player development tied to scouting feedback, film review, and an exact correction plan.',
    number: '02'
  },
  {
    title: 'Group Sessions',
    body: 'Small-group reps for players who need pace, competition, accountability, and direct corrections.',
    number: '03'
  }
];

const pathwaySteps = [
  'Enter through tryouts or targeted development work.',
  'Get evaluated on habits, reads, consistency, and real team utility.',
  'Use feedback, training, and exposure to earn the next move.'
];

const successStories = [
  {
    name: 'Xavier Boyd',
    line: 'Used the German pathway to move from Boeblingen to Kirchheim after proving value in a structured club environment.',
    image: '/images/Xavier Boyd.jpeg'
  },
  {
    name: 'HoopLab Players',
    line: 'Players are positioned through direct communication, disciplined development, and honest market fit.',
    image: '/images/Xavier in-Game.jpeg'
  }
];

const aboutBullets = [
  'HoopLab is built for players chasing the next level in Germany and across Europe.',
  'The agency combines coaching, scouting, development, and exposure into one serious process.',
  'Every recommendation is tied to game transfer, not aesthetics or hype.'
];

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--brand-night)] text-[var(--brand-paper)]">
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <SuccessSection />
        <ServicesSection />
        <PathwaySection />
        <ApplicationSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(11,15,23,0.82)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <a href="#top" className="flex items-center gap-4">
          <img src="/images/Hooplablogo-sponzor.svg" alt="HoopLab" className="h-12 w-12 rounded-xl bg-white/4 p-1.5" />
          <div className="leading-none">
            <strong className="font-display text-2xl uppercase tracking-[0.12em]">HoopLab</strong>
            <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[var(--brand-accent)]">Agency</p>
          </div>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--brand-muted)] md:flex">
          <a href="#about" className="transition hover:text-white">Mission</a>
          <a href="#success" className="transition hover:text-white">Success</a>
          <a href="#services" className="transition hover:text-white">Services</a>
          <a href="#pathway" className="transition hover:text-white">Pathway</a>
          <Button asChild variant="secondary"><a href="#apply">Apply</a></Button>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-white/6">
      <div className="absolute inset-0">
        <img src="/images/Harun Coaching (9).jpeg" alt="HoopLab coach leading players" className="h-full w-full object-cover object-center opacity-22" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(82,185,208,0.16),transparent_36%),linear-gradient(180deg,rgba(11,15,23,0.55),rgba(11,15,23,0.96))]" />
      </div>
      <div className="relative mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-end gap-12 px-5 py-18 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-24">
        <div className="space-y-8">
          <Reveal>
            <Badge>International basketball pathways</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="max-w-4xl font-display text-6xl uppercase leading-[0.92] tracking-[0.02em] md:text-8xl">
              Serious development for players chasing Europe.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="max-w-2xl text-lg leading-8 text-[var(--brand-muted)] md:text-xl">
              HoopLab Agency is a basketball development and exposure group in Germany built for players who need evaluation, direct coaching, and real next-step positioning.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <a href="#apply">
                Start application
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#pathway">Explore pathway</a>
            </Button>
          </Reveal>
          <Reveal delay={0.3} className="grid gap-4 pt-8 sm:grid-cols-3">
            <HeroStat title="Elite tryouts" body="3-day evaluation formats that punish empty habits and reward real decision-making." />
            <HeroStat title="Market fit" body="Programs are built around where a player can actually move next." />
            <HeroStat title="European track" body="Germany-based work tied to real club environments and exposure." />
          </Reveal>
        </div>

        <Reveal delay={0.22} className="justify-self-stretch md:justify-self-end">
          <Card className="overflow-hidden">
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-accent)]">HoopLab standard</p>
                  <h2 className="mt-2 font-display text-3xl uppercase">No shortcuts.</h2>
                </div>
                <ShieldCheck className="h-8 w-8 text-[var(--brand-accent)]" />
              </div>
              <ul className="space-y-4 text-sm leading-7 text-[var(--brand-muted)]">
                <li>Players are evaluated on reads, habits, role acceptance, and consistency under pressure.</li>
                <li>Tours are not sold as a fantasy. They are earned through performance and fit.</li>
                <li>Training is direct, corrective, and tied to real film or live-game context.</li>
              </ul>
              <div className="rounded-[24px] border border-[var(--brand-accent)]/20 bg-[var(--brand-accent)]/8 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-accent)]">Serious players only</p>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-paper)]">
                  This is a premium basketball-agency environment, not a generic camp landing page.
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
      <a href="#about" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--brand-muted)] md:flex">
        Scroll
        <ChevronDown className="h-4 w-4" />
      </a>
    </section>
  );
}

function HeroStat({ title, body }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm">
      <p className="font-display text-2xl uppercase text-[var(--brand-paper)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">{body}</p>
    </div>
  );
}

function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="About / Mission"
          title="A basketball agency built around reality, not marketing noise."
          body="The visual identity stays inside the logo colorway: deep slate structure, cyan precision, and restrained contrast. The same discipline drives the work on court."
        />
      </Reveal>
      <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal delay={0.08}>
          <Card className="h-full">
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3 text-[var(--brand-accent)]">
                <Globe2 className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.2em]">International focus</span>
              </div>
              <h3 className="font-display text-4xl uppercase leading-tight">Germany-based. Europe-facing.</h3>
              <p className="text-base leading-7 text-[var(--brand-muted)]">
                HoopLab operates from Boeblingen and works with players who need more than a workout. They need evaluation, structure, and a pathway that can stand up to better competition.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricBlock value="01" label="Scouting + coaching" />
                <MetricBlock value="02" label="Player development" />
                <MetricBlock value="03" label="Exposure process" />
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <div className="grid gap-6">
          {aboutBullets.map((item, index) => (
            <Reveal key={item} delay={0.12 + (index * 0.08)}>
              <Card>
                <CardContent className="flex items-start gap-5">
                  <span className="font-display text-4xl text-[var(--brand-accent)]">0{index + 1}</span>
                  <p className="text-base leading-8 text-[var(--brand-muted)]">{item}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricBlock({ value, label }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-[var(--brand-night-soft)] p-4">
      <p className="font-display text-3xl text-[var(--brand-paper)]">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--brand-muted)]">{label}</p>
    </div>
  );
}

function SuccessSection() {
  return (
    <section id="success" className="border-y border-white/6 bg-[var(--brand-slate-deep)]/45">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Success stories"
            title="Pathways only matter when they produce movement."
            body="The HoopLab process is supposed to create proof: adaptation, role clarity, performance, and better opportunities."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {successStories.map((story, index) => (
            <Reveal key={story.name} delay={0.08 + (index * 0.1)}>
              <Card className="overflow-hidden">
                <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                  <img src={story.image} alt={story.name} className="h-full min-h-[280px] w-full object-cover" />
                  <CardContent className="flex flex-col justify-between gap-8">
                    <div className="space-y-4">
                      <Trophy className="h-5 w-5 text-[var(--brand-accent)]" />
                      <h3 className="font-display text-3xl uppercase">{story.name}</h3>
                      <p className="text-base leading-7 text-[var(--brand-muted)]">{story.line}</p>
                    </div>
                    <p className="text-sm uppercase tracking-[0.18em] text-[var(--brand-accent)]">Real progression over empty promises</p>
                  </CardContent>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Services"
          title="Each service exists for a specific basketball need."
          body="Clean, direct, and reusable: every section is built from the same brand system, and every HoopLab offer is tied to a practical next action."
        />
      </Reveal>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {services.map((service, index) => (
          <Reveal key={service.title} delay={0.08 + (index * 0.08)}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-10">
                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl text-[var(--brand-accent)]">{service.number}</span>
                  <Users className="h-5 w-5 text-[var(--brand-accent)]" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-3xl uppercase">{service.title}</h3>
                  <p className="text-base leading-7 text-[var(--brand-muted)]">{service.body}</p>
                </div>
                <div className="mt-auto border-t border-white/8 pt-5 text-xs uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                  Serious environment. No generic reps.
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function PathwaySection() {
  return (
    <section id="pathway" className="relative overflow-hidden border-y border-white/6 bg-[linear-gradient(180deg,rgba(49,59,80,0.32),rgba(11,15,23,1))]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Player pathway"
              title="Evaluation first. Exposure second."
              body="The site now visually treats the player pathway as the central operating logic of the agency: dark, ordered, premium, and derived from the same brand marks as the logo."
            />
            <div className="space-y-4">
              {pathwaySteps.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <span className="font-display text-3xl text-[var(--brand-accent)]">0{index + 1}</span>
                  <p className="pt-1 text-base leading-7 text-[var(--brand-muted)]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <Card className="overflow-hidden">
            <div className="relative">
              <img src="/images/Harun Coaching (3).jpeg" alt="HoopLab session" className="h-full min-h-[520px] w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,23,0.08),rgba(11,15,23,0.95))]" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[26px] border border-[var(--brand-accent)]/25 bg-[rgba(13,18,27,0.84)] p-6 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-accent)]">Positioning note</p>
                  <p className="mt-3 text-base leading-7 text-[var(--brand-paper)]">
                    Players are not promised a fantasy outcome. They are prepared, corrected, and evaluated until the right opening becomes defendable.
                  </p>
                </motion.div>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function ApplicationSection() {
  return (
    <section id="apply" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
        <Reveal>
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Application"
              title="Send the player profile."
              body="This form stays connected to the existing API flow. Workout and group-session choices pull from the current staff-managed availability."
            />
            <div className="rounded-[30px] border border-white/8 bg-[var(--brand-slate-deep)]/55 p-7">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-accent)]">What to include</p>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--brand-muted)]">
                <li>Current age, position, and real playing level</li>
                <li>Team history, countries, and strongest competition faced</li>
                <li>Clear reason for applying right now</li>
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ApplicationForm />
        </Reveal>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/6 bg-[var(--brand-night-soft)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <img src="/images/Hooplablogo-sponzor.svg" alt="HoopLab" className="h-12 w-12 rounded-xl bg-white/4 p-1.5" />
            <div>
              <p className="font-display text-2xl uppercase tracking-[0.12em]">HoopLab Agency</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-accent)]">International basketball development</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--brand-muted)]">
            Serious basketball development, scouting, tryouts, and player positioning from Boeblingen, Germany.
          </p>
        </div>
        <div className="grid gap-4 text-sm text-[var(--brand-muted)] sm:grid-cols-2">
          <div className="space-y-2">
            <p className="font-semibold uppercase tracking-[0.18em] text-[var(--brand-paper)]">Navigate</p>
            <a className="block hover:text-white" href="#services">Services</a>
            <a className="block hover:text-white" href="#pathway">Pathway</a>
            <a className="block hover:text-white" href="#apply">Apply</a>
            <a className="block hover:text-white" href="/employee-appointments.html">Staff workspace</a>
          </div>
          <div className="space-y-2">
            <p className="font-semibold uppercase tracking-[0.18em] text-[var(--brand-paper)]">Contact</p>
            <p>Schlossberg 3</p>
            <p>71032 Boeblingen, Germany</p>
            <a className="block hover:text-white" href="mailto:contact@hooplab-agency.com">contact@hooplab-agency.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
