'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '@/components/ui';
import { calculatePrizePool, simulateDraw, publishOfficialDraw } from '@/lib/services/draw-engine';
import { approveWinnerAction, rejectWinnerAction } from '@/app/actions/admin-actions';
import { 
  Users, 
  Trophy, 
  Heart, 
  BarChart3, 
  Play, 
  CheckCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Filter, 
  Download,
  AlertTriangle,
  Flame,
  Zap,
  RotateCcw,
  Search,
  Plus,
  MoreVertical,
  Check,
  X,
  CreditCard,
  History,
  ShieldAlert,
  User,
  ExternalLink,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [activeTab, setActiveTab] = useState('draws');
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real Data States
  const [users, setUsers] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [pendingWinners, setPendingWinners] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Profiles
      const { data: profileData } = await supabase.from('profiles').select('*');
      if (profileData) setUsers(profileData);

      // 2. Fetch Charities
      const { data: charityData } = await supabase.from('charities').select('*');
      if (charityData) setCharities(charityData);

      // 3. Fetch Pending Winners
      const { data: winnerData } = await supabase
        .from('winners')
        .select('*, profiles(full_name, email)')
        .eq('status', 'Pending');
      if (winnerData) setPendingWinners(winnerData);

      // 4. Fetch Activity Logs
      const { data: logData } = await supabase
        .from('activity_logs')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (logData) setActivityLogs(logData);
      
      setIsLoading(false);
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
      fetchData();
    } else {
       // Mock Data if placeholder
       setUsers([
          { id: '1', full_name: 'Sai Kumar', email: 'sai@example.com', plan_id: 'Yearly', status: 'Active', latest_scores: [38, 42, 35, 40, 39] }
       ]);
       setIsLoading(false);
    }
  }, []);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      // In a real scenario, fetch total sub count from users state
      const totalSubs = users.length > 0 ? users.length : 15420; 
      const prizePool = calculatePrizePool(totalSubs);
      const draw = await simulateDraw('random');
      
      setSimulationResults({
        totalSubscribers: totalSubs,
        prizePool: prizePool.total,
        winners: { match5: draw.winners.match5, match4: draw.winners.match4, match3: draw.winners.match3 },
        distributions: prizePool,
        winningNumbers: draw.winningNumbers,
        rawResult: draw // Stored for actual publishing
      });
    } catch (e) {
      console.error("Simulation failed", e);
    }
    setIsSimulating(false);
  };

  if (!isAuth) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-hex)' }}>
        <Card style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%', color: '#f43f5e', marginBottom: '1.5rem' }}>
             <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Access Restricted</h2>
          <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '2rem' }}>Please enter the control room passcode.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <Input 
               type="email" 
               placeholder="Admin Email" 
               value={adminEmail}
               onChange={e => setAdminEmail(e.target.value)}
             />
             <Input 
               type="password" 
               placeholder="Passcode" 
               value={adminPass}
               onChange={e => setAdminPass(e.target.value)}
               onKeyDown={e => {
                  if (e.key === 'Enter') {
                     if (adminEmail.trim() === 'admin@digitalheroes.com' && adminPass.trim() === 'Digitalhero') setIsAuth(true);
                     else alert('Invalid credentials');
                  }
               }}
             />
             <Button 
                onClick={() => {
                   if (adminEmail.trim() === 'admin@digitalheroes.com' && adminPass.trim() === 'Digitalhero') setIsAuth(true);
                   else alert('Invalid credentials');
                }}
                style={{ width: '100%' }}
             >
                Unlock Control Room
             </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '8rem 2rem 5rem 2rem', background: 'var(--background-hex)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        {/* Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
               <div style={{ background: 'var(--secondary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>SYSTEM ADMIN</div>
               <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Service Status: <span style={{ color: '#4ade80' }}>Operational</span></div>
            </div>
            <h1 style={{ fontSize: '2.5rem' }}>Platform Control Room</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="glass"><BarChart3 size={18} /> Reports</Button>
            <Button variant="glass"><Download size={18} /> Export Data</Button>
          </div>
        </div>

        {/* Admin Core Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem' }}>
          {/* Navigation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {[
               { id: 'draws', label: 'Draw Management', icon: <Trophy size={18} /> },
               { id: 'users', label: 'User Directory', icon: <Users size={18} /> },
               { id: 'charity', label: 'Charity Profiles', icon: <Heart size={18} /> },
               { id: 'winners', label: 'Winner Approval', icon: <CheckCircle size={18} />, badge: '1' },
               { id: 'audit', label: 'Audit Log Feed', icon: <Activity size={18} /> },
               { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 size={18} /> }
             ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    borderRadius: 'var(--radius)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                    opacity: activeTab === item.id ? 1 : 0.6,
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {item.icon} {item.label}
                  </div>
                  {item.badge && activeTab !== item.id && (
                    <span style={{ fontSize: '0.7rem', background: '#f43f5e', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>{item.badge}</span>
                  )}
                </div>
             ))}
          </div>

          {/* Tab Content Areas */}
          <div style={{ minWidth: 0 }}>
             <AnimatePresence mode="wait">
               {/* 01: DRAW ENGINE */}
               {activeTab === 'draws' && (
                 <motion.div key="draws" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h2 style={{ fontSize: '2rem' }}>Monthly Prize Engine</h2>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button variant="glass"><History size={18} /> Logs</Button>
                        <Button onClick={runSimulation} disabled={isSimulating}>
                          {isSimulating ? <RotateCcw size={18} className="animate-spin" /> : <Play size={18} />} 
                          {isSimulating ? 'Processing...' : 'Run Simulation'}
                        </Button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                       {[
                         { icon: <CreditCard />, label: 'Current Pool', val: '$15,420', sub: 'Updated 2m ago' },
                         { icon: <Users />, label: 'Active Draw Entries', val: '2,840', sub: 'Real-time verified' },
                         { icon: <Zap />, label: 'Match Predictions', val: '1.4%', sub: 'Based on current scores' }
                       ].map((stat, i) => (
                         <Card key={i} style={{ padding: '2rem' }}>
                           <div style={{ marginBottom: '1rem', opacity: 0.5 }}>{stat.icon} {stat.label}</div>
                           <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stat.val}</div>
                           <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{stat.sub}</div>
                         </Card>
                       ))}
                    </div>

                    {simulationResults && (
                      <div className="glass gradient-border" style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem' }}>April 2026 Simulation Results</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                               {simulationResults.winningNumbers.map((n: number, i: number) => (
                                 <div key={i} style={{ background: 'var(--primary)', color: 'white', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{n}</div>
                               ))}
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                           {[
                             { label: 'Match 5 (40%)', val: `$${simulationResults.distributions.match5.toLocaleString()}`, winners: simulationResults.winners.match5 },
                             { label: 'Match 4 (35%)', val: `$${simulationResults.distributions.match4.toLocaleString()}`, winners: simulationResults.winners.match4 },
                             { label: 'Match 3 (25%)', val: `$${simulationResults.distributions.match3.toLocaleString()}`, winners: simulationResults.winners.match3 }
                           ].map((item, i) => (
                             <div key={i}>
                               <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.5rem' }}>{item.label}</div>
                               <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{item.val}</div>
                               <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 700 }}>{item.winners} Potential Winners</div>
                             </div>
                           ))}
                        </div>
                        
                        <Button 
                          style={{ width: '100%', marginTop: '3rem' }} 
                          variant="primary"
                          onClick={async () => {
                            if (!simulationResults || !simulationResults.rawResult) return;
                            try {
                              const res = await publishOfficialDraw(simulationResults.rawResult, simulationResults.totalSubscribers);
                              if (res.success) {
                                alert(`Official Draw Published Successfully! Processed ${res.totalWinners} winners.`);
                                setSimulationResults(null);
                              }
                            } catch (e: any) {
                              alert("Failed to publish: " + e.message);
                            }
                          }}
                        >
                          <Play size={18} /> Publish Official Results
                        </Button>
                      </div>
                    )}
                 </motion.div>
               )}

               {/* 02: USER MANAGEMENT */}
               {activeTab === 'users' && (
                 <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h2 style={{ fontSize: '2rem' }}>User Directory</h2>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                         <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <Input placeholder="Search subscribers..." style={{ paddingLeft: '2.8rem', width: '300px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                         </div>
                         <Button variant="glass"><Filter size={18} /> Filter</Button>
                      </div>
                    </div>

                    <Card style={{ padding: '0' }}>
                       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <tr>
                               {['Subscriber', 'Plan', 'Status', 'Latest Scores', 'Actions'].map(h => (
                                 <th key={h} style={{ textAlign: 'left', padding: '1.25rem 2rem', fontSize: '0.8rem', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase' }}>{h}</th>
                               ))}
                             </tr>
                          </thead>
                          <tbody>
                             {users.filter(u => 
                                (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                             ).map((u, i) => (
                               <tr key={i} style={{ borderBottom: i !== users.length -1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                 <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ fontWeight: 600 }}>{u.full_name || 'No Name'}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{u.email}</div>
                                 </td>
                                 <td style={{ padding: '1.5rem 2rem' }}>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '10px' }}>{u.plan_id || 'Monthly'}</span>
                                 </td>
                                 <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                       <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.status === 'Active' ? '#4ade80' : '#f43f5e' }} />
                                       {u.status}
                                    </div>
                                 </td>
                                 <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                       {(u.latest_scores || []).slice(0, 3).map((s: number, si: number) => (
                                          <div key={si} style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5 }}>{s}</div>
                                       ))}
                                       <span style={{ opacity: 0.2 }}>...</span>
                                    </div>
                                 </td>
                                 <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                       <Edit3 size={16} style={{ cursor: 'pointer', opacity: 0.4 }} />
                                       <Trash2 size={16} style={{ cursor: 'pointer', color: '#f43f5e', opacity: 0.6 }} />
                                    </div>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </Card>
                 </motion.div>
               )}

               {/* 03: CHARITY MGMT */}
               {activeTab === 'charity' && (
                 <motion.div key="charity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                       <h2 style={{ fontSize: '2rem' }}>Causes & Impacts</h2>
                       <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ position: 'relative' }}>
                             <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                             <Input placeholder="Filter causes..." style={{ paddingLeft: '2.8rem', width: '250px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                          </div>
                          <Button variant="primary"><Plus size={18} /> Register New Cause</Button>
                       </div>
                     </div>
                     
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {charities.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((c, i) => (
                         <Card key={i} style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                               <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '1rem' }}>
                                  <Heart size={20} style={{ color: '#f43f5e' }} />
                               </div>
                               <span style={{ fontSize: '0.8rem', background: c.active ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)', color: c.active ? '#4ade80' : 'inherit', padding: '0.25rem 0.75rem', borderRadius: '10px', height: 'fit-content' }}>
                                 {c.active ? 'Active Partner' : 'Not Active'}
                               </span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{c.name}</h3>
                            <div style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '2rem' }}>Total Raised: <span style={{ fontWeight: 800, color: 'white', opacity: 1 }}>{c.raised}</span></div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                               <Button variant="glass" style={{ flex: 1 }}>Manage</Button>
                               <Button variant="glass"><Edit3 size={16} /></Button>
                            </div>
                         </Card>
                       ))}
                    </div>
                 </motion.div>
               )}

               {/* 04: WINNER VERIFICATION */}
               {activeTab === 'winners' && (
                 <motion.div key="winners" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>Winner Verification Queue</h2>
                    {pendingWinners.length === 0 ? (
                      <div className="glass" style={{ padding: '5rem', textAlign: 'center', opacity: 0.3 }}>
                         <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                         <p>Verification queue is empty.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                         {pendingWinners.map((w, i) => (
                           <Card key={i} style={{ padding: '2.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                 <div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.4, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{w.match}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{w.prize}</div>
                                 </div>
                                 <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--secondary)', height: 'fit-content', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', fontWeight: 700 }}>PENDING REVIEW</div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>
                                 <div>
                                    <div style={{ fontWeight: 700 }}>{(w as any).profiles?.full_name || 'Anonymous User'}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{(w as any).profiles?.email}</div>
                                 </div>
                              </div>

                              <div className="glass" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}>
                                 <Eye size={18} style={{ opacity: 0.4 }} />
                                 <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>View Submitted Proof.png</span>
                              </div>

                              <div style={{ display: 'flex', gap: '1rem' }}>
                                 <Button 
                                    variant="primary" 
                                    style={{ flex: 1, background: '#4ade80' }}
                                    onClick={async () => {
                                       const res = await approveWinnerAction(w.id, w.user_id, w.prize);
                                       if (res.success) {
                                          setPendingWinners(prev => prev.filter(x => x.id !== w.id));
                                          alert("Approved and payout marked processing!");
                                       }
                                    }}
                                 ><Check size={18} /> Approve & Pay</Button>
                                 <Button 
                                    variant="glass" 
                                    style={{ flex: 0.5, color: '#f43f5e' }}
                                    onClick={async () => {
                                       const res = await rejectWinnerAction(w.id);
                                       if (res.success) {
                                          setPendingWinners(prev => prev.filter(x => x.id !== w.id));
                                          alert("Winner rejected.");
                                       }
                                    }}
                                 ><X size={18} /> Reject</Button>
                              </div>
                           </Card>
                         ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 05: AUDIT LOG FEED */}
                {activeTab === 'audit' && (
                  <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem' }}>System Engagement Audit</h2>
                        <Button variant="glass"><RotateCcw size={16} /> Refresh Feed</Button>
                     </div>

                     <Card style={{ padding: '0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           {activityLogs.length === 0 ? (
                             <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3 }}>No platform activity recorded yet.</div>
                           ) : activityLogs.map((log, i) => (
                             <div key={i} style={{ 
                                padding: '1.5rem 2.5rem', 
                                borderBottom: i !== activityLogs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                             }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                   <div style={{ 
                                       width: '36px', 
                                       height: '36px', 
                                       borderRadius: '8px', 
                                       background: log.action_type === 'SIGNUP' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.03)',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       color: log.action_type === 'SIGNUP' ? '#4ade80' : 'inherit'
                                   }}>
                                      {log.action_type === 'SIGNUP' ? <Users size={18} /> : <Zap size={18} />}
                                   </div>
                                   <div>
                                      <div style={{ fontWeight: 600 }}>{log.description}</div>
                                      <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                         {log.profiles?.full_name || 'System'} • {log.profiles?.email || 'automated-task@dh.co'}
                                      </div>
                                   </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.3, textAlign: 'right' }}>
                                   {new Date(log.created_at).toLocaleString()}
                                </div>
                             </div>
                           ))}
                        </div>
                     </Card>
                  </motion.div>
                )}

                {/* 06: REPORTS & ANALYTICS */}
                {activeTab === 'reports' && (
                  <motion.div key="reports" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4.5rem' }}>
                       <h2 style={{ fontSize: '2.5rem' }}>Oversight & Intelligence</h2>
                       <div style={{ display: 'flex', gap: '1rem' }}>
                          <Button variant="glass">Export CSV</Button>
                       </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
                        {[
                          { icon: <Users />, label: 'Total Registered', val: users.length.toString(), color: 'var(--primary)' },
                          { icon: <CreditCard />, label: 'Prize Pool Total', val: '$15,420', color: 'var(--secondary)' },
                          { icon: <Heart />, label: 'Charity Contributions', val: '$3,850', color: '#f43f5e' },
                          { icon: <Zap />, label: 'Active Draw Entries', val: '2,840', color: '#4ade80' }
                        ].map((stat, i) => (
                          <Card key={i} style={{ padding: '2.5rem', borderBottom: `4px solid ${stat.color}` }}>
                             <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{stat.icon} {stat.label}</div>
                             <div style={{ fontSize: '2.25rem', fontWeight: 900 }}>{stat.val}</div>
                          </Card>
                        ))}
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        <Card style={{ padding: '3rem' }}>
                           <h4 style={{ marginBottom: '2rem' }}>Charity Distribution Share</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              {charities.slice(0,3).map((c, i) => (
                                <div key={i}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                      <span>{c.name}</span>
                                      <span style={{ fontWeight: 800 }}>{33 + i}%</span>
                                   </div>
                                   <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                      <div style={{ width: `${33+i}%`, height: '100%', background: 'var(--primary)' }} />
                                   </div>
                                </div>
                              ))}
                           </div>
                        </Card>
                        <Card style={{ padding: '3rem' }}>
                           <h4 style={{ marginBottom: '2rem' }}>Draw Matching Statistics</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span>5-Number Matches</span>
                                 <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>0 (Rollover Active)</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span>4-Number Matches</span>
                                 <span style={{ fontWeight: 800 }}>12 Winners</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span>3-Number Matches</span>
                                 <span style={{ fontWeight: 800 }}>84 Winners</span>
                              </div>
                           </div>
                        </Card>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
         </div>
       </div>
     </div>
   );
 }
