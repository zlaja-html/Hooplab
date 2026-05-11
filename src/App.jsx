import React from 'react';
import { ArrowRight, ChevronDown, Globe2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { ApplicationForm } from '@/components/application-form';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const offers = [
  {
    title: 'Tryouts',
    body: 'Three-day evaluation events with coaching, competitive drills, and direct feedback.',
    number: '01'
  },
  {
    title: 'Individual Workouts',
    body: 'Personal workouts with scouting review, tailored development plans, and regular consultation.',
    number: '02'
  },
  {
    title: 'Group Sessions',
    body: 'Small-group sessions for competitive reps, direct coaching, and accountability.',
    number: '03'
  }
];

const aboutPoints = [
  'Germany-based basketball agency',
  'Player development, exposure, and scouting',
  'Work with players entering or growing in the European market'
];

const testimonials = [
  {
    name: 'Amoni Clarke',
    image: '/images/amoniclarke-testimonial.jpeg',
    text: 'Amoni Clark joined Germany during the second half of the season through HoopLab Agency, where we supported his first steps into the German basketball market. After building initial exposure and creating the right connections, he was able to establish himself with MTV Stuttgart in Regionalliga 1. There, he gained valuable playing time, adapted to the European style of basketball, and built strong in-game highlights against high-level competition on an important step in his professional journey.'
  },
  {
    name: 'Garrick Averett',
    image: '/images/garrickaverett-testimonial.jpeg',
    text: 'Garrick Averett’s first opportunity to enter the European basketball market was created through HoopLab Agency. We helped establish the initial connection and supported his move to the SV Böblingen Panthers, where he took his first steps in Germany competing in the Landesliga. During his time there, Garrick was able to gain valuable playing time, build strong game highlights, and establish himself within a new basketball environment on an important foundation in his professional journey.'
  },
  {
    name: 'Xavier Boyd',
    image: '/images/xavier-testimonial.jpeg',
    text: 'After arriving in Germany, Xavier used the Böblingen Panthers platform to adapt, earn minutes, and build momentum for his next move. HoopLab supported the process with development, exposure, and direct market communication.'
  }
];

const pathwaySteps = [
  'Tryouts are the first evaluation step for players who want real next-level opportunities.',
  'Selected players can move forward into tours, development work, and exposure opportunities.',
  'Training, feedback, and direct communication help support the next move.'
];

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--brand-night)] text-[var(--brand-paper)]">
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <TestimonialsSection />
        <OffersSection />
        <PathwaySection />
        <ApplicationSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 pt-5 md:px-8 md:pt-7">
        <div className="flex items-center justify-center rounded-full border border-white/10 bg-[rgba(12,22,34,0.82)] px-6 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-md md:px-8">
          <div className="hidden flex-1 items-center justify-end gap-8 pr-10 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand-paper)]/82 md:flex">
            <a href="#top" className="text-[var(--brand-accent)] transition hover:text-white">Home</a>
            <a href="#about" className="transition hover:text-white">About</a>
            <a href="#testimonials" className="transition hover:text-white">Testimonials</a>
          </div>
          <a href="#top" className="flex items-center justify-center">
            <img src="/images/Hooplablogo-sponzor.svg" alt="HoopLab" className="h-12 w-auto md:h-14" />
          </a>
          <nav className="hidden flex-1 items-center justify-start gap-8 pl-10 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand-paper)]/82 md:flex">
            <a href="#offers" className="transition hover:text-white">Offers</a>
            <a href="#pathway" className="transition hover:text-white">Pathway</a>
            <a href="#apply" className="transition hover:text-white">Apply</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-white/6">
      <div className="absolute inset-0">
        <img src="/images/Harun Coaching (9).jpeg" alt="HoopLab coach leading players" className="h-full w-full object-cover object-center opacity-38" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,24,34,0.82),rgba(15,24,34,0.58)_28%,rgba(15,24,34,0.78)),radial-gradient(circle_at_center,rgba(82,185,208,0.08),transparent_44%)]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-5 py-24 text-center md:px-8 md:py-32">
        <div className="space-y-7">
          <Reveal className="pt-24 md:pt-24">
            <Badge>Basketball agency in Germany</Badge>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mx-auto max-w-5xl font-display text-5xl uppercase leading-[0.88] tracking-[0.04em] text-white md:text-7xl xl:text-[6.6rem]">
              This is HoopLab.
              <span className="block">Development, exposure, opportunity.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mx-auto max-w-3xl text-base leading-8 text-[var(--brand-paper)]/82 md:text-[1.25rem]">
              We help players build their next step through tryouts, training, scouting, and direct connections in the European basketball market.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <a href="#apply">
                Start application
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#testimonials">View testimonials</a>
            </Button>
          </Reveal>
          <Reveal delay={0.26} className="mx-auto grid max-w-5xl gap-4 pt-6 md:grid-cols-3">
            <HeroStat title="Agency" body="Germany-based basketball development and exposure." />
            <HeroStat title="Players" body="Built around individual growth and real market opportunities." />
            <HeroStat title="Europe" body="Focused on helping players take the right next step." />
          </Reveal>
        </div>
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
    <div className="rounded-[28px] border border-white/10 bg-[rgba(18,29,42,0.46)] p-6 backdrop-blur-sm">
      <p className="font-display text-3xl uppercase tracking-[0.08em] text-[var(--brand-paper)]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--brand-paper)]/72">{body}</p>
    </div>
  );
}

function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <Card className="h-full">
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 text-[var(--brand-accent)]">
                <Globe2 className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.2em]">About us</span>
              </div>
              <h2 className="font-display text-4xl uppercase leading-tight md:text-5xl">
                A clean pathway into the European basketball market.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[var(--brand-muted)]">
                HoopLab works with players who need development, exposure, and the right connections. The focus is simple: clear evaluation, practical support, and the next opportunity.
              </p>
            </CardContent>
          </Card>
        </Reveal>
        <div className="grid gap-4">
          {aboutPoints.map((point, index) => (
            <Reveal key={point} delay={0.08 + (index * 0.08)}>
              <Card>
                <CardContent className="flex items-center gap-5">
                  <span className="font-display text-4xl text-[var(--brand-accent)]">0{index + 1}</span>
                  <p className="text-base leading-7 text-[var(--brand-muted)]">{point}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-y border-white/6 bg-[var(--brand-slate-deep)]/45">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title="Players we have worked with."
            body="A few examples of how HoopLab has helped players enter the market, build exposure, and move forward."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={0.08 + (index * 0.08)}>
              <Card className="h-full overflow-hidden">
                <img src={item.image} alt={item.name} className="h-72 w-full object-cover object-top" />
                <CardContent className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-accent)]">Client testimonial</p>
                  <h3 className="font-display text-3xl uppercase">{item.name}</h3>
                  <p className="text-base leading-7 text-[var(--brand-muted)]">{item.text}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OffersSection() {
  return (
    <section id="offers" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Offers"
          title="What we offer."
          body="The programs stay the same, but the structure is clearer: evaluation, training, and ongoing support."
        />
      </Reveal>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {offers.map((offer, index) => (
          <Reveal key={offer.title} delay={0.08 + (index * 0.08)}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-10">
                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl text-[var(--brand-accent)]">{offer.number}</span>
                  <Users className="h-5 w-5 text-[var(--brand-accent)]" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-display text-3xl uppercase">{offer.title}</h3>
                  <p className="text-base leading-7 text-[var(--brand-muted)]">{offer.body}</p>
                </div>
                <div className="mt-auto border-t border-white/8 pt-5 text-xs uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                  Development, evaluation, and opportunity.
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
              eyebrow="Pathway"
              title="Evaluation first. Opportunity next."
              body="HoopLab does not position tours as a shortcut. Players are evaluated first, then the strongest fits move forward into real opportunities."
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
            <a className="block hover:text-white" href="#testimonials">Testimonials</a>
            <a className="block hover:text-white" href="#offers">Offers</a>
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
