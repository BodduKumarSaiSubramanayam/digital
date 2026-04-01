'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '@/components/ui';
import { addScoreAction, getUserScores, type Score } from '@/app/actions/score-actions';
import { updatePasswordAction, getUserDashboardData, uploadWinnerProofAction } from '@/app/actions/auth-actions';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  Heart, 
  History, 
  PlusCircle, 
  Settings as SettingsIcon,
  ShieldCheck,
  CreditCard,
  Gift,
  X,
  Info,
  Check,
  User,
  Bell,
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
  CheckCircle,
  Plus,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export default function Dashboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [newScore, setNewScore] = useState('');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'account' | 'notifications' | 'privacy' | 'change-password'>('main');
  const [profileData, setProfileData] = useState({ name: 'Sai Kumar', email: 'sai@example.com' });
  const [notificationPrefs, setNotificationPrefs] = useState({
    weekly: true,
    monthly: true,
    announcements: false
  });
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [isWinner, setIsWinner] = useState(true); // Mocking a win for demonstration
  const [proofUploaded, setProofUploaded] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const scoreInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [subscription, setSubscription] = useState({
    status: 'Active',
    renewalDate: 'April 25, 2026',
    plan: 'Premium Yearly'
  });

  const [charity, setCharity] = useState({
    name: 'Loading...',
    contribution: '10%',
    totalDonated: '$0.00'
  });

  const [winnings, setWinnings] = useState({
    total: '$0.00',
    currentDrawStatus: 'Participating',
    lastWin: 'None'
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [pendingWinnerId, setPendingWinnerId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>();

  useEffect(() => {
    // Use onAuthStateChange to guarantee we wait for session restoration from localStorage.
    // getSession() has a known race condition on first render and can return null even when logged in.
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isPlaceholderMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (!session && !isPlaceholderMode) {
        // Only redirect if we're SURE there is no session (event is SIGNED_OUT or INITIAL_SESSION with no user)
        if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          window.location.href = '/login';
        }
        return;
      }

      const token = session?.access_token;
      setAuthToken(token);

      const res = await getUserDashboardData(token);
      if (res.success && res.data) {
        const profile = res.data.profile;
        const winnings = res.data.winnings;

        setUserId(profile.id);
        setProfileData({ name: profile.full_name || 'Golfer', email: profile.email });
        setSubscription(prev => ({ ...prev, plan: profile.plan_id }));
        
        const planMonthlyCost = profile.plan_id?.includes('Yearly') ? 10 : 15;
        const simulatedMonthsActive = 4;
        const calculatedDonation = (planMonthlyCost * (profile.charity_percent || 10) / 100) * simulatedMonthsActive;

        setCharity({
          name: profile.charities?.name || 'Unknown',
          contribution: `${profile.charity_percent || 10}%`,
          totalDonated: `$${calculatedDonation.toFixed(2)}`
        });

        const userWinnings = Array.isArray(winnings) ? winnings : [];
        const totalWon = userWinnings.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);
        setWinnings({
          total: totalWon > 0 ? `$${totalWon.toLocaleString()}` : '$0.00',
          currentDrawStatus: 'Participating',
          lastWin: userWinnings.length > 0 ? userWinnings[userWinnings.length - 1].draw_month : 'None'
        });

        const isW = userWinnings.length > 0;
        setIsWinner(isW);
        if (isW) {
          const pending = userWinnings.find((w: any) => w.status === 'Pending');
          if (pending) {
            setProofUploaded(!!pending.proof_url);
            if (!pending.proof_url) setPendingWinnerId(pending.id);
          } else {
            setProofUploaded(false);
          }
        } else {
          setProofUploaded(false);
        }

        const scrs = await getUserScores(profile.id, token);
        setScores(scrs);
      } else if (isPlaceholderMode) {
        // In placeholder/demo mode: load mock data so dashboard works for demos
        setUserId('demo-user-id');
        setProfileData({ name: 'Hero Player', email: 'hero@example.com' });
        setSubscription(prev => ({ ...prev, plan: 'Premium Yearly' }));
        setCharity({ name: 'Global Golf Outreach', contribution: '15%', totalDonated: '$6.00' });
        setWinnings({ total: '$1,750', currentDrawStatus: 'Participating', lastWin: 'March 2026' });
      }
    });

    return () => { authSub.unsubscribe(); };
  }, []);

  const handleUpdateProfile = () => {
    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      setSettingsTab('main');
    }, 1200);
  };

  const handleAddScore = async () => {
    const scoreVal = parseInt(newScore);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      alert("Score must be between 1 and 45 (Stableford)");
      return;
    }

    if (!userId) {
       const newScoreObj = {
         id: Math.random().toString(36).substring(7),
         score: scoreVal,
         date: new Date().toLocaleDateString()
       };
       setScores([newScoreObj, ...scores].slice(0, 5));
       
       setCharity(prev => {
         const currentAmt = parseFloat(prev.totalDonated.replace(/[^0-9.-]+/g,"")) || 6.00;
         return { ...prev, totalDonated: `$${(currentAmt + 1.50).toFixed(2)}` };
       });
       
       setWinnings(prev => {
         const currentAmt = parseFloat(prev.total.replace(/[^0-9.-]+/g,"")) || 1750;
         return { ...prev, total: `$${(currentAmt + 25).toLocaleString()}` };
       });

       setNewScore('');
       return;
    }
    try {
      const updatedScoresRes = await addScoreAction(userId, scores, scoreVal, authToken);
      if (updatedScoresRes.success && updatedScoresRes.scores) {
         setScores(updatedScoresRes.scores);
         
         // Real-world dynamic demo effect: increase impact and rewards numbers slightly when a new round is played
         setCharity(prev => {
           const currentAmt = parseFloat(prev.totalDonated.replace(/[^0-9.-]+/g,"")) || 6.00;
           return { ...prev, totalDonated: `$${(currentAmt + 1.50).toFixed(2)}` };
         });
         
         setWinnings(prev => {
           const currentAmt = parseFloat(prev.total.replace(/[^0-9.-]+/g,"")) || 1750;
           return { ...prev, total: `$${(currentAmt + 25).toLocaleString()}` };
         });

      } else {
         alert(updatedScoresRes.error || "Failed to add score");
      }
    } catch (err: any) {
      alert("Network or Server Error: " + (err.message || "Failed to execute server action."));
      console.error("Dashboard Add Score Error:\n", err);
    }
    setNewScore('');
  };

  return (
    <div style={{ padding: '8rem 2rem 5rem 2rem', background: 'var(--background-hex)', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, Hero</h1>
            <p style={{ opacity: 0.6 }}>Track your performance and impact in real-time.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="glass" onClick={() => setIsSettingsModalOpen(true)} style={{ height: '3.5rem' }}>
              <SettingsIcon size={18} /> Settings
            </Button>
            <Button onClick={() => scoreInputRef.current?.focus()} style={{ height: '3.5rem' }}>
              <PlusCircle size={18} /> New Round
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                <CreditCard style={{ color: 'var(--primary)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>Active</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{subscription.plan}</div>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>Renews {subscription.renewalDate}</p>
          </Card>

          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                <Heart style={{ color: '#f43f5e' }} />
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600 }}>Social Impact</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{charity.totalDonated}</div>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>{charity.name}</p>
          </Card>

          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                <Trophy style={{ color: 'var(--secondary)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600 }}>Rewards</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{winnings.total}</div>
            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>Last Win: {winnings.lastWin}</p>
          </Card>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div className="glass gradient-border" style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                   <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Performance Tracking</h2>
                   <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Enter your Stableford scores (1-45). Your last 5 rounds are kept.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <Input 
                    ref={scoreInputRef}
                    type="number" 
                    placeholder="Score" 
                    style={{ 
                        width: '120px', 
                        height: '3.5rem', 
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }} 
                    value={newScore}
                    onChange={e => setNewScore(e.target.value)}
                  />
                   <Button onClick={handleAddScore} style={{ height: '3.5rem' }}>Add Round</Button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {scores.length === 0 ? (
                  <div style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.3 }}>
                    <History size={48} style={{ marginBottom: '1rem' }} />
                    <p>No rounds recorded yet.</p>
                  </div>
                ) : (
                  scores.map((s, i) => (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass"
                      style={{ 
                        padding: '1.25rem 2rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: i === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        borderColor: i === 0 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                         <div style={{ fontSize: '1.5rem', fontWeight: 800, color: i === 0 ? 'var(--primary)' : 'inherit' }}>{s.score} <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>pts</span></div>
                         <div style={{ height: '24px', width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                         <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>{s.date}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
                        <ShieldCheck size={14} /> Valid for Draw
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <Card>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Gift size={20} style={{ color: 'var(--secondary)' }} /> Next Monthly Draw
              </h3>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Jackpot</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>$12,500</div>
              </div>
              <Button 
               onClick={() => setIsRulesModalOpen(true)} 
               style={{ width: '100%' }} 
               variant="glass"
              >
                View Rules & Mechanics
              </Button>
            </Card>

            {isWinner && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(244, 63, 94, 0.1))', borderColor: 'var(--secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--secondary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 900 }}>WINNER DETECTED</div>
                    <Flame size={20} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Congratulations!</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '2rem' }}>You matched 4 numbers in the March Draw. To claim your **$1,250** prize, please upload a screenshot of your official scores.</p>
                  
                  {proofUploaded ? (
                    <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', borderColor: '#4ade80' }}>
                       <CheckCircle size={24} style={{ color: '#4ade80', marginBottom: '0.5rem' }} />
                       <div style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: 700 }}>Proof Submitted</div>
                       <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Awaiting Admin Verification</div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => !isUploadingProof && fileInputRef.current?.click()}
                      className="glass" 
                      style={{ 
                        padding: '2rem', 
                        textAlign: 'center', 
                        cursor: isUploadingProof ? 'default' : 'pointer', 
                        borderStyle: 'dashed',
                        background: 'rgba(255,255,255,0.03)',
                        opacity: isUploadingProof ? 0.6 : 1
                      }}
                    >
                       <input 
                        type="file" 
                        ref={fileInputRef} 
                        hidden 
                        accept="image/*"
                        onChange={async () => {
                          if (!pendingWinnerId) { alert('No pending win found'); return; }
                          setIsUploadingProof(true);
                          try {
                              const res = await uploadWinnerProofAction(pendingWinnerId);
                              if (res.success) {
                                setProofUploaded(true);
                                alert("Screenshot uploaded successfully! Admin will review your submission shortly.");
                              } else {
                                alert("Failed to upload: " + res.error);
                              }
                          } catch (e: any) {}
                          setIsUploadingProof(false);
                        }}
                       />
                       {isUploadingProof ? (
                         <>
                            <RotateCcw size={24} className="animate-spin" style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Uploading Verification...</div>
                         </>
                       ) : (
                         <>
                            <Plus size={24} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Upload Score Screenshot</div>
                         </>
                       )}
                       <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.5rem' }}>PNG, JPG or PDF up to 5MB</div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Rules & Mechanics Modal */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRulesModalOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(3, 7, 18, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
              }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    padding: '4rem',
                    position: 'relative',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                    onClick={() => setIsRulesModalOpen(false)}
                    style={{ position: 'absolute', top: '2rem', right: '2rem', cursor: 'pointer', opacity: 0.5 }}
                >
                  <X size={24} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                   <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                      <Info size={32} />
                   </div>
                   <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Rules & Mechanics</h2>
                   <p style={{ opacity: 0.5 }}>Understanding our fair-play reward system.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                   {[
                       { tier: 'Match 5', share: '40%', details: 'Jackpot Rollover Enabled' },
                       { tier: 'Match 4', share: '35%', details: 'Split among winners' },
                       { tier: 'Match 3', share: '25%', details: 'Split among winners' }
                   ].map((item, i) => (
                      <div key={i} className="glass" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                         <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.4 }}>{item.tier}</div>
                         <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>{item.share}</div>
                         <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.details}</div>
                      </div>
                   ))}
                </div>

                <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius)' }}>
                   <h4 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={18} style={{ color: '#4ade80' }} /> Terms of Participation
                   </h4>
                   <ul style={{ fontSize: '0.9rem', opacity: 0.6, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <li>Users must have an active subscription at the time of the draw.</li>
                      <li>At least one valid Stableford score must be recorded in the current month.</li>
                      <li>Winners must provide verification through their respective golf platform apps.</li>
                      <li>Prize calculations are based on the total active subscriber pool.</li>
                   </ul>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsSettingsModalOpen(false);
              setSettingsTab('main');
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(3, 7, 18, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
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
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    setSettingsTab('main');
                  }}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer', opacity: 0.5 }}
              >
                <X size={20} />
              </div>

              {settingsTab === 'main' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Profile Settings</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { id: 'account', icon: <User size={18} />, label: 'Account Details', sub: 'Update your email and password' },
                      { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications', sub: 'Draw alerts and performance updates' },
                      { id: 'privacy', label: 'Privacy & Security', icon: <Lock size={18} /> },
                      { id: 'admin', label: 'Admin Control Panel', icon: <ShieldAlert size={18} /> }
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          if (item.id === 'admin') {
                            window.location.href = '/admin';
                          } else {
                            setSettingsTab(item.id as any);
                          }
                        }}
                        className="glass" 
                        style={{ 
                          padding: '1.25rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          background: 'rgba(255, 255, 255, 0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ opacity: 0.6 }}>{item.icon}</div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>{item.sub}</div>
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ opacity: 0.3 }} />
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="primary" 
                    style={{ width: '100%', marginTop: '2rem' }}
                    onClick={() => setIsSettingsModalOpen(false)}
                  >
                    Close Settings
                  </Button>
                </motion.div>
              )}

              {settingsTab === 'account' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <div 
                    onClick={() => setSettingsTab('main')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                  >
                    <ChevronRight size={16} style={{ rotate: '180deg' }} /> Back to Settings
                  </div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Account Details</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                      <Input 
                        value={profileData.name} 
                        onChange={e => setProfileData({...profileData, name: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                      <Input 
                        value={profileData.email} 
                        onChange={e => setProfileData({...profileData, email: e.target.value})} 
                      />
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {settingsTab === 'notifications' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <div 
                    onClick={() => setSettingsTab('main')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                  >
                    <ChevronRight size={16} style={{ rotate: '180deg' }} /> Back to Settings
                  </div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Notifications</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                     {[
                       { id: 'weekly', label: 'Weekly Performance Report' },
                       { id: 'monthly', label: 'Monthly Draw Alerts' },
                       { id: 'announcements', label: 'Platform Announcements' }
                     ].map((pref, i) => {
                       const isActive = (notificationPrefs as any)[pref.id];
                       return (
                         <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)' }}>
                           <span style={{ fontSize: '0.9rem' }}>{pref.label}</span>
                           <div 
                            onClick={() => setNotificationPrefs({...notificationPrefs, [pref.id]: !isActive})}
                            style={{ 
                              width: '40px', 
                              height: '20px', 
                              borderRadius: '20px', 
                              background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                              cursor: 'pointer', 
                              position: 'relative',
                              transition: '0.3s ease'
                            }}
                           >
                              <div style={{ 
                                width: '16px', 
                                height: '16px', 
                                borderRadius: '50%', 
                                background: 'white', 
                                position: 'absolute', 
                                top: '2px', 
                                left: isActive ? '22px' : '2px', 
                                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                              }} />
                           </div>
                         </div>
                       );
                     })}
                  </div>
                </motion.div>
              )}

              {settingsTab === 'privacy' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <div 
                    onClick={() => setSettingsTab('main')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                  >
                    <ChevronRight size={16} style={{ rotate: '180deg' }} /> Back to Settings
                  </div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Privacy & Security</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ padding: '1.25rem', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.1)', borderRadius: 'var(--radius)' }}>
                      <h4 style={{ color: '#f43f5e', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security Action</h4>
                      <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1.25rem' }}>Change your password to keep your account secure.</p>
                      <Button 
                        variant="ghost" 
                        onClick={() => setSettingsTab('change-password')}
                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}
                      >
                        Change Password
                      </Button>
                    </div>
                    <div 
                      onClick={() => setIsPublicProfile(!isPublicProfile)}
                      className="glass" 
                      style={{ 
                        padding: '1.25rem', 
                        background: 'rgba(255,255,255,0.02)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Public Profile</div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.4 }}>Let other heroes see your impact progress.</p>
                      </div>
                      <div style={{ 
                        width: '40px', 
                        height: '20px', 
                        borderRadius: '20px', 
                        background: isPublicProfile ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                        position: 'relative',
                        transition: '0.3s ease'
                      }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          background: 'white', 
                          position: 'absolute', 
                          top: '2px', 
                          left: isPublicProfile ? '22px' : '2px', 
                          transition: '0.3s ease' 
                        }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {settingsTab === 'change-password' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <div 
                    onClick={() => setSettingsTab('privacy')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                  >
                    <ChevronRight size={16} style={{ rotate: '180deg' }} /> Back
                  </div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Change Password</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <Input 
                            type={showCurrentPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            style={{ paddingRight: '3.5rem' }}
                        />
                        <div 
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            style={{ position: 'absolute', top: '50%', right: '1.25rem', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.4 }}
                        >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <Input 
                            type={showNewPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            style={{ paddingRight: '3.5rem' }}
                            value={newPasswordValue}
                            onChange={e => setNewPasswordValue(e.target.value)}
                        />
                        <div 
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ position: 'absolute', top: '50%', right: '1.25rem', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.4 }}
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={async () => {
                        if (!newPasswordValue) {
                           alert("Please enter a new password.");
                           return;
                        }
                        setIsUpdating(true);
                        const result = await updatePasswordAction(newPasswordValue);
                        setIsUpdating(false);
                        
                        if (result.success) {
                           setSettingsTab('privacy');
                           setShowCurrentPassword(false);
                           setShowNewPassword(false);
                           setNewPasswordValue('');
                           alert("Password updated successfully!");
                        } else {
                           alert(result.error || "Failed to update password.");
                        }
                      }}
                      disabled={isUpdating}
                      style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                      {isUpdating ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
