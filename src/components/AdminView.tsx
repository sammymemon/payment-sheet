'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Role } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Copy,
  ExternalLink,
  Lock,
  Zap,
  Fingerprint,
  MailPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const AdminView: React.FC = () => {
  const { users, addUser, removeUser } = useApp();
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('Purchase');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const roles: Role[] = ['Purchase', 'Accounts', 'Compliance', 'Payments', 'Admin', 'Register', 'Dashboard'];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addUser(newName.trim(), newRole, newEmail.trim() || undefined);
      setNewName('');
      setNewEmail('');
    }
  };

  const getInviteLink = (role: Role) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?role=${role}`;
  };

  const sendEmailInvite = (user: any) => {
    const link = getInviteLink(user.role);
    const subject = encodeURIComponent('Welcome to DevX Intel Intelligence Hub');
    const body = encodeURIComponent(`Hi ${user.name},\n\nYou have been provisioned access to the DevX Payment Hub as a ${user.role}.\n\nSecure Workspace Access:\n${link}\n\nThis link bypasses standard login for your role profile.\n\nRegards,\nSecurity Operations`);
    window.location.href = `mailto:${user.email || ''}?subject=${subject}&body=${body}`;
  };

  const copyUserInvite = (user: any) => {
    const link = getInviteLink(user.role);
    navigator.clipboard.writeText(link);
    alert(`Access Token Sequence for ${user.name} copied to clipboard.`);
  };

  const generateLink = (role: Role) => {
    const link = getInviteLink(role);
    setGeneratedLink(link);
    setShowInviteLink(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Global Invite Sequence copied.');
  };

  return (
    <div className="space-y-10 animate-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-4">
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20">
              <Shield className="text-white h-6 w-6" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity Control</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage personnel clearance and department-level access.</p>
           </div>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => generateLink('Purchase')}
            className="group flex items-center px-6 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
          >
            <LinkIcon className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
            Issue Global Invite
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInviteLink && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-900 p-6 rounded-3xl border border-emerald-800 shadow-2xl flex flex-col md:flex-row items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-3 bg-emerald-800 rounded-xl mr-4 shadow-inner">
                <Zap className="h-5 w-5 text-emerald-300 animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest leading-none mb-2">Invite Token Generated</p>
                <p className="text-xs text-white font-mono truncate max-w-md bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-800">{generatedLink}</p>
              </div>
            </div>
            <button 
              onClick={copyToClipboard}
              className="mt-4 md:mt-0 px-6 py-2.5 bg-white text-emerald-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
            >
              Capture Token
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* User Enrollment Form */}
        <div className="lg:col-span-4">
          <div className="glass-card p-8 sticky top-6">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center">
              <Fingerprint className="h-5 w-5 mr-3 text-blue-600" />
              User Enrollment
            </h3>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Personnel Identity</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Legal Full Name"
                  className="input-field bg-slate-50 border-transparent focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Communications Vector</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                   <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@devx.com"
                    className="input-field pl-11 bg-slate-50 border-transparent focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Clearance Department</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="input-field bg-slate-50 border-transparent focus:bg-white font-bold"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] mt-4"
              >
                Provision Account
              </button>
            </form>

            <div className="mt-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start space-x-3">
               <Lock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
               <p className="text-[10px] font-medium text-blue-800 italic leading-relaxed">
                  Encryption Key: Enrollment creates a persistent local profile. Cross-device syncing requires the unique invitation token sequence.
               </p>
            </div>
          </div>
        </div>

        {/* Personnel Directory */}
        <div className="lg:col-span-8">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="px-10 py-7 border-b border-slate-100 bg-white flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Directory</h3>
              <div className="flex space-x-2">
                 <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-full">{users.length} PROFILES</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-10 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personnel</th>
                    <th className="px-10 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clearance</th>
                    <th className="px-10 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Status</th>
                    <th className="px-10 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Protocol Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center">
                          <div className={cn(
                            "h-11 w-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner transition-transform group-hover:rotate-12",
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          )}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-5">
                            <div className="text-sm font-black text-slate-900 tracking-tight">{user.name}</div>
                            <div className="text-[10px] font-medium text-slate-400">{user.email || 'ENCRYPTED_ID'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={cn(
                          "status-badge",
                          user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          user.role === 'Purchase' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        )}>
                          {user.role === 'Admin' && <Shield className="h-3 w-3 mr-1.5" />}
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center space-x-2">
                          <span className="relative flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => sendEmailInvite(user)}
                            className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Despatch Mail Invite"
                          >
                            <MailPlus className="h-4.5 w-4.5" />
                          </button>
                          <button 
                            onClick={() => copyUserInvite(user)}
                            className="w-10 h-10 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Cloning Token Sequence"
                          >
                            <Copy className="h-4.5 w-4.5" />
                          </button>
                          <button 
                            onClick={() => removeUser(user.id)}
                            disabled={user.role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1}
                            className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-rose-50 disabled:hover:text-rose-600"
                            title="Revoke Clearances"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">Directory NULL Segment</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
