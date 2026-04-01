'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card } from '@/components/ui';
import { getCharityDirectory, Charity } from '@/lib/services/charity-service';
import { signupAction } from '@/app/actions/auth-actions';
import { ArrowRight, ArrowLeft, Heart, CheckCircle, Shield, ChevronRight, Eye, EyeOff, Flame, Plus } from 'lucide-react';
import { useEffect } from 'react';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    charityId: '',
    charityPercent: 10,
    plan: 'monthly'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCharityDirectory().then(data => {
      setCharities(data);
    });
  }, []);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { title: 'Create Account', icon: <Shield size={24} /> },
    { title: 'Choose Charity', icon: <Heart size={24} /> },
    { title: 'Select Plan', icon: <CheckCircle size={24} /> }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '6rem 2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '0.75rem',
              opacity: step >= i + 1 ? 1 : 0.3,
            }}>
              <div className="glass" style={{ 
                width: '3rem', 
                height: '3rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '50%',
                background: step === i + 1 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)'
              }}>
                {s.icon}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.title}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Get Started</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <Input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <Input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <Button onClick={nextStep} style={{ width: '100%' }}>Continue <ArrowRight size={20} /></Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <Button onClick={prevStep} variant="ghost" style={{ padding: '0.5rem' }}><ArrowLeft size={18} /></Button>
                  <h2 style={{ fontSize: '2rem' }}>Support a Charity</h2>
                </div>
                {charities.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setFormData({...formData, charityId: c.id})}
                    className="glass" 
                    style={{ 
                      padding: '1rem', 
                      cursor: 'pointer',
                      background: formData.charityId === c.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      borderColor: formData.charityId === c.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                      marginBottom: '1rem'
                    }}
                  >
                    <h4 style={{ fontSize: '1.1rem' }}>{c.name}</h4>
                    <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>{c.description}</p>
                  </div>
                ))}

                {formData.charityId && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Your Hero Contribution</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{formData.charityPercent}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="50" 
                      step="5"
                      value={formData.charityPercent}
                      onChange={e => setFormData({...formData, charityPercent: parseInt(e.target.value)})}
                      style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.5rem' }}>PRD Minimum: 10%. You can voluntarily increase your impact.</div>
                  </motion.div>
                )}

                <Button onClick={nextStep} disabled={!formData.charityId} style={{ width: '100%', marginTop: '2rem' }}>Next Step <ArrowRight size={20} /></Button>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <Button onClick={prevStep} variant="ghost" style={{ padding: '0.5rem' }}><ArrowLeft size={18} /></Button>
                  <h2 style={{ fontSize: '2rem' }}>Select a Plan</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div onClick={() => setFormData({...formData, plan: 'monthly'})} className="glass" style={{ padding: '2rem', textAlign: 'center', borderColor: formData.plan === 'monthly' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)' }}>$29/mo</div>
                   <div onClick={() => setFormData({...formData, plan: 'yearly'})} className="glass" style={{ padding: '2rem', textAlign: 'center', borderColor: formData.plan === 'yearly' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)' }}>$279/yr</div>
                </div>
                <Button 
                    disabled={isSubmitting}
                    onClick={async () => {
                        setIsSubmitting(true);
                        // 1. Register Auth locally
                        const result = await signupAction(formData);
                        if (result?.success) {
                           // 1.5 Authenticate browser session
                           const { supabase } = await import('@/lib/supabase');
                           await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
                           // 2. Process mock/real Payment via Stripe API
                           try {
                              const res = await fetch('/api/checkout', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  plan: formData.plan,
                                  email: formData.email,
                                  charityId: formData.charityId,
                                  charityPercent: formData.charityPercent,
                                  userId: 'new-user-auth-id' // Ideally pass real ID via signupAction response
                                })
                              });
                              const data = await res.json();
                              if (data.url) {
                                window.location.href = data.url;
                                return;
                              }
                           } catch (e) {
                              console.error(e);
                           }
                           
                           // Fallback redirect
                           window.location.href = '/dashboard';
                        } else {
                            if (result?.error?.includes('seconds') || result?.error?.includes('rate limit')) {
                               alert("Please wait 60 seconds before trying again, or try logging in if you already created this account.");
                            } else {
                               alert(result?.error || "Signup failed. Please try again.");
                            }
                            setIsSubmitting(false);
                        }
                    }} 
                    style={{ width: '100%', marginTop: '2.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                >
                    {isSubmitting ? 'Securing your spot...' : 'Complete Subscription'} <CheckCircle size={20} />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
