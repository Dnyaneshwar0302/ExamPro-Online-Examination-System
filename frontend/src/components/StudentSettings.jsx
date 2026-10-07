import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentAccount.css';

function StudentSettingsPage() {
  const navigate = useNavigate();
  const fullName = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Student';
  const username = localStorage.getItem('username') || '';
  const defaults={language:'English',dateFormat:'DD/MM/YYYY',compactInterface:false,examReminders:true,resultNotifications:true,securityAlerts:true,autoSubmit:true,questionNavigation:true,confirmSubmit:true,rememberPreferences:true};
  const [activeTab,setActiveTab]=React.useState('General');
  const [settings,setSettings]=React.useState(()=>{try{return {...defaults,...JSON.parse(localStorage.getItem('examProStudentSettings')||'{}')}}catch{return {...defaults}}});
  const [saved,setSaved]=React.useState(false);
  const update=(key,value)=>{setSettings((previous)=>({...previous,[key]:value}));setSaved(false);};
  const toggle=(key)=>update(key,!settings[key]);
  const saveSettings=()=>{localStorage.setItem('examProStudentSettings',JSON.stringify(settings));setSaved(true);window.setTimeout(()=>setSaved(false),2500);};
  const resetSettings=()=>{setSettings({...defaults});localStorage.setItem('examProStudentSettings',JSON.stringify(defaults));setSaved(true);window.setTimeout(()=>setSaved(false),2500);};
  const clearPreferences=()=>{localStorage.removeItem('examProStudentSettings');setSettings({...defaults});setSaved(true);};
  const SettingToggle=({label,description,value,onChange})=><div className="settings-row"><div className="settings-row-copy"><strong>{label}</strong><span>{description}</span></div><button className={'switch '+(value?'on':'')} onClick={onChange} type="button"><span/></button></div>;
  const SettingSelect=({label,description,value,options,onChange})=><div className="settings-row"><div className="settings-row-copy"><strong>{label}</strong><span>{description}</span></div><select value={value} onChange={(event)=>onChange(event.target.value)}>{options.map((option)=><option key={option}>{option}</option>)}</select></div>;
  const initials = fullName.trim().split(/\s+/).filter(Boolean).slice(0,2).map((part) => part.charAt(0).toUpperCase()).join('') || 'S';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="student-account-page">
      <div className="student-account-shell">
        <aside className="account-sidebar">
          <div className="account-brand"><div className="account-brand-mark">E</div><div><strong>ExamPro</strong><span>Student Portal</span></div></div>
          <div className="account-nav-label">STUDENT AREA</div>
          <nav className="account-nav">
            <button className="" onClick={() => navigate('/student/dashboard')} type="button"><span className="account-nav-icon">▦</span>Dashboard</button>
<button className="" onClick={() => navigate('/student/exams')} type="button"><span className="account-nav-icon">▤</span>My Exams</button>
<button className="" onClick={() => navigate('/analytics')} type="button"><span className="account-nav-icon">▥</span>Results</button>
<button className="" onClick={() => navigate('/leaderboard/1')} type="button"><span className="account-nav-icon">◆</span>Leaderboard</button>
<button className="" onClick={() => navigate('/student/certificates')} type="button"><span className="account-nav-icon">▣</span>Certificates</button>
<button className="" onClick={() => navigate('/student/profile')} type="button"><span className="account-nav-icon">◉</span>My Profile</button>
<button className="active" onClick={() => navigate('/student/settings')} type="button"><span className="account-nav-icon">⚙</span>Settings</button>
          </nav>
          <div className="account-sidebar-bottom">
            <div className="account-help"><strong>Need Help?</strong><span>Contact your examination administrator for assistance.</span></div>
            <button className="account-logout" onClick={handleLogout} type="button">↪ &nbsp; Logout</button>
          </div>
        </aside>
        <main className="account-main">
          <header className="account-header">
            <div><p className="account-header-kicker">STUDENT PORTAL</p><h1>Settings</h1><p>Configure your student portal preferences and examination experience.</p></div>
            <div className="account-user"><div className="account-user-copy"><strong>{fullName}</strong><span>@{username || 'student'}</span></div><div className="account-user-avatar">{initials}</div></div>
          </header>

          <div className="account-content">
            <section className="account-intro"><span className="account-intro-label">PREFERENCES</span><h2>Student Settings</h2><p>Control notifications, examination display preferences and session behavior for this browser account.</p></section>
            {saved && <div className="account-alert" style={{margin:'0 0 16px'}}>Settings saved successfully.</div>}
            <div className="settings-layout">
              <div className="settings-menu">{['General','Notifications','Examination','Privacy'].map((item)=><button key={item} className={activeTab===item?'active':''} onClick={()=>setActiveTab(item)} type="button">{item}</button>)}</div>
              <div>
                {activeTab==='General' && <section className="settings-section"><div className="settings-section-header"><h3>General Preferences</h3><p>Basic portal behavior and display settings.</p></div><SettingSelect label="Language" description="Interface language." value={settings.language} options={['English','Hindi','Kannada','Marathi']} onChange={(value)=>update('language',value)}/><SettingSelect label="Date Format" description="How dates are displayed throughout the portal." value={settings.dateFormat} options={['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD']} onChange={(value)=>update('dateFormat',value)}/><SettingToggle label="Compact Interface" description="Use tighter spacing in supported account screens." value={settings.compactInterface} onChange={()=>toggle('compactInterface')}/></section>}
                {activeTab==='Notifications' && <section className="settings-section"><div className="settings-section-header"><h3>Notifications</h3><p>Choose which browser-level reminders you want to use.</p></div><SettingToggle label="Exam Reminders" description="Show reminders for scheduled examinations." value={settings.examReminders} onChange={()=>toggle('examReminders')}/><SettingToggle label="Result Notifications" description="Keep result-related notifications enabled when supported by the application." value={settings.resultNotifications} onChange={()=>toggle('resultNotifications')}/><SettingToggle label="Security Alerts" description="Show important login and account-security notices." value={settings.securityAlerts} onChange={()=>toggle('securityAlerts')}/></section>}
                {activeTab==='Examination' && <section className="settings-section"><div className="settings-section-header"><h3>Examination Preferences</h3><p>Preferences that affect the student examination interface.</p></div><SettingToggle label="Auto Submit at Time Limit" description="Allow the examination interface to submit when its timer reaches zero." value={settings.autoSubmit} onChange={()=>toggle('autoSubmit')}/><SettingToggle label="Show Question Navigation" description="Keep the question navigator visible when supported by an exam." value={settings.questionNavigation} onChange={()=>toggle('questionNavigation')}/><SettingToggle label="Confirm Before Submit" description="Ask for confirmation before final examination submission." value={settings.confirmSubmit} onChange={()=>toggle('confirmSubmit')}/></section>}
                {activeTab==='Privacy' && <section className="settings-section"><div className="settings-section-header"><h3>Privacy & Security</h3><p>Local browser preferences and account security options.</p></div><SettingToggle label="Remember Preferences" description="Store these interface preferences in browser local storage." value={settings.rememberPreferences} onChange={()=>toggle('rememberPreferences')}/><div className="settings-row"><div className="settings-row-copy"><strong>Local Preference Storage</strong><span>Current preferences are stored locally in this browser.</span></div><button className="account-button danger" type="button" onClick={clearPreferences}>Clear</button></div></section>}
                <div className="account-actions" style={{background:'#fff',border:'1px solid #e2e5e8',borderRadius:10,padding:14}}><button className="account-button" type="button" onClick={resetSettings}>Reset Defaults</button><button className="account-button primary" type="button" onClick={saveSettings}>Save Settings</button></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentSettingsPage;
