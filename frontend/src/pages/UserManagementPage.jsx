import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { Modal } from '../components/common/Modal';
import {
  UserCheck,
  Plus,
  Shield,
  Key,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
  ArrowRightLeft
} from 'lucide-react';

export const UserManagementPage = () => {
  const { users, currentUser, loginUser, addUser, updateUser, deleteUser } = useAegis();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Command Center Operator');
  const [email, setEmail] = useState('');
  const [clearance, setClearance] = useState('LEVEL 3 - SECRET');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setRole('Command Center Operator');
    setEmail('');
    setClearance('LEVEL 3 - SECRET');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setName(user.name);
    setRole(user.role);
    setEmail(user.email);
    setClearance(user.clearance);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      username,
      name,
      role,
      email,
      clearance,
      status: 'ACTIVE',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
      avatar: name.charAt(0) || 'U'
    };

    if (editingUser) {
      updateUser({ ...editingUser, ...payload });
    } else {
      addUser(payload);
    }
    setIsModalOpen(false);
  };

  const handleSwitchAccount = (user) => {
    loginUser({
      username: user.username,
      name: user.name,
      role: user.role,
      clearance: user.clearance,
      token: `demo-jwt-token-${user.username}`
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1424] border border-cyan-900/50 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-cyan-200 tracking-wider uppercase">
              User Access & Clearance Credentials Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-Based Access Control (RBAC): Administrator, Command Center Operator, and Security Watch Officer.
          </p>
        </div>

        {currentUser?.role === 'Administrator' ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Demo Operator</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-500/50 text-[11px] font-mono text-amber-300">
            READ-ONLY (Admin L5 Clearance Required)
          </div>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map(u => {
          const isCurrent = currentUser?.username === u.username;

          return (
            <div
              key={u.id}
              className={`rounded-xl bg-[#0c1424] border p-4 shadow-xl transition-all font-mono text-xs ${
                isCurrent
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] bg-gradient-to-b from-[#0e1930] to-[#0c1424]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/50 flex items-center justify-center font-bold text-sm">
                    {u.avatar || u.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">{u.name}</h4>
                    <span className="text-[10px] text-cyan-400 font-semibold">{u.role}</span>
                  </div>
                </div>

                {currentUser?.role === 'Administrator' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {users.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove user ${u.username}?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="py-3 space-y-2 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Username:</span>
                  <span className="text-slate-200 font-bold">{u.username}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Email:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{u.email}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Clearance:</span>
                  <span className="text-amber-400 font-bold text-[10px]">{u.clearance}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">{u.status}</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  Last Access: {u.lastLogin}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                {isCurrent ? (
                  <div className="w-full py-1.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 text-center font-bold text-[10px]">
                    ACTIVE CONSOLE SESSION
                  </div>
                ) : (
                  <button
                    onClick={() => handleSwitchAccount(u)}
                    className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 text-center transition-colors flex items-center justify-center gap-1 text-[10px]"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                    <span>Switch to this Account</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.username}` : 'Create Demo User Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 uppercase text-[10px] mb-1">Full Name & Rank</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              placeholder="e.g. Major Alok Sharma"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Login Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                placeholder="e.g. officer_sharma"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                placeholder="e.g. sharma@defence.in"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Role Designation</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Administrator">Administrator</option>
                <option value="Command Center Operator">Command Center Operator</option>
                <option value="Security Officer">Security Officer</option>
                <option value="Signals Intelligence Analyst">Signals Intelligence Analyst</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[10px] mb-1">Security Clearance</label>
              <select
                value={clearance}
                onChange={(e) => setClearance(e.target.value)}
                className="w-full bg-[#060b14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="LEVEL 5 - TOP SECRET">LEVEL 5 - TOP SECRET</option>
                <option value="LEVEL 4 - CONFIDENTIAL">LEVEL 4 - CONFIDENTIAL</option>
                <option value="LEVEL 3 - SECRET">LEVEL 3 - SECRET</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
            >
              {editingUser ? 'Save User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
