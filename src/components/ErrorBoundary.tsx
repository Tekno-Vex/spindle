'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight:'100vh', background:'var(--bg)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'40px', textAlign:'center',
        }}>
          <div style={{ fontSize:'64px', marginBottom:'24px', opacity:.2 }}>◎</div>
          <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'28px', color:'var(--text)', marginBottom:'12px' }}>
            Something went wrong
          </h2>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)', marginBottom:'24px', maxWidth:'360px' }}>
            Spindle hit an unexpected error. Your data is safe — just reload to continue discovering.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily:'var(--font-mono)', fontSize:'13px',
              padding:'10px 24px', borderRadius:'99px',
              background:'var(--accent)', color:'white',
              border:'none', cursor:'pointer',
            }}
          >
            Reload Spindle
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}