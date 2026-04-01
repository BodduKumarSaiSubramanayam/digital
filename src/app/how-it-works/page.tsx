'use client';

import { motion } from 'framer-motion';
import { Target, Zap, Trophy, Shield, Users, Heart, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Zap size={40} style={{ color: 'var(--primary)' }} />,
      title: "1. Join the Movement",
      description: "Select your subscription plan (Monthly or Yearly) and choose which global cause your contribution will support. Our transparent model ensures 10% of every fee goes directly to your chosen charity from Day 1.",
      features: ["Premium Golf Tracking", "Choose from 50+ Charities", "Monthly Drawn Entry"]
    },
    {
      icon: <Target size={40} style={{ color: 'var(--secondary)' }} />,
      title: "2. Play and Track",
      description: "Log your golf rounds in Stableford format (1-45). Our Rolling 5-Score engine automatically calculates your current performance index, keeping your profile fresh and relevant to monthly draws.",
      features: ["Automated Logic", "Historical Progress", "Stableford Optimization"]
    },
    {
      icon: <Trophy size={40} style={{ color: '#4ade80' }} />,
      title: "3. Win and Impact",
      description: "Automated monthly draws calculate winners based on performance and participation. Every draw supports clean water, education, and health initiatives globally—making you a hero both on and off the course.",
      features: ["Jackpot Rollovers", "Match 3, 4, or 5 Numbers", "Social Good Guaranteed"]
    }
  ];

  return (
    <div style={{ padding: '10rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', marginBottom: '1.5rem' }}
          >
            How it <span className="gradient-text">Works</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '1.25rem', opacity: 0.6, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}
          >
            Digital Heroes is designed to bridge the gap between sports performance and social responsibility. Here is exactly how we deliver impact through every swing.
          </motion.p>
        </div>

        {/* Detailed Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '5rem',
                alignItems: 'center'
              }}
            >
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{ marginBottom: '2rem' }}>{step.icon}</div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{step.title}</h2>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.7, opacity: 0.7, marginBottom: '2.5rem' }}>
                  {step.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {step.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
                      <Shield size={18} style={{ color: 'var(--primary)' }} /> {f}
                    </div>
                  ))}
                </div>
              </div>
              
              <Card style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                 <div style={{ textAlign: 'center', opacity: 0.2 }}>
                   <Users size={80} style={{ marginBottom: '1rem' }} />
                   <p>Visualization {i + 1}</p>
                 </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <section style={{ marginTop: '10rem', textAlign: 'center' }}>
          <div className="glass gradient-border" style={{ padding: '5rem 2rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to Start?</h2>
            <p style={{ opacity: 0.6, fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
              Join thousands of golfers worldwide who are making a difference with every round.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <Button onClick={() => window.location.href = '/signup'} style={{ padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
                Create Account <ArrowRight size={20} />
              </Button>
              <Button variant="glass" onClick={() => window.location.href = '/charities'} style={{ padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
                Explore Charities
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
