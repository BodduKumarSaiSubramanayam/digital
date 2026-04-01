'use client';

import { motion } from 'framer-motion';
import { Trophy, Heart, Target, ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '8rem' }}>
        <div style={{ maxWidth: '800px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '2rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <Star size={14} style={{ color: 'var(--secondary)' }} />
              <span style={{ opacity: 0.8 }}>PREMIUM GOLF EXPERIENCE</span>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
              lineHeight: 1, 
              marginBottom: '1.5rem',
              fontWeight: 800
            }}>
              Track Your Game. <br />
              <span className="gradient-text">Win Big. </span> 
              Give Back.
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              lineHeight: 1.6, 
              opacity: 0.6, 
              marginBottom: '3rem',
              maxWidth: '600px'
            }}>
              The subscription-driven golf platform combining performance tracking, monthly draws, and charitable giving. Support the causes you love while improving your score.
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <a href="/login" className="shimmer" style={{ 
                padding: '1.25rem 2.5rem', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                borderRadius: 'var(--radius)',
                background: 'var(--primary)',
                boxShadow: '0 8px 30px var(--primary-glow)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                Join the Platform <ArrowRight size={20} />
              </a>
              <a href="/how-it-works" style={{ 
                padding: '1.25rem 2rem', 
                fontSize: '1.1rem', 
                fontWeight: 600,
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                See How it Works <Zap size={18} />
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Animated Background Element */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: -1,
          opacity: 0.3
        }} />
      </section>

      {/* Feature Grid */}
      <section id="how-it-works" className="section">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>How it Works</h2>
          <p style={{ opacity: 0.6, maxWidth: '600px', margin: '0 auto' }}>Three simple steps to transform your golf game and make a real-world impact.</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {[
            { 
              icon: <Zap size={28} style={{ color: 'var(--primary)' }} />, 
              title: "Subscribe & Support", 
              desc: "Choose a monthly or yearly plan. A portion of your fee goes directly to a charity of your choice." 
            },
            { 
              icon: <Target size={28} style={{ color: 'var(--secondary)' }} />, 
              title: "Track Your Score", 
              desc: "Enter your latest Stableford scores. Our rolling 5-score logic keeps your performance updated." 
            },
            { 
              icon: <Trophy size={28} style={{ color: '#4ade80' }} />, 
              title: "Monthly Prize Draw", 
              desc: "Every score entry gives you a chance to win. Match 3, 4, or 5 numbers for massive jackpots." 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass" 
              style={{ padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ marginBottom: '1.5rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{item.title}</h3>
              <p style={{ opacity: 0.6, lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Impact Section */}
      <section id="charities" className="section" style={{ position: 'relative' }}>
          <div className="glass gradient-border" style={{ 
            padding: '5rem', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Heart size={48} style={{ color: '#f43f5e', marginBottom: '2rem' }} />
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', maxWidth: '800px' }}>
              Turning Every Birdie Into a 
              <span style={{ color: '#4ade80' }}> Social Good</span>
            </h2>
            <p style={{ opacity: 0.7, fontSize: '1.2rem', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
              We partner with over 50 global charities. When you subscribe, you're not just tracking your game — you're funding clean water projects, education initiatives, and medical research.
            </p>
            <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>$1.2M+</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Raised to Date</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>50+</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Charity Partners</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>15k+</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Subscribers</div>
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}
