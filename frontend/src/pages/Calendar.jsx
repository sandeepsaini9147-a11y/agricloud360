import { useState, useEffect } from 'react';
import API from '../services/api';

export default function CalendarPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/calendar').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading calendar...</div>;

  const events = (data?.events || []).filter(e => filter === 'all' || e.type === filter);
  const todayTasks = data?.todayTasks || [];
  const upcoming7 = data?.upcoming7 || [];

  const typeLabel = { irrigation:'💧 Irrigation', fertilizer:'🌿 Fertilizer', harvest:'🌾 Harvest', disease_check:'🔍 Disease Check', plantation:'🌱 Plantation' };

  return (
    <div>
      <div className="page-header">
        <h1>📅 Smart Farming Calendar</h1>
        <p>Auto-generated farming schedule for all your crops</p>
      </div>

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="card" style={{ marginBottom:20, border:'2px solid #16a34a' }}>
          <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:12 }}>⚡ Today's Tasks ({todayTasks.length})</h3>
          {todayTasks.map(task => (
            <div key={task.id} className={`calendar-event event-${task.type}`} style={{ borderLeftColor:task.color }}>
              <span>{task.title}</span>
              {task.farm && <span className="badge badge-green" style={{ marginLeft:'auto', fontSize:'.7rem' }}>{task.farm}</span>}
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        {/* All Events */}
        <div className="card">
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
            {['all','irrigation','fertilizer','harvest','disease_check','plantation'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-green' : 'btn-outline'}`} onClick={() => setFilter(f)} style={{ textTransform:'capitalize' }}>
                {typeLabel[f] || '📋 All'}
              </button>
            ))}
          </div>

          {events.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'#4b5563' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📅</div>
              <p>No events found. Add crops to generate your farming calendar automatically.</p>
            </div>
          ) : (
            <div style={{ maxHeight:500, overflowY:'auto' }}>
              {events.slice(0, 50).map(event => (
                <div key={event.id} className={`calendar-event event-${event.type}`} style={{ borderLeftColor:event.color }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'.88rem' }}>{event.title}</div>
                    <div style={{ fontSize:'.75rem', color:'#4b5563', marginTop:2 }}>
                      📅 {new Date(event.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      {event.farm && ` — 🏡 ${event.farm}`}
                    </div>
                  </div>
                  {event.done !== undefined && (
                    <span className={`badge ${event.done ? 'badge-green' : 'badge-amber'}`} style={{ fontSize:'.7rem' }}>
                      {event.done ? '✅ Done' : '⏳ Pending'}
                    </span>
                  )}
                  {event.status === 'overdue' && <span className="badge badge-red" style={{ fontSize:'.7rem' }}>⚠️ Overdue</span>}
                  {event.status === 'upcoming' && <span className="badge badge-amber" style={{ fontSize:'.7rem' }}>🔔 Upcoming</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming 7 days */}
        <div>
          <div className="card">
            <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:12 }}>📆 Next 7 Days ({upcoming7.length})</h3>
            {upcoming7.length === 0 ? (
              <p style={{ color:'#4b5563', fontSize:'.88rem' }}>No tasks in next 7 days</p>
            ) : upcoming7.map(task => (
              <div key={task.id} style={{ padding:'8px 0', borderBottom:'1px solid #d1fae5' }}>
                <div style={{ fontWeight:600, fontSize:'.85rem', color:'#14532d' }}>{task.title}</div>
                <div style={{ fontSize:'.75rem', color:'#4b5563' }}>
                  {new Date(task.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop:16 }}>
            <h3 style={{ fontWeight:700, color:'#14532d', marginBottom:12 }}>📊 Event Summary</h3>
            {['irrigation','fertilizer','harvest','disease_check'].map(type => {
              const count = (data?.events || []).filter(e => e.type === type).length;
              return (
                <div key={type} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #d1fae5', fontSize:'.88rem' }}>
                  <span>{typeLabel[type]}</span>
                  <span className="badge badge-green">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
