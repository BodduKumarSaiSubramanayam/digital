'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Card } from '@/components/ui';
import { ArrowRight, Shield, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoggingIn(false);
    
    if (error) {
      alert("Login failed: " + error.message);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.75rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--primary)' }}>DIGITAL</span>HEROES
             </div>
             <p style={{ opacity: 0.6 }}>Welcome back. Please enter your details.</p>
          </div>

          <Card>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.8 }}>
                  <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> Remember me
                </label>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Forgot password?</a>
              </div>

              <Button type="submit" style={{ width: '100%', marginTop: '1rem', height: '3.5rem' }}>
                Sign In <ArrowRight size={20} />
              </Button>
            </form>
          </Card>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', opacity: 0.6 }}>
            Don't have an account? <a href="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>Join Digital Heroes</a>
          </p>

          <div style={{ 
            marginTop: '4rem', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem',
            opacity: 0.3,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={14} /> SECURE BASE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={14} /> ULTRA FAST</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
