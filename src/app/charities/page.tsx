'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Filter, ArrowRight, ShieldCheck, Info, X, DollarSign } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { getCharityDirectory, Charity } from '@/lib/services/charity-service';
import { useEffect } from 'react';

export default function CharitiesPage() {
  const [search, setSearch] = useState('');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [donateModal, setDonateModal] = useState<{isOpen: boolean; charity: Charity | null}>({ isOpen: false, charity: null });
  const [donateAmount, setDonateAmount] = useState('50');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle Stripe Donation submission
  const handleDonation = async () => {
     if (!donateModal.charity) return;
     setIsProcessing(true);
     try {
       const res = await fetch('/api/donate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             amount: parseInt(donateAmount) || 50, 
             charityId: donateModal.charity.id,
             charityName: donateModal.charity.name 
          })
       });
       const data = await res.json();
       if (data.url) {
          window.location.href = data.url;
          return;
       }
     } catch (e) {
       console.error("Donation failed:", e);
     }
     setIsProcessing(false);
  };

  useEffect(() => {
    getCharityDirectory().then(setCharities);
  }, []);

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '10rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginBottom: '2rem' }}
          >
             <Heart size={64} style={{ color: '#f43f5e', fill: '#f43f5e' }} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', marginBottom: '1.5rem' }}
          >
            Our <span className="gradient-text">Impact</span> Directory
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '1.25rem', opacity: 0.6, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}
          >
            We partner with transparent, high-impact non-profits worldwide. Explore our directory of causes where 10% of every Digital Heroes subscription is making a real-world difference.
          </motion.p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginBottom: '4rem',
          maxWidth: '800px',
          margin: '0 auto 4rem auto'
        }}>
           <div style={{ flex: 1, position: 'relative' }}>
             <Search size={20} style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '1.25rem', 
                transform: 'translateY(-50%)',
                opacity: 0.4
             }} />
             <Input 
                placeholder="Search charities or causes..." 
                style={{ paddingLeft: '3.5rem' }} 
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
           </div>
           <Button variant="glass" style={{ padding: '0 1.5rem' }}>
             <Filter size={20} /> Filter
           </Button>
        </div>

        {/* Charity Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem' 
        }}>
          {filteredCharities.map((charity, i) => (
            <motion.div 
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  padding: '1rem', 
                  opacity: 0.1 
                }}>
                  <Heart size={80} />
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                   <div style={{ 
                     display: 'inline-flex', 
                     padding: '0.4rem 1rem', 
                     background: 'rgba(74, 222, 128, 0.1)', 
                     color: '#4ade80', 
                     borderRadius: '2rem',
                     fontSize: '0.75rem',
                     fontWeight: 700,
                     marginBottom: '1rem'
                   }}>
                     VERIFIED PARTNER
                   </div>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{charity.name}</h3>
                   <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: 1.6 }}>{charity.description}</p>
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '2rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Min Contribution</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>10%</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <Button variant="glass" onClick={() => setDonateModal({ isOpen: true, charity: charity })} style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                           <DollarSign size={16} /> Donate
                         </Button>
                         <Button onClick={() => window.location.href = '/signup'} style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                           Support <ArrowRight size={16} />
                         </Button>
                      </div>
                   </div>
                   
                   <div style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '0.5rem', 
                     fontSize: '0.8rem', 
                     opacity: 0.4,
                     background: 'rgba(255, 255, 255, 0.03)',
                     padding: '0.5rem',
                     borderRadius: '0.5rem'
                   }}>
                     <Info size={14} /> View Impact Report
                   </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Global Impact Note */}
        <div style={{ marginTop: '10rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4rem', opacity: 0.6, fontSize: '0.9rem' }}>
            <ShieldCheck size={18} /> 100% of your voluntary contribution goes directly to the chosen charity.
          </div>
        </div>

        {/* Independent Donation Modal */}
        <AnimatePresence>
          {donateModal.isOpen && donateModal.charity && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(3, 7, 18, 0.8)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '2rem'
               }}
               onClick={() => !isProcessing && setDonateModal({ isOpen: false, charity: null })}
             >
                <motion.div 
                   initial={{ scale: 0.9, y: 20 }}
                   animate={{ scale: 1, y: 0 }}
                   exit={{ scale: 0.9, y: 20 }}
                   onClick={(e) => e.stopPropagation()}
                   className="glass"
                   style={{
                      width: '100%',
                      maxWidth: '500px',
                      padding: '3rem',
                      position: 'relative'
                   }}
                >
                   <div 
                      onClick={() => !isProcessing && setDonateModal({ isOpen: false, charity: null })}
                      style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer', opacity: 0.5 }}
                   >
                     <X size={20} />
                   </div>
                   
                   <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
                         <Heart size={32} />
                      </div>
                      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Make a Donation</h2>
                      <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>You are donating directly to <strong style={{ color: 'white' }}>{donateModal.charity.name}</strong>. 100% of these funds go to the cause.</p>
                   </div>
                   
                   <div style={{ marginBottom: '2rem' }}>
                      <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>Donation Amount (USD)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        {['10', '50', '100'].map(amt => (
                           <div 
                             key={amt}
                             onClick={() => setDonateAmount(amt)}
                             style={{ 
                                padding: '1rem', 
                                textAlign: 'center', 
                                cursor: 'pointer',
                                borderRadius: 'var(--radius)',
                                border: `1px solid ${donateAmount === amt ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                                background: donateAmount === amt ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                fontWeight: 800
                             }}
                           >${amt}</div>
                        ))}
                      </div>
                      <div style={{ position: 'relative' }}>
                         <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                         <Input 
                            value={donateAmount} 
                            onChange={e => setDonateAmount(e.target.value)} 
                            placeholder="Custom amount"
                            style={{ paddingLeft: '2.5rem' }}
                         />
                      </div>
                   </div>
                   
                   <Button 
                      variant="primary" 
                      style={{ width: '100%', height: '3.5rem' }}
                      onClick={handleDonation}
                      disabled={isProcessing}
                   >
                      {isProcessing ? 'Connecting to Secure Checkout...' : 'Proceed to Payment'} <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                   </Button>
                </motion.div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
