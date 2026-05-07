import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PROGRAMS = [
  { value: 'tryouts', label: 'Tryouts' },
  { value: 'individual-workouts', label: 'Individual Workouts' },
  { value: 'group-sessions', label: 'Group Sessions' },
  { value: 'consultation', label: 'Consultation' }
];

function emptyForm() {
  return {
    program: 'tryouts',
    appointment: '',
    name: '',
    age: '',
    position: '',
    experience: '',
    email: '',
    phone: '',
    extra_field: ''
  };
}

function groupSlots(availability, counts, program) {
  return availability
    .filter(slot => slot.program === program && slot.active)
    .map(slot => {
      const booked = counts[slot.appointment] || 0;
      return {
        id: slot.id,
        appointment: slot.appointment,
        label: slot.label || slot.appointment,
        note: slot.note || '',
        remaining: Math.max(0, Number(slot.capacity || 1) - booked)
      };
    })
    .filter(slot => slot.remaining > 0)
    .sort((a, b) => String(a.appointment).localeCompare(String(b.appointment)));
}

export function ApplicationForm() {
  const [form, setForm] = useState(emptyForm);
  const [slots, setSlots] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/availability?public=1').then(response => response.ok ? response.json() : { availability: [] }).catch(() => ({ availability: [] })),
      fetch('/api/bookings?public=1').then(response => response.ok ? response.json() : { counts: {} }).catch(() => ({ counts: {} }))
    ]).then(([availabilityResult, countsResult]) => {
      setSlots(availabilityResult.availability || []);
      setCounts(countsResult.counts || {});
    });
  }, []);

  const appointmentPrograms = new Set(['individual-workouts', 'group-sessions']);
  const availableSlots = useMemo(() => groupSlots(slots, counts, form.program), [slots, counts, form.program]);

  useEffect(() => {
    if (!appointmentPrograms.has(form.program)) {
      return;
    }

    if (!availableSlots.some(slot => slot.appointment === form.appointment)) {
      setForm(current => ({ ...current, appointment: availableSlots[0]?.appointment || '' }));
    }
  }, [availableSlots, form.program, form.appointment]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({ type: 'error', message: result.error || 'Could not send your application right now.' });
        return;
      }

      setStatus({ type: 'success', message: 'Application received. HoopLab will review and respond soon.' });
      setForm(emptyForm());
    } catch {
      setStatus({ type: 'error', message: 'Could not send your application right now.' });
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[var(--brand-accent)]">
            <CalendarClock className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Application form</span>
          </div>
          <p className="text-sm leading-6 text-[var(--brand-muted)]">
            Choose the right program, add your details, and select an open slot if you need a workout or group session.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[var(--brand-paper)]">
              <span>Program</span>
              <select
                className="h-12 w-full rounded-2xl border border-white/10 bg-[var(--brand-slate-soft)] px-4 text-sm text-[var(--brand-paper)] outline-none focus:border-[var(--brand-accent)]/70"
                value={form.program}
                onChange={event => updateField('program', event.target.value)}
                required
              >
                {PROGRAMS.map(program => <option key={program.value} value={program.value}>{program.label}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm text-[var(--brand-paper)]">
              <span>Name</span>
              <Input value={form.name} onChange={event => updateField('name', event.target.value)} required />
            </label>
          </div>

          {appointmentPrograms.has(form.program) ? (
            <label className="space-y-2 text-sm text-[var(--brand-paper)]">
              <span>Available appointment</span>
              <select
                className="h-12 w-full rounded-2xl border border-white/10 bg-[var(--brand-slate-soft)] px-4 text-sm text-[var(--brand-paper)] outline-none focus:border-[var(--brand-accent)]/70"
                value={form.appointment}
                onChange={event => updateField('appointment', event.target.value)}
                required
              >
                {availableSlots.length ? availableSlots.map(slot => (
                  <option key={slot.id} value={slot.appointment}>
                    {slot.label} | {slot.remaining} left{slot.note ? ` | ${slot.note}` : ''}
                  </option>
                )) : <option value="">No open appointments right now</option>}
              </select>
            </label>
          ) : null}

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-2 text-sm text-[var(--brand-paper)]">
              <span>Age</span>
              <Input value={form.age} onChange={event => updateField('age', event.target.value)} required />
            </label>
            <label className="space-y-2 text-sm text-[var(--brand-paper)]">
              <span>Position</span>
              <Input value={form.position} onChange={event => updateField('position', event.target.value)} required />
            </label>
            <label className="space-y-2 text-sm text-[var(--brand-paper)]">
              <span>Phone / WhatsApp</span>
              <Input value={form.phone} onChange={event => updateField('phone', event.target.value)} required />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[var(--brand-paper)]">
              <span>Email</span>
              <Input type="email" value={form.email} onChange={event => updateField('email', event.target.value)} required />
            </label>
            <label className="hidden">
              <span>Ignore this field</span>
              <Input value={form.extra_field} onChange={event => updateField('extra_field', event.target.value)} />
            </label>
          </div>

          <label className="space-y-2 text-sm text-[var(--brand-paper)]">
            <span>Playing experience</span>
            <Textarea value={form.experience} onChange={event => updateField('experience', event.target.value)} required />
          </label>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className={`text-sm ${status.type === 'error' ? 'text-red-300' : 'text-[var(--brand-muted)]'}`}>
              {status.message || 'Every application is reviewed manually by the HoopLab team.'}
            </p>
            <Button size="lg" type="submit" disabled={submitting || (appointmentPrograms.has(form.program) && !form.appointment)}>
              <Send className="mr-2 h-4 w-4" />
              {submitting ? 'Sending...' : 'Submit application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
