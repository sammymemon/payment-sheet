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
  ExternalLink
} from 'lucide-react';

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
    const subject = encodeURIComponent('Invitation to DevX Payment Sheet');
    const body = encodeURIComponent(`Hi ${user.name},\n\nYou have been invited to join the DevX Payment Sheet as a ${user.role}.\n\nPlease access your workspace here:\n${link}\n\nRegards,\nAdmin Team`);
    window.location.href = `mailto:${user.email || ''}?subject=${subject}&body=${body}`;
  };

  const copyUserInvite = (user: any) => {
    const link = getInviteLink(user.role);
    navigator.clipboard.writeText(link);
    alert(`Invite link for ${user.name} copied!`);
  };

  const generateLink = (role: Role) => {
    const link = getInviteLink(role);
    setGeneratedLink(link);
    setShowInviteLink(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Create and manage access rights for the DevX Payment Sheet.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => generateLink('Purchase')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Invite Purchase User
          </button>
        </div>
      </div>

      {showInviteLink && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Invite Link Generated</p>
              <p className="text-xs text-blue-700 font-mono break-all">{generatedLink}</p>
            </div>
          </div>
          <button 
            onClick={copyToClipboard}
            className="ml-4 px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-semibold rounded hover:bg-blue-50"
          >
            Copy Link
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add User Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            Add New User
          </h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department / Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium transition-colors"
            >
              Create User
            </button>
          </form>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 italic">Admin Rights Note</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Users created here will be stored locally. To share access, use the "Invite Link" feature.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Active Users
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Purchase' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'Admin' && <Shield className="h-3 w-3 mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center text-xs text-green-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => sendEmailInvite(user)}
                        title="Send Email Invite"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => copyUserInvite(user)}
                        title="Copy Invite Link"
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => removeUser(user.id)}
                        disabled={user.role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                        title={user.role === 'Admin' ? "Cannot delete last admin" : "Delete user"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
