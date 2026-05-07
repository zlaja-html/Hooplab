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
    body: 'Three-day evaluation events with coaching, competitive drills, and direct feedback built around how a player actually performs.',
    number: '01'
  },
  {
    title: 'Individual Workouts',
    body: 'Individual workouts include scouting review, tailored development plans, and regular consultation built around each player.',
    number: '02'
  },
  {
    title: 'Group Sessions',
    body: 'Monthly small-group development sessions for players who want competitive reps and direct coaching.',
    number: '03'
  }
];

const pathwaySteps = [
  'Tryouts are the evaluation step for players who want real next-level opportunities.',
  'Selected players can move forward into tours, development work, and exposure opportunities.',
  'Training, feedback, and direct communication help support the next move.'
];

const successStories = [
  {
    name: 'Xavier Boyd',
    line: 'After arriving in Germany, Xavier used the Boeblingen Panthers platform to adapt, earn minutes, and eventually secure a move to Kirchheim.',
    image: '/images/Xavier Boyd.jpeg'
  },
  {
    name: 'Player Pathways',
    line: 'HoopLab combines consistent performance, targeted exposure, and active communication in the German basketball market.',
    image: '/images/Xavier in-Game.jpeg'
  }
];

const aboutBullets = [
  'HoopLab Agency operates from Boeblingen, Germany and works with players who need real basketball development and direct evaluation.',
  'The agency combines coaching, scouting, training, and exposure opportunities across Europe.',
  'Players can access tryouts, workouts, group sessions, consultation, and a clear next-step pathway.'
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
          <a href="#about" className="transition hover:text-white">About</a>
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
        <img src="/images/Harun Coaching (9).jpeg" alt="HoopLab coach leading players" className="h-full w-full object-cover object-center opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(82,185,208,0.22),transparent_38%),linear-gradient(180deg,rgba(32,41,58,0.28),rgba(17,24,36,0.82))]" />
      </div>
      <div className="relative mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-end gap-12 px-5 py-18 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-24">
        <div className="space-y-8">
          <Reveal>
            <Badge>International basketball pathways</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="max-w-4xl font-display text-6xl uppercase leading-[0.92] tracking-[0.02em] md:text-8xl">
              For players chasing the next level.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="max-w-2xl text-lg leading-8 text-[var(--brand-muted)] md:text-xl">
              HoopLab Agency is a basketball development and exposure agency in Germany, helping players access tryouts, tours, workouts, scouting, and real next-step opportunities across Europe.
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
            <HeroStat title="Tryout" body="Elite 3-day tryout designed to test your skills in real game situations." />
            <HeroStat title="Perform" body="Top performers earn opportunities for teams, tours, and next-level exposure." />
            <HeroStat title="Compete" body="Compete across Europe and showcase your talent in front of real teams." />
          </Reveal>
        </div>

        <Reveal delay={0.22} className="justify-self-stretch md:justify-self-end">
          <Card className="overflow-hidden">
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-accent)]">HoopLab standard</p>
                  <h2 className="mt-2 font-display text-3xl uppercase">Evaluation, development, exposure.</h2>
                </div>
                <ShieldCheck className="h-8 w-8 text-[var(--brand-accent)]" />
              </div>
              <ul className="space-y-4 text-sm leading-7 text-[var(--brand-muted)]">
                <li>Tryouts are used to evaluate consistency, decision-making, effort, and performance under pressure.</li>
                <li>Tours are the next opportunity for the right players after evaluation.</li>
                <li>Training is built around practical development, scouting feedback, and clear next actions.</li>
              </ul>
              <div className="rounded-[24px] border border-[var(--brand-accent)]/20 bg-[var(--brand-accent)]/8 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-accent)]">Built for the next step</p>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-paper)]">
                  HoopLab combines development, feedback, and exposure into one clear basketball pathway.
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
          title="Basketball development and exposure built around a clear pathway."
          body="HoopLab Agency works with players in Germany and across Europe who need real basketball development, direct evaluation, and a practical next step."
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
              <h3 className="font-display text-4xl uppercase leading-tight">Germany-based. Europe-focused.</h3>
              <p className="text-base leading-7 text-[var(--brand-muted)]">
                HoopLab offers individual workouts, group sessions, tryouts, consultation, and direct communication to help players find the right next opportunity.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricBlock value="01" label="Tryouts" />
                <MetricBlock value="02" label="Training" />
                <MetricBlock value="03" label="Exposure" />
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
          title="Player pathways that lead to the next move."
          body="Development, consistent performance, and market communication work best when they support a clear opportunity."
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
                    <p className="text-sm uppercase tracking-[0.18em] text-[var(--brand-accent)]">Development, exposure, and progression</p>
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
          title="Choose the best way to train for you."
          body="Some players need direct development work, some need competitive group reps, and some need clear feedback before making the next move."
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
                  Built around development and opportunity.
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
    <section id="pathway" className="relative overflow-hidden border-y border-white/6 bg-[linear-gradient(180deg,rgba(49,59,80,0.22),rgba(32,41,58,0.74))]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Player pathway"
              title="Tryouts are the evaluation step. Tours are the next opportunity."
              body="HoopLab does not offer tours as a shortcut. Players are evaluated first, then the strongest fits can move forward into real opportunities."
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
              <img src="/images/Harun Coaching (1).jpeg" alt="HoopLab tryout session" className="h-full min-h-[520px] w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,248,252,0.02),rgba(22,29,42,0.82))]" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[26px] border border-[var(--brand-accent)]/25 bg-[rgba(13,18,27,0.84)] p-6 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-accent)]">Pathway note</p>
                  <p className="mt-3 text-base leading-7 text-[var(--brand-paper)]">
                    Game film, feedback, and direct communication are used to support the next opportunity.
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
              body="Choose the right program and share your playing background. Every application is reviewed by the HoopLab team."
            />
            <div className="rounded-[30px] border border-white/8 bg-[var(--brand-slate-deep)]/55 p-7">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-accent)]">Programs</p>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--brand-muted)]">
                <li>Tryouts</li>
                <li>Individual Workouts</li>
                <li>Group Sessions and Consultation</li>
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
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-accent)]">International basketball development and exposure</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--brand-muted)]">
            Basketball development, scouting, tryouts, workouts, and exposure opportunities from Boeblingen, Germany.
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
