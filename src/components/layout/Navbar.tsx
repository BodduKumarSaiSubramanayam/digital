'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { Home, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  // High-level check for internal pages
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(95%, 1200px)',
      zIndex: 100,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderColor: 'rgba(255, 255, 255, 0.05)'
    }}>
      <div 
        onClick={() => window.location.href = '/'}
        style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.05em', cursor: 'pointer' }}
      >
        <span style={{ color: 'var(--primary)' }}>DIGITAL</span>HEROES
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {!isDashboard && (
          <>
            <a href="/how-it-works" style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.8 }}>How it Works</a>
            <a href="/charities" style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.8 }}>Charities</a>
            <a href="/admin" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '4px', opacity: 0.5 }}>[Admin Access]</a>
          </>
        )}

        {isDashboard ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button 
                variant="glass" 
                onClick={async () => {
                  const { supabase } = await import('@/lib/supabase');
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }} 
                style={{ height: '2.5rem', padding: '0 1rem', fontSize: '0.8rem' }}
            >
              <LogOut size={16} /> Sign Out
            </Button>
            <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 800
            }}>
              SH
            </div>
          </div>
        ) : !isAuthPage && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/login" className="btn-base btn-glass" style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.9rem', 
              fontWeight: 600
            }}>Sign In</a>
            <a href="/login" className="btn-base btn-primary" style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.9rem', 
              fontWeight: 600
            }}>Get Started</a>
          </div>
        )}
      </div>
    </nav>
  );
}
