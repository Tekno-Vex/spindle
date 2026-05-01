'use client';
import { useState, useEffect } from 'react';

const STEPS = [
  {
    title:   'Welcome to Spindle',
    icon:    '◎',
    body:    'Discover 5,000 of the greatest albums ever made — from the RYM all-time charts. Press Roll or hit Space to get your first album.',
    highlight: null,
  },
  {
    title:   'Filter Your Pool',
    icon:    '⊞',
    body:    'Use the left sidebar to filter by era, rating, and genre. The pool counter shows how many albums match — then Roll picks randomly from them.',
    highlight: null,
  },
  {
    title:   'Explore the Modes',
    icon:    '◐',
    body:    'Try Blind Mode to guess an album\'s rating, vs. Mode for a bracket tournament of 8 albums, or Decade Safari to tour music history decade by decade.',
    highlight: null,
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step,    setStep]    = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('spindle_onboarded');
    if (!seen) {
      // Small delay so page renders first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('spindle_onboarded', '1');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(4,4,12,.6)', backdropFilter:'blur(4px)' }}
      />

      {/* Tour card */}
      <div style={{
        position:'fixed',
        bottom:'40px',
        left:'50%',
        transform:'translateX(-50%)',
        zIndex:201,
        width:'min(480px, calc(100vw - 32px))',
        background:'var(--bg-card)',
        border:'1px solid var(--border-mid)',
        borderRadius:'24px',
        padding:'28px 32px',
        boxShadow:'0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(168,85,247,.2)',
        animation:'cardIn .4s cubic-bezier(.16,1,.3,1)',
      }}>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex:1, height:'3px', borderRadius:'99px',
              background: i <= step ? 'var(--accent)' : 'var(--border-mid)',
              transition:'background .3s',
            }}/>
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize:'36px', marginBottom:'12px', color:'var(--accent)' }}>
          {current.icon}
        </div>

        {/* Content */}
        <h3 style={{ fontFamily:'var(--font-playfair)', fontSize:'22px', fontWeight:700, color:'var(--text)', marginBottom:'10px', lineHeight:1.2 }}>
          {current.title}
        </h3>
        <p style={{ fontFamily:'var(--font-inter)', fontSize:'14px', color:'var(--text-sub)', lineHeight:1.65, marginBottom:'24px' }}>
          {current.body}
        </p>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button
            onClick={dismiss}
            style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', letterSpacing:'.06em' }}
          >
            Skip tour
          </button>
          <button
            onClick={next}
            style={{
              fontFamily:'var(--font-mono)', fontSize:'12px', fontWeight:700,
              padding:'10px 24px', borderRadius:'99px',
              background:'var(--accent)', color:'white',
              border:'none', cursor:'pointer', letterSpacing:'.06em',
              transition:'opacity .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity='.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity='1')}
          >
            {step < STEPS.length - 1 ? 'Next →' : "Let's go →"}
          </button>
        </div>
      </div>
    </>
  );
}