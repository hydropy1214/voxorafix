'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload, Users, Search, Trash2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ContactsPage() {
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: () => api.get('/contacts/lists').then(r => r.data),
  })

  const { data: contacts } = useQuery({
    queryKey: ['contacts', selectedList, search],
    queryFn: () => selectedList
      ? api.get(`/contacts/lists/${selectedList}/contacts?search=${search}`).then(r => r.data)
      : null,
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
      toast.success(`Imported ${res.data.valid} valid contacts (${res.data.duplicates} duplicates removed)`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Import failed'),
  })

  const onDrop = useCallback((files: File[]) => {
    if (!selectedList) { toast.error('Select a contact list first'); return }
    if (files[0]) importMutation.mutate({ listId: selectedList, file: files[0] })
  }, [selectedList, importMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    noClick: !selectedList,
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage your contact lists for campaigns</p>
        </div>
        <button
          onClick={() => setShowNewList(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lists sidebar */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-1">
            Contact Lists
          </p>

          {showNewList && (
            <div className="bg-card border border-brand-500/40 rounded-2xl p-3 shadow-glow-brand/5">
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="List name..."
                autoFocus
                className="w-full bg-transparent text-sm focus:outline-none mb-2.5 placeholder:text-muted-foreground/50"
                onKeyDown={e => {
                  if (e.key === 'Enter') createListMutation.mutate(newListName)
                  if (e.key === 'Escape') setShowNewList(false)
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => createListMutation.mutate(newListName)}
                  className="flex-1 py-1.5 text-xs btn-primary justify-center"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewList(false)}
                  className="flex-1 py-1.5 text-xs btn-secondary justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={cn('h-16 rounded-2xl skeleton', i > 0 && 'opacity-50')} />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                <Users className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm">No lists yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Create a list to get started</p>
            </div>
          ) : (
            lists.map((list: any) => (
              <div
                key={list.id}
                onClick={() => setSelectedList(list.id === selectedList ? null : list.id)}
                className={cn(
                  'p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 group',
                  selectedList === list.id
                    ? 'border-brand-500/50 bg-brand-500/[0.08] shadow-glow-brand/5'
                    : 'border-border bg-card hover:border-brand-500/20 hover:bg-card/80',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">{list.name}</p>
                  <button
                    onClick={e => { e.stopPropagation(); deleteListMutation.mutate(list.id) }}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-3 text-[11px] text-muted-foreground mt-1.5">
                  <span>{formatNumber(list.totalCount)} total</span>
                  <span>·</span>
                  <span className="text-green-400">{formatNumber(list.validCount)} valid</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contacts panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* CSV dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200',
              isDragActive
                ? 'border-brand-500 bg-brand-500/[0.06] shadow-glow-brand/10'
                : 'border-border hover:border-brand-500/40',
              !selectedList && 'opacity-50 cursor-not-allowed',
              selectedList && !isDragActive && 'cursor-pointer',
            )}
          >
            <input {...getInputProps()} />
            <div className={cn(
              'h-10 w-10 rounded-2xl flex items-center justify-center mx-auto mb-3',
              isDragActive ? 'bg-brand-500/20' : 'bg-muted/50',
            )}>
              <Upload className={cn('h-5 w-5', isDragActive ? 'text-brand-400' : 'text-muted-foreground')} />
            </div>
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop your CSV here' : 'Upload CSV file'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedList
                ? 'CSV with phone column — auto-validates & deduplicates'
                : 'Select a contact list first'}
            </p>
          </div>

          {/* Contacts table */}
          {selectedList && contacts && (
            <>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search contacts..."
                    className="input-field pl-10"
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatNumber(contacts.total)} contacts
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="data-table">
                  <thead>
                    <tr>
                      {['Phone', 'Name', 'Country', 'Valid', 'Opt-Out'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.data?.map((c: any) => (
                      <tr key={c.id}>
                        <td>
                          <span className="font-mono text-xs text-foreground">
                            {c.formattedPhone || c.phone}
                          </span>
                        </td>
                        <td className="text-muted-foreground text-xs">
                          {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td className="text-muted-foreground text-xs">{c.countryCode || '—'}</td>
                        <td>
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-md font-medium',
                            c.isValid
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400',
                          )}>
                            {c.isValid ? '✓ Valid' : '✗ Invalid'}
                          </span>
                        </td>
                        <td>
                          <span className={cn(
                            'text-[10px]',
                            c.isOptedOut ? 'text-red-400' : 'text-muted-foreground',
                          )}>
                            {c.isOptedOut ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!selectedList && (
            <div className="flex items-center justify-center h-48 text-center text-muted-foreground">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium">Select a list to view contacts</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Choose from the sidebar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
