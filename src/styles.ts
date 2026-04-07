import type { CSSProperties } from 'react';

const CARD_SHADOW = [
  'inset 0 3px 0 rgba(255,255,255,0.22)',
  'inset 4px 0 0 rgba(255,255,255,0.13)',
  'inset -4px 0 0 rgba(0,0,0,0.35)',
  'inset 0 -3px 0 rgba(0,0,0,0.45)',
  '0 2px 0 #0c1624',
  '0 4px 0 #09111e',
  '0 6px 0 #060d18',
  '0 8px 0 #040a12',
  '0 10px 0 rgba(3,7,14,0.55)',
  '0 16px 36px rgba(0,0,0,0.70)',
  '0 7px 16px rgba(0,0,0,0.55)',
].join(',');

const BTN_SHADOW = [
  'inset 0 1px 0 rgba(255,255,255,0.09)',
  '0 3px 0 #1a2535',
  '0 5px 0 #111c28',
  '0 7px 0 rgba(6,12,22,0.50)',
  '0 10px 18px rgba(0,0,0,0.50)',
].join(',');

const BTN_ORANGE_SHADOW = [
  'inset 0 1px 0 rgba(255,255,255,0.22)',
  '0 3px 0 #b85a10',
  '0 5px 0 #7c3a08',
  '0 7px 0 rgba(60,20,0,0.35)',
  '0 10px 20px rgba(251,146,60,0.20)',
  '0 5px 12px rgba(0,0,0,0.40)',
].join(',');

export const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: '100vh',
    color: 'var(--c-text)',
    padding: 'var(--pad)',
    fontFamily: 'var(--font-sans)',
  },

  card: {
    background: 'linear-gradient(140deg, var(--c-card-from) 0%, var(--c-card-mid) 35%, var(--c-card-to) 100%)',
    borderRadius: 'var(--r-card)',
    padding: 'var(--pad)',
    marginBottom: 'var(--gap)',
    border: '1px solid var(--c-border)',
    borderTop: '1px solid var(--c-border-top)',
    borderLeft: '1px solid rgba(140,190,255,0.20)',
    borderBottom: '1px solid rgba(0,0,0,0.70)',
    borderRight: '1px solid rgba(0,0,0,0.45)',
    boxShadow: CARD_SHADOW,
  },

  btn: {
    width: '100%',
    padding: '8px 4px',
    borderRadius: 'var(--r-btn)',
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.10)',
    backgroundColor: 'var(--c-surface-3)',
    color: 'var(--c-text)',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transform: 'translateY(-3px)',
    boxShadow: BTN_SHADOW,
  },

  btnOrange: {
    borderTop: '1px solid rgba(255,255,255,0.22)',
    backgroundColor: 'var(--c-orange)',
    fontWeight: '700',
    boxShadow: BTN_ORANGE_SHADOW,
  },
};
