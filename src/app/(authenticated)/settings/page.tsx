"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  User,
  Users,
  Shield,
  Save,
  Plus,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'team'

interface TeamUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and team settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'profile'
              ? 'border-[#00CFF8] text-[#003964]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <User className="h-4 w-4" />
          Profile
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('team')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === 'team'
                ? 'border-[#00CFF8] text-[#003964]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Users className="h-4 w-4" />
            Team
          </button>
        )}
      </div>

      {activeTab === 'profile' ? (
        <ProfileTab session={session} onSessionUpdate={updateSession} />
      ) : (
        <TeamTab />
      )}
    </div>
  )
}

function ProfileTab({
  session,
  onSessionUpdate,
}: {
  session: ReturnType<typeof useSession>['data']
  onSessionUpdate: ReturnType<typeof useSession>['update']
}) {
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSaveProfile() {
    setSaving(true)
    setProfileMsg(null)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save')
      }

      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
      onSessionUpdate({ name: name.trim(), email: email.trim() })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    setChangingPassword(true)
    setPasswordMsg(null)

    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to change password')
      }

      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change password' })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            {profileMsg && (
              <div
                className={cn(
                  'p-3 rounded-lg text-sm',
                  profileMsg.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                )}
              >
                {profileMsg.text}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} loading={saving}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />

            {passwordMsg && (
              <div
                className={cn(
                  'p-3 rounded-lg text-sm',
                  passwordMsg.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                )}
              >
                {passwordMsg.text}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleChangePassword}
                loading={changingPassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                <Shield className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function TeamTab() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  // New user form
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('SALES_REP')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : data.users ?? [])
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUser() {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setFormError('All fields are required.')
      return
    }

    setCreating(true)
    setFormError(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
          role: newRole,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create user')
      }

      setShowAddForm(false)
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setNewRole('SALES_REP')
      fetchUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  function roleBadgeColor(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  function roleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin'
      case 'MANAGER':
        return 'Manager'
      case 'SALES_REP':
        return 'Sales Rep'
      default:
        return role
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>

        {/* Add User Form */}
        {showAddForm && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Full name"
              />
              <Input
                label="Email"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@example.com"
              />
              <Input
                label="Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Initial password"
              />
              <Select
                label="Role"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
              >
                <option value="SALES_REP">Sales Rep</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>

            {formError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setFormError(null)
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateUser} loading={creating}>
                Create User
              </Button>
            </div>
          </div>
        )}

        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="h-9 w-9 rounded-full bg-[#625AED] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Badge className={roleBadgeColor(user.role)}>
                    {roleLabel(user.role)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
