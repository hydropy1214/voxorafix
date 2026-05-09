'use client'

import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Upload, Users, Search, Trash2, Download, Filter,
  CheckCircle2, XCircle, AlertTriangle, FileText, RefreshCw,
  ChevronDown, ChevronRight, Edit2, Phone, Mail, Building2,
  Tag, Eye, Loader2, X, Info,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Sample CSV content ───────────────────────────────────────────
const SAMPLE_CSV = `phone,firstName,lastName,email,company,notes
+14155550100,John,Smith,john@acmecorp.com,Acme Corp,VIP customer
+14155550101,Sarah,Johnson,sarah@example.com,Tech Co,Follow up needed
+14155550102,Michael,Brown,,Retail Inc,
+14155550103,Emily,Davis,emily@startup.io,Startup Inc,Decision maker
+447700900123,James,Wilson,,UK Telecom,International
`

function downloadSample() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'voxora-contacts-sample.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Types ────────────────────────────────────────────────────────
interface ImportResult {
  total: number
  valid: number
  invalid: number
  duplicates: number
  optedOut: number
  invalidSamples?: string[]
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ContactsPage() {
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'VALID' | 'INVALID' | 'OPTED_OUT'>('ALL')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [showImportResult, setShowImportResult] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [showDeleteList, setShowDeleteList] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const qc = useQueryClient()

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: () => api.get('/contacts/lists').then(r => r.data),
  })

  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts', selectedList, search, filter],
    queryFn: () => {
      if (!selectedList) return null
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filter !== 'ALL') params.set('filter', filter)
      return api.get(`/contacts/lists/${selectedList}/contacts?${params}`).then(r => r.data)
    },
    enabled: !!selectedList,
  })

  const createListMutation = useMutation({
    mutationFn: (name: string) => api.post('/contacts/lists', { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-lists'] })
      setNewListName('')
      setShowNewList(false)
      toast.success('Contact list created')
    },
  })

  const deleteListMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contacts/lists/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-lists'] })
      if (selectedList) setSelectedList(null)
      setShowDeleteList(false)
      toast.success('List deleted')
    },
  })

  const importMutation = useMutation({
    mutationFn: ({ listId, file }: { listId: string; file: File }) => {
      const form = new FormData()
      form.append('file', file)
      return api.post(`/contacts/lists/${listId}/import`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['contact-lists'] })
      qc.invalidateQueries({ queryKey: ['contacts'] })
      setImportResult(res.data)
      setShowImportResult(true)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Import failed'),
  })

  const deleteContactsMutation = useMutation({
    mutationFn: (ids: string[]) => api.post('/contacts/bulk-delete', { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['contact-lists'] })
      setSelectedContacts(new Set())
      toast.success('Contacts deleted')
    },
  })

  const exportMutation = useMutation({
    mutationFn: (listId: string) => api.get(`/contacts/lists/${listId}/export`, { responseType: 'blob' }),
    onSuccess: (res) => {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `contacts-export-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    },
    onError: () => toast.error('Export failed'),
  })

  const onDrop = useCallback((files: File[]) => {
    if (!selectedList) { toast.error('Select a contact list first'); return }
    if (files[0]) importMutation.mutate({ listId: selectedList, file: files[0] })
  }, [selectedList, importMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    noClick: !selectedList,
  })

  const toggleContact = (id: string) => {
    setSelectedContacts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAllContacts = () => {
    if (!contacts?.data) return
    if (selectedContacts.size === contacts.data.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(contacts.data.map((c: any) => c.id)))
    }
  }

  const selectedList_ = lists.find((l: any) => l.id === selectedList)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads & Contacts</h1>
          <p className="page-subtitle">
            {lists.length > 0
              ? `${lists.reduce((a: number, l: any) => a + (l.validCount || 0), 0).toLocaleString()} valid contacts across ${lists.length} list${lists.length !== 1 ? 's' : ''}`
              : 'Manage your contact lists for campaigns'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadSample}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/30 transition-all"
          >
            <FileText className="h-3.5 w-3.5" />
            Sample CSV
          </button>
          <button
            onClick={() => setShowNewList(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            New List
          </button>
        </div>
      </div>

      {/* Import result banner */}
      {showImportResult && importResult && (
        <div className="bg-card border border-violet-500/30 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Import complete
              </p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-zinc-400" />
                  <span className="text-muted-foreground">Total rows:</span>
                  <span className="font-bold">{importResult.total}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-muted-foreground">Valid:</span>
                  <span className="font-bold text-emerald-400">{importResult.valid}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">Invalid numbers:</span>
                  <span className="font-bold text-red-400">{importResult.invalid}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-muted-foreground">Duplicates removed:</span>
                  <span className="font-bold text-amber-400">{importResult.duplicates}</span>
                </div>
              </div>
              {importResult.invalidSamples && importResult.invalidSamples.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  Invalid examples: {importResult.invalidSamples.slice(0, 3).join(', ')}
                  {importResult.invalidSamples.length > 3 && ` +${importResult.invalidSamples.length - 3} more`}
                </p>
              )}
            </div>
            <button onClick={() => setShowImportResult(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Left — Lists sidebar */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1">
            Contact Lists
          </p>

          {/* New list form */}
          {showNewList && (
            <div className="bg-card border border-violet-500/40 rounded-2xl p-3">
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="List name..."
                autoFocus
                className="w-full bg-transparent text-sm focus:outline-none mb-2.5 text-white placeholder:text-muted-foreground/50"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newListName) createListMutation.mutate(newListName)
                  if (e.key === 'Escape') setShowNewList(false)
                }}
              />
              <div className="flex gap-2">
                <button onClick={() => newListName && createListMutation.mutate(newListName)}
                  disabled={!newListName || createListMutation.isPending}
                  className="flex-1 py-1.5 text-xs btn-primary justify-center rounded-xl disabled:opacity-50">
                  {createListMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Create'}
                </button>
                <button onClick={() => setShowNewList(false)}
                  className="flex-1 py-1.5 text-xs btn-secondary justify-center rounded-xl">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className={cn('h-16 rounded-2xl skeleton', i > 0 && 'opacity-50')} />)}
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                <Users className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No lists yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Create a list to get started</p>
            </div>
          ) : (
            lists.map((list: any) => (
              <div
                key={list.id}
                onClick={() => setSelectedList(list.id === selectedList ? null : list.id)}
                className={cn(
                  'p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 group',
                  selectedList === list.id
                    ? 'border-violet-500/50 bg-violet-500/[0.07]'
                    : 'border-border bg-card hover:border-violet-500/20',
                )}
              >
                {/* Rename inline */}
                {renaming === list.id ? (
                  <input
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold focus:outline-none text-white"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    onBlur={() => setRenaming(null)}
                    onKeyDown={e => {
                      e.stopPropagation()
                      if (e.key === 'Enter') {
                        api.put(`/contacts/lists/${list.id}`, { name: renameValue })
                          .then(() => { qc.invalidateQueries({ queryKey: ['contact-lists'] }); setRenaming(null); toast.success('List renamed') })
                          .catch(() => toast.error('Failed to rename'))
                      }
                      if (e.key === 'Escape') setRenaming(null)
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate flex-1">{list.name}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setRenaming(list.id); setRenameValue(list.name) }}
                        className="p-1 rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => exportMutation.mutate(list.id)}
                        className="p-1 rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
                        title="Export CSV"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => { setSelectedList(list.id); setShowDeleteList(true) }}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete list"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="text-emerald-400 font-semibold">{formatNumber(list.validCount)} valid</span>
                  <span className="text-muted-foreground">/ {formatNumber(list.totalCount)} total</span>
                  {list.optedOutCount > 0 && (
                    <span className="text-red-400">{list.optedOutCount} opted out</span>
                  )}
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: list.totalCount > 0 ? `${(list.validCount / list.totalCount) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right — Contact panel */}
        <div className="space-y-4">
          {/* CSV dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-150',
              isDragActive ? 'border-violet-500 bg-violet-500/[0.06]' : 'border-border hover:border-violet-500/40',
              !selectedList && 'opacity-50 cursor-not-allowed',
              selectedList && !isDragActive && 'cursor-pointer',
            )}
          >
            <input {...getInputProps()} />
            <div className={cn('h-10 w-10 rounded-2xl flex items-center justify-center mx-auto mb-3', isDragActive ? 'bg-violet-500/20' : 'bg-muted/40')}>
              {importMutation.isPending
                ? <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
                : <Upload className={cn('h-5 w-5', isDragActive ? 'text-violet-400' : 'text-muted-foreground')} />
              }
            </div>
            <p className="text-sm font-semibold text-white">
              {importMutation.isPending ? 'Importing...' : isDragActive ? 'Drop CSV here' : 'Upload contact list'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedList ? 'CSV with phone column required · Numbers are validated & deduplicated automatically' : 'Select a list first'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); downloadSample() }}
                className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Download sample CSV format
              </button>
            </div>
          </div>

          {/* CSV format info */}
          <div className="bg-muted/20 border border-border rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <p className="text-xs font-semibold text-cyan-300">CSV format guide</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <p className="font-semibold text-foreground mb-1">Required</p>
                <code className="text-violet-400">phone</code>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Optional</p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p><code>firstName</code>, <code>lastName</code></p>
                  <p><code>email</code>, <code>company</code></p>
                  <p><code>notes</code></p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Accepted formats</p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>+14155550100</p>
                  <p>14155550100</p>
                  <p>+447700900123</p>
                </div>
              </div>
            </div>
          </div>

          {selectedList && contacts && (
            <>
              {/* Search, filter, bulk actions bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by phone or name..."
                    className="input-field pl-10 text-sm"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value as any)}
                  className="input-field w-36 text-sm"
                >
                  <option value="ALL">All contacts</option>
                  <option value="VALID">Valid only</option>
                  <option value="INVALID">Invalid only</option>
                  <option value="OPTED_OUT">Opted out</option>
                </select>

                <button
                  onClick={() => exportMutation.mutate(selectedList)}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-border rounded-xl text-xs hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>

              {/* Bulk action bar */}
              {selectedContacts.size > 0 && (
                <div className="flex items-center justify-between p-3 bg-violet-500/10 border border-violet-500/25 rounded-xl animate-fade-in">
                  <span className="text-sm font-semibold text-violet-300">{selectedContacts.size} selected</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteContactsMutation.mutate(Array.from(selectedContacts))}
                      disabled={deleteContactsMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete selected
                    </button>
                    <button onClick={() => setSelectedContacts(new Set())}
                      className="px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground">
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Valid: <span className="font-bold text-emerald-400">{selectedList_?.validCount?.toLocaleString()}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Invalid: <span className="font-bold text-red-400">{((selectedList_?.totalCount || 0) - (selectedList_?.validCount || 0)).toLocaleString()}</span></span>
                </div>
                {contacts.total > 0 && (
                  <span className="text-muted-foreground">Showing {contacts.data?.length} of {contacts.total}</span>
                )}
              </div>

              {/* Contacts table */}
              {loadingContacts ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}
                </div>
              ) : contacts.data?.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No contacts match this filter</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-8">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedContacts.size === contacts.data?.length && contacts.data?.length > 0}
                            onChange={toggleAllContacts}
                          />
                        </th>
                        {['Phone', 'Name', 'Email', 'Company', 'Status'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.data?.map((c: any) => (
                        <tr key={c.id} className={cn(selectedContacts.has(c.id) && 'bg-violet-500/[0.04]')}>
                          <td>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedContacts.has(c.id)}
                              onChange={() => toggleContact(c.id)}
                            />
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="font-mono text-xs text-white">{c.formattedPhone || c.phone}</span>
                            </div>
                          </td>
                          <td className="text-xs text-muted-foreground">
                            {[c.firstName, c.lastName].filter(Boolean).join(' ') || <span className="text-muted-foreground/40">—</span>}
                          </td>
                          <td className="text-xs text-muted-foreground">
                            {c.email ? (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-[120px]">{c.email}</span>
                              </div>
                            ) : <span className="text-muted-foreground/40">—</span>}
                          </td>
                          <td className="text-xs text-muted-foreground">
                            {c.company ? (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-[100px]">{c.company}</span>
                              </div>
                            ) : <span className="text-muted-foreground/40">—</span>}
                          </td>
                          <td>
                            {c.isOptedOut ? (
                              <span className="badge badge-red text-[10px]">Opted out</span>
                            ) : c.isValid ? (
                              <span className="badge badge-green text-[10px]">Valid</span>
                            ) : (
                              <span className="badge badge-red text-[10px]">Invalid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!selectedList && (
            <div className="flex flex-col items-center justify-center h-52 text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Select a list to manage contacts</p>
              <p className="text-xs text-muted-foreground/60">Or create a new list to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete list confirmation */}
      {showDeleteList && selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-modal animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Delete list</h3>
                <p className="text-xs text-muted-foreground">This removes all contacts in the list</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Are you sure you want to delete <span className="font-semibold text-foreground">{selectedList_?.name}</span> and all {selectedList_?.totalCount?.toLocaleString()} contacts?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteListMutation.mutate(selectedList)}
                disabled={deleteListMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleteListMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Delete list'}
              </button>
              <button onClick={() => setShowDeleteList(false)} className="flex-1 btn-secondary py-2.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
