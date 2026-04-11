'use client';

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Role } from '../types';
import { Users, UserPlus, Trash2, Shield, Link as LinkIcon, CheckCircle2, AlertCircle, Mail, Copy, ExternalLink, Lock, Zap, Fingerprint, MailPlus } from 'lucide-react';
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
    const subject = encodeURIComponent('Welcome to DevX System Hub');
    const body = encodeURIComponent(`Hi ${user.name},\n\nYou have been provisioned access to the DevX Hub as a ${user.role}.\n\nAccess Link:\n${link}\n\nRegards,\nAdmin`);
    window.location.href = `mailto:${user.email || ''}?subject=${subject}&body=${body}`;
  };

  const copyUserInvite = (user: any) => {
    const link = getInviteLink(user.role);
    navigator.clipboard.writeText(link);
    alert(`Invite link for ${user.name} copied to clipboard.`);
  };

  const generateLink = (role: Role) => {
    const link = getInviteLink(role);
    setGeneratedLink(link);
    setShowInviteLink(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Invite link copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-serif text-[#2A2A26] tracking-tight">User Management</h2>
          <p className="text-sm text-[#6B6A65] mt-1">Manage team access and role permissions.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => generateLink('Purchase')}
            className="btn-primary flex items-center"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Generate Invite Link
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInviteLink && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 border border-green-200 bg-green-50 flex flex-col md:flex-row items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-800">Invite Link Ready</p>
                <p className="text-xs text-slate-500 font-mono truncate max-w-sm mt-0.5">{generatedLink}</p>
              </div>
            </div>
            <button 
              onClick={copyToClipboard}
              className="mt-4 md:mt-0 btn-secondary"
            >
              Copy Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add User */}
        <div className="lg:col-span-4">
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center">
              <UserPlus className="h-4 w-4 mr-2 text-slate-400" />
              Add New User
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="input-field py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="input-field pl-9 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="input-field py-2"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full btn-primary py-2 mt-2"
              >
                Create User
              </button>
            </form>
          </div>
        </div>

        {/* Directory */}
        <div className="lg:col-span-8">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-[#E8E7E2] bg-transparent flex justify-between items-center">
              <h3 className="text-base font-semibold text-[#2A2A26]">Active Team Directory</h3>
              <span className="text-xs font-medium text-slate-500">{users.length} Users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-header w-1/3">User</th>
                    <th className="table-header">Role Profile</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm mr-3",
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          )}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{user.email || 'No email saved'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "status-badge inline-flex items-center",
                          user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          user.role === 'Purchase' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        )}>
                          {user.role === 'Admin' && <Shield className="h-3 w-3 mr-1" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          <span className="text-xs font-medium text-slate-600">Active</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end space-x-1">
                          <button 
                            onClick={() => sendEmailInvite(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Send Invite via Email"
                          >
                            <MailPlus className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => copyUserInvite(user)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Copy Invite Link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => removeUser(user.id)}
                            disabled={user.role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Remove User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm text-slate-500">No active team members found.</td>
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
