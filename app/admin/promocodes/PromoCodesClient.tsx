'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

type Promo = {
  _id: string
  code: string
  type: 'percent' | 'flat'
  value: number
  active: boolean
  startsAt?: string
  endsAt?: string
  maxRedemptions?: number
  maxRedemptionsPerUser?: number
  usageCount?: number
}

export default function PromoCodesClient() {
  const [list, setList] = useState<Promo[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'flat',
    value: 10,
    active: true,
    startsAt: '',
    endsAt: '',
    maxRedemptions: '',
    maxRedemptionsPerUser: '1',
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/promocodes')
      const data = await res.json()
      setList(Array.isArray(data.promoCodes) ? data.promoCodes : [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const gen = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let out = ''
    for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
    setForm(prev => ({ ...prev, code: out }))
  }

  const save = async () => {
    try {
      if (!/^[A-Z0-9]{8}$/.test(form.code)) { toast.error('Code must be 8 letters/numbers'); return }
      const body = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        active: form.active,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        maxRedemptionsPerUser: form.maxRedemptionsPerUser ? Number(form.maxRedemptionsPerUser) : 1,
      }
      const res = await fetch('/api/admin/promocodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { toast.error(data?.error || 'Failed to create'); return }
      toast.success('Promo created')
      setForm({ code: '', type: 'percent', value: 10, active: true, startsAt: '', endsAt: '', maxRedemptions: '', maxRedemptionsPerUser: '1' })
      load()
    } catch { toast.error('Failed to create') }
  }

  const toggleActive = async (p: Promo) => {
    try {
      const res = await fetch('/api/admin/promocodes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p._id, active: !p.active }) })
      if (res.ok) {
        toast.success('Updated')
        load()
      } else {
        toast.error('Update failed')
      }
    } catch { toast.error('Update failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Promo Codes</h1>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="p-4 rounded-xl border">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold">Code</label>
            <div className="flex gap-2">
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={8} className="w-full px-3 py-2 rounded border" placeholder="XXXXXXXX" />
              <button onClick={gen} className="px-3 rounded border">Gen</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full px-3 py-2 rounded border">
              <option value="percent">Percent %</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold">Value</label>
            <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="w-full px-3 py-2 rounded border" />
          </div>
          <div>
            <label className="text-xs font-semibold">Start Date</label>
            <input type="date" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} className="w-full px-3 py-2 rounded border" />
          </div>
          <div>
            <label className="text-xs font-semibold">End Date</label>
            <input type="date" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} className="w-full px-3 py-2 rounded border" />
          </div>
          <div>
            <label className="text-xs font-semibold">Max Uses</label>
            <input type="number" value={form.maxRedemptions} onChange={e => setForm({ ...form, maxRedemptions: e.target.value })} className="w-full px-3 py-2 rounded border" placeholder="Unlimited" />
          </div>
          <div>
            <label className="text-xs font-semibold">Max Uses Per User</label>
            <input type="number" value={form.maxRedemptionsPerUser} onChange={e => setForm({ ...form, maxRedemptionsPerUser: e.target.value })} className="w-full px-3 py-2 rounded border" />
          </div>
          <div className="flex items-end gap-2">
            <label className="text-xs font-semibold">Active</label>
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          </div>
          <div className="flex items-end">
            <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {loading && <div className="text-sm">Loading...</div>}
        {list.map(p => (
          <div key={p._id} className="p-4 border rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold">{p.code} <span className="text-xs font-medium ml-2">{p.type === 'percent' ? `${p.value}%` : `₹${p.value}`}</span></div>
              <div className="text-xs text-gray-500">Used {p.usageCount || 0} times{p.maxRedemptions ? ` / ${p.maxRedemptions}` : ''}</div>
            </div>
            <button onClick={() => toggleActive(p)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border">
              {p.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {p.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
        {list.length === 0 && !loading && <div className="text-sm">No promo codes yet.</div>}
      </div>
    </div>
  )
}
