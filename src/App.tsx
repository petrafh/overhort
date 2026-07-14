import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Camera,
  Check,
  ChevronLeft,
  Heart,
  Home,
  KeyRound,
  LockKeyhole,
  LogIn,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Trash2,
  UserRound,
  UserRoundCheck,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react'
import { currentUser, friends, initialQuotes, pendingRequests, quoteColors } from './data'
import { api } from './api'
import type { Quote, Tab, User } from './types'

function Avatar({ user, size = 'md', ring = false }: { user: User; size?: 'sm' | 'md' | 'lg' | 'xl'; ring?: boolean }) {
  const sizes = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-sm', xl: 'h-24 w-24 text-xl md:h-28 md:w-28' }
  return (
    <div
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-full font-semibold tracking-wide text-white ${ring ? 'ring-2 ring-black ring-offset-2 ring-offset-[#f7f7f5]' : ''}`}
      style={{ background: user.avatar }}
      aria-label={`Profilbilde til ${user.name}`}
    >
      {!user.avatar.includes('url(') && user.initials}
    </div>
  )
}

function Wordmark() {
  return (
    <button className="group flex items-center gap-2.5" aria-label="Overhørt – gå hjem">
      <span className="grid h-8 w-8 place-items-center transition-transform duration-300 group-hover:-rotate-6" aria-hidden="true">
        <svg viewBox="0 0 40 40" className="h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18.5" fill="#101010" />
          <g className="origin-center transition-transform duration-300 group-hover:scale-105" stroke="white" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24.7 29.8C23.6 32 21.8 33.2 19.7 33.2C16.3 33.2 14 30.7 14 27.4V19.3C14 14.3 17.5 10.7 22.4 10.7C27.1 10.7 30.5 14 30.5 18.4C30.5 21.5 29.1 23.4 26.8 25C25.3 26 24.5 27.1 24.7 29.8Z" strokeWidth="2.25" />
            <path d="M18.6 24.8V19.6C18.6 17.1 20.1 15.3 22.4 15.3C24.5 15.3 26 16.8 26 18.8C26 20.3 25.3 21.3 23.9 22.2C21.5 23.9 20.7 25.8 21.5 28" strokeWidth="1.9" />
            <path d="M18.6 20.5C20.1 20.2 21.2 20.6 22 21.7" strokeWidth="1.6" />
          </g>
        </svg>
      </span>
      <span className="font-display text-[27px] leading-none tracking-[-0.02em]">overhørt</span>
    </button>
  )
}

function Nav({ active, onChange, requestCount }: { active: Tab; onChange: (tab: Tab) => void; requestCount: number }) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'feed', label: 'Hjem', icon: Home },
    { id: 'create', label: 'Nytt sitat', icon: Plus },
    { id: 'friends', label: 'Venner', icon: UsersRound },
    { id: 'profile', label: 'Profil', icon: UserRound },
  ]
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-black/10 bg-[#f7f7f5] px-7 py-8 lg:flex">
        <Wordmark />
        <nav className="mt-16 space-y-2">
          {items.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => onChange(id)} className={`nav-item ${active === id ? 'nav-item-active' : ''}`}>
              <span className="relative">
                <Icon size={21} strokeWidth={active === id ? 2.4 : 1.7} />
                {id === 'friends' && requestCount > 0 && <span className="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-[#a75d50]" />}
              </span>
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-black/10 pt-6">
          <Avatar user={currentUser} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentUser.name}</p>
            <p className="truncate text-xs text-black/45">@{currentUser.username}</p>
          </div>
          <MoreHorizontal size={18} className="ml-auto text-black/50" />
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[74px] items-start justify-around border-t border-black/10 bg-[#f7f7f5]/95 px-5 pt-3 shadow-nav backdrop-blur-xl lg:hidden">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)} className={`relative flex min-w-14 flex-col items-center gap-1 text-[10px] ${active === id ? 'font-semibold text-black' : 'text-black/45'}`}>
            <span className={`${id === 'create' ? 'grid h-9 w-9 -translate-y-1 place-items-center rounded-full bg-black text-white' : 'grid h-7 place-items-center'}`}>
              <Icon size={id === 'create' ? 20 : 22} strokeWidth={active === id ? 2.4 : 1.8} />
            </span>
            {id !== 'create' && label}
            {id === 'friends' && requestCount > 0 && <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-[#a75d50] ring-2 ring-[#f7f7f5]" />}
          </button>
        ))}
      </nav>
    </>
  )
}

function MobileHeader({ title = 'overhørt', onFriends, requestCount }: { title?: string; onFriends: () => void; requestCount: number }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 bg-[#f7f7f5]/90 px-5 backdrop-blur-xl lg:hidden">
      {title === 'overhørt' ? <Wordmark /> : <h1 className="text-lg font-semibold">{title}</h1>}
      <button onClick={onFriends} className="relative grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white" aria-label="Venneforespørsler">
        <Bell size={18} />
        {requestCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#a75d50] px-1 text-[9px] font-bold text-white">{requestCount}</span>}
      </button>
    </header>
  )
}

function QuoteCard({ quote, onLike, onDelete, onComment }: { quote: Quote; onLike: () => void; onDelete?: () => void; onComment: (text: string) => void }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comment, setComment] = useState('')

  const submitComment = (e: FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    onComment(comment.trim())
    setComment('')
    setCommentsOpen(true)
  }

  return (
    <article className="overflow-hidden border-b border-black/10 pb-7 sm:rounded-[22px] sm:border sm:bg-white sm:pb-0 sm:shadow-card">
      <div className="flex items-center gap-3 px-1 pb-3 sm:px-4 sm:py-4">
        <Avatar user={quote.subject} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{quote.subject.name}</p>
          <p className="text-[11px] text-black/45">sagt · {quote.timestamp}</p>
        </div>
        {onDelete ? (
          <button onClick={onDelete} className="icon-button text-black/45 hover:text-red-700" aria-label="Slett sitat"><Trash2 size={18} /></button>
        ) : (
          <button className="icon-button text-black/50" aria-label="Mer"><MoreHorizontal size={20} /></button>
        )}
      </div>

      <div className="quote-panel" style={{ backgroundColor: quote.color }}>
        <span className="absolute left-5 top-2 font-display text-7xl leading-none text-white/15">“</span>
        <p className="relative z-10 max-w-[88%] text-center font-display text-[29px] leading-[1.14] tracking-[-0.015em] text-white sm:text-[34px]">{quote.text}</p>
        <p className="absolute bottom-5 right-6 text-[11px] font-semibold uppercase tracking-[0.17em] text-white/70">— {quote.subject.name.split(' ')[0]}</p>
      </div>

      <div className="px-1 pt-4 sm:px-5 sm:pb-5">
        <div className="flex items-center gap-5">
          <button onClick={onLike} className={`flex items-center gap-2 text-sm font-medium transition-transform active:scale-90 ${quote.liked ? 'text-[#a75d50]' : ''}`} aria-label="Lik sitat">
            <Heart size={22} fill={quote.liked ? 'currentColor' : 'none'} />
            <span>{quote.likes}</span>
          </button>
          <button onClick={() => setCommentsOpen(!commentsOpen)} className="flex items-center gap-2 text-sm font-medium" aria-label="Vis kommentarer">
            <MessageCircle size={21} />
            <span>{quote.comments.length}</span>
          </button>
          <button className="ml-auto" aria-label="Del sitat"><Send size={20} /></button>
        </div>

        <p className="mt-3 text-xs text-black/50">Lagt ut av <span className="font-semibold text-black/75">@{quote.postedBy.username}</span></p>
        {quote.comments.length > 0 && !commentsOpen && (
          <button onClick={() => setCommentsOpen(true)} className="mt-2 text-xs text-black/45">Vis {quote.comments.length === 1 ? 'kommentaren' : `alle ${quote.comments.length} kommentarer`}</button>
        )}
        {commentsOpen && (
          <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
            {quote.comments.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 text-xs">
                <div className="mt-0.5"><Avatar user={item.author as User} size="sm" /></div>
                <p className="pt-1.5 leading-relaxed"><span className="mr-1.5 font-semibold">{item.author.username}</span>{item.text}</p>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={submitComment} className="mt-4 flex items-center gap-2 border-t border-black/5 pt-3">
          <Avatar user={currentUser} size="sm" />
          <input value={comment} onChange={(e) => setComment(e.target.value)} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs outline-none placeholder:text-black/35" placeholder="Skriv en kommentar …" />
          <button type="submit" disabled={!comment.trim()} className="text-xs font-semibold disabled:text-black/20">Publiser</button>
        </form>
      </div>
    </article>
  )
}

function Feed({ quotes, onLike, onComment, goFriends, requestCount }: { quotes: Quote[]; onLike: (id: string) => void; onComment: (id: string, text: string) => void; goFriends: () => void; requestCount: number }) {
  return (
    <>
      <MobileHeader onFriends={goFriends} requestCount={requestCount} />
      <main className="page-shell">
        <div className="mb-8 hidden items-end justify-between lg:flex">
          <div>
            <p className="eyebrow">Mandag, 13. juli</p>
            <h1 className="page-title">Siste nytt</h1>
          </div>
          <button onClick={goFriends} className="relative grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white">
            <Bell size={19} />
            {requestCount > 0 && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[#a75d50] ring-2 ring-[#f7f7f5]" />}
          </button>
        </div>
        <div className="mb-6 pt-5 lg:hidden">
          <p className="eyebrow">Fra vennene dine</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.04em]">Siste nytt</h1>
        </div>
        <div className="space-y-8 sm:space-y-7">
          {quotes.map((quote) => <QuoteCard key={quote.id} quote={quote} onLike={() => onLike(quote.id)} onComment={(text) => onComment(quote.id, text)} />)}
          {quotes.length === 0 && (
            <div className="rounded-[22px] border border-dashed border-black/15 bg-white/50 px-6 py-20 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-black text-white"><MessageCircle size={20} /></div>
              <h2 className="mt-5 text-base font-semibold">Feed-en din er helt ny</h2>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-black/45">Når du får venner og de legger ut sitater, dukker de opp her.</p>
              <button onClick={goFriends} className="mt-6 rounded-full border border-black/15 px-5 py-2.5 text-xs font-semibold">Finn venner</button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function CreateQuote({ onPublish, onCancel }: { onPublish: (text: string, friend: User, color: string) => void; onCancel: () => void }) {
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<User | null>(null)
  const [query, setQuery] = useState('')
  const [color, setColor] = useState(quoteColors[1])
  const matches = friends.filter((friend) => `${friend.name} ${friend.username}`.toLowerCase().includes(query.toLowerCase()))
  const canPublish = text.trim().length > 0 && selected

  return (
    <main className="page-shell-wide">
      <div className="flex items-center justify-between pt-5 lg:pt-0">
        <button onClick={onCancel} className="flex items-center gap-1 text-sm font-medium text-black/55"><ChevronLeft size={18} /> Avbryt</button>
        <p className="text-sm font-semibold lg:hidden">Nytt sitat</p>
        <button disabled={!canPublish} onClick={() => selected && onPublish(text.trim(), selected, color)} className="rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white transition disabled:bg-black/10 disabled:text-black/30">Publiser</button>
      </div>

      <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-14">
        <section>
          <p className="eyebrow">Nytt minne</p>
          <h1 className="page-title mt-1">Hva ble overhørt?</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-black/50">Skriv det akkurat som det ble sagt. Bare vennene til personen du velger kan se sitatet.</p>
          <div className="relative mt-8 grid min-h-[330px] place-items-center overflow-hidden rounded-[26px] px-8 py-14 shadow-card" style={{ backgroundColor: color }}>
            <span className="absolute left-6 top-3 font-display text-8xl text-white/15">“</span>
            <textarea autoFocus value={text} maxLength={180} onChange={(e) => setText(e.target.value)} placeholder="Skriv sitatet her …" className="relative z-10 h-40 w-full resize-none bg-transparent text-center font-display text-[31px] leading-tight text-white outline-none placeholder:text-white/45" />
            <span className="absolute bottom-5 right-6 text-[11px] font-medium text-white/55">{text.length}/180</span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="mr-1 text-xs font-medium text-black/45">Bakgrunn</span>
            {quoteColors.map((item) => (
              <button key={item} onClick={() => setColor(item)} className={`h-7 w-7 rounded-full transition ${color === item ? 'ring-2 ring-black ring-offset-2 ring-offset-[#f7f7f5]' : 'hover:scale-110'}`} style={{ backgroundColor: item }} aria-label={`Velg bakgrunnsfarge ${item}`} />
            ))}
          </div>
        </section>

        <section className="lg:pt-20">
          <h2 className="text-base font-semibold">Hvem sa det?</h2>
          <p className="mt-1 text-xs text-black/45">Du kan kun velge blant vennene dine.</p>
          <label className="mt-5 flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
            <Search size={17} className="text-black/35" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Søk blant venner" />
          </label>
          <div className="mt-3 max-h-[365px] space-y-1 overflow-auto">
            {matches.map((friend) => (
              <button key={friend.id} onClick={() => setSelected(friend)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selected?.id === friend.id ? 'bg-black text-white' : 'hover:bg-black/5'}`}>
                <Avatar user={friend} size="md" />
                <div>
                  <p className="text-sm font-semibold">{friend.name}</p>
                  <p className={`text-xs ${selected?.id === friend.id ? 'text-white/55' : 'text-black/40'}`}>@{friend.username}</p>
                </div>
                {selected?.id === friend.id && <Check size={18} className="ml-auto" />}
              </button>
            ))}
            {matches.length === 0 && (
              <div className="rounded-2xl border border-dashed border-black/10 px-5 py-10 text-center">
                <UsersRound size={20} className="mx-auto text-black/30" />
                <p className="mt-3 text-xs font-semibold">Ingen venner å velge enda</p>
                <p className="mt-1 text-[11px] leading-relaxed text-black/40">Godta en venneforespørsel før du legger ut et sitat.</p>
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-black/[0.035] px-4 py-3 text-xs leading-relaxed text-black/45">
            <LockKeyhole size={16} className="shrink-0" />
            Synlig for deg og vennene til {selected?.name.split(' ')[0] ?? 'personen'}.
          </div>
        </section>
      </div>
    </main>
  )
}

async function resizeProfileImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Velg en gyldig bildefil.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Bildet kan ikke være større enn 8 MB.')

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('Kunne ikke lese bildet.'))
      element.src = objectUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 320
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Nettleseren kunne ikke behandle bildet.')
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight)
    const sourceX = (image.naturalWidth - cropSize) / 2
    const sourceY = (image.naturalHeight - cropSize) / 2
    context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 320, 320)
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const body = document.body
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    }

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.style.paddingRight = previous.paddingRight
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}

function EditProfileModal({ onClose, onUpdated, showToast }: { onClose: () => void; onUpdated: (changes: Partial<User>) => void; showToast: (message: string) => void }) {
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email ?? '')
  const [bio, setBio] = useState(currentUser.bio)
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar)
  const [avatarData, setAvatarData] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [processingImage, setProcessingImage] = useState(false)
  const [error, setError] = useState('')
  const previewInitials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || currentUser.initials

  const chooseImage = async (file?: File) => {
    if (!file) return
    setProcessingImage(true)
    setError('')
    try {
      const resized = await resizeProfileImage(file)
      setAvatarData(resized)
      setAvatarPreview(`url(${resized}) center / cover`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kunne ikke behandle bildet.')
    } finally {
      setProcessingImage(false)
    }
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await api<{ id: string; name: string; email: string | null; username: string; bio: string; avatarUrl: string | null }>('/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), bio: bio.trim(), ...(avatarData ? { avatarUrl: avatarData } : {}) }),
      })
      const changes: Partial<User> = {
        name: updated.name,
        email: updated.email ?? undefined,
        bio: updated.bio,
        initials: updated.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
        ...(updated.avatarUrl ? { avatar: `url(${updated.avatarUrl}) center / cover` } : {}),
      }
      onUpdated(changes)
      showToast('Profilen er oppdatert')
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kunne ikke lagre profilen.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section className="my-6 w-full max-w-lg rounded-[26px] bg-white p-6 shadow-2xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div><p className="eyebrow">Innstillinger</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em]">Rediger profil</h2></div>
          <button onClick={onClose} className="icon-button" aria-label="Lukk"><X size={19} /></button>
        </div>
        <form onSubmit={save} className="mt-7 space-y-4">
          <div className="flex items-center gap-5 rounded-2xl bg-[#f7f7f5] p-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full text-lg font-semibold text-white" style={{ background: avatarPreview }}>{!avatarPreview.includes('url(') && previewInitials}</div>
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2.5 text-xs font-semibold text-white">
                <Camera size={15} /> {processingImage ? 'Behandler …' : 'Velg nytt bilde'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={processingImage} onChange={(event) => chooseImage(event.target.files?.[0])} />
              </label>
              <p className="mt-2 text-[10px] text-black/40">JPG, PNG eller WebP · maks 8 MB</p>
            </div>
          </div>
          <label className="profile-field"><span>Fullt navn</span><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required /></label>
          <label className="profile-field"><span>E-post <em>valgfritt</em></span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="deg@eksempel.no" /></label>
          <label className="profile-field"><span>Biografi <em>valgfritt</em></span><textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={120} rows={3} placeholder="Fortell litt om deg selv …" /><small>{bio.length}/120</small></label>
          <label className="profile-field opacity-60"><span>Brukernavn · kan ikke endres enda</span><input value={`@${currentUser.username}`} disabled /></label>
          <div aria-live="polite" className="min-h-5">{error && <p className="text-xs text-[#a75d50]">{error}</p>}</div>
          <div className="flex gap-3 pt-1"><button type="button" onClick={onClose} className="flex-1 rounded-full border border-black/15 py-3 text-xs font-semibold">Avbryt</button><button type="submit" disabled={saving || processingImage} className="flex-1 rounded-full bg-black py-3 text-xs font-semibold text-white disabled:bg-black/40">{saving ? 'Lagrer …' : 'Lagre endringer'}</button></div>
        </form>
      </section>
    </div>
  )
}

function Profile({ quotes, onDelete, onLike, onComment, showToast, onProfileUpdated }: { quotes: Quote[]; onDelete: (id: string) => void; onLike: (id: string) => void; onComment: (id: string, text: string) => void; showToast: (message: string) => void; onProfileUpdated: (changes: Partial<User>) => void }) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editing, setEditing] = useState(false)
  useBodyScrollLock(Boolean(selectedQuote) || editing)
  const ownQuotes = quotes.filter((quote) => quote.subject.id === currentUser.id)

  return (
    <>
      <MobileHeader title="Profil" onFriends={() => showToast('Ingen nye varsler')} requestCount={0} />
      <main className="page-shell-wide">
        <section className="pt-7 lg:pt-0">
          <div className="flex items-start gap-5 md:items-center md:gap-9">
            <Avatar user={currentUser} size="xl" ring />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{currentUser.name}</h1>
                <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/45">privat profil</span>
              </div>
              <p className="mt-1 text-sm text-black/45">@{currentUser.username}</p>
              <div className="mt-4 hidden items-center gap-8 text-sm sm:flex">
                <p><span className="font-semibold">{ownQuotes.length}</span> <span className="text-black/45">sitater</span></p>
                <p><span className="font-semibold">{currentUser.friendCount}</span> <span className="text-black/45">venner</span></p>
              </div>
            </div>
            <button className="hidden rounded-full border border-black/15 px-5 py-2.5 text-xs font-semibold sm:block" onClick={() => setEditing(true)}>Rediger profil</button>
            <button className="sm:hidden"><Menu size={22} /></button>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed">{currentUser.bio}</p>
          <div className="mt-5 flex items-center gap-8 border-y border-black/10 py-4 text-center text-sm sm:hidden">
            <p className="flex-1"><span className="block font-semibold">{ownQuotes.length}</span><span className="text-xs text-black/45">sitater</span></p>
            <p className="flex-1 border-l border-black/10"><span className="block font-semibold">{currentUser.friendCount}</span><span className="text-xs text-black/45">venner</span></p>
          </div>
          <div className="mt-5 flex gap-3 sm:hidden">
            <button className="flex-1 rounded-full bg-black py-3 text-xs font-semibold text-white" onClick={() => setEditing(true)}>Rediger profil</button>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-black/15"><UserRoundCheck size={17} /></button>
          </div>
        </section>

        <section className="mt-10 border-t border-black/10 pt-6 md:mt-14">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">Ting jeg har sagt</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Mine sitater</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-black/40"><LockKeyhole size={13} /> Kun venner</div>
          </div>
          {ownQuotes.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-4">
              {ownQuotes.map((quote) => (
                <button key={quote.id} onClick={() => setSelectedQuote(quote)} className="group relative aspect-square overflow-hidden rounded-xl p-4 text-left sm:rounded-2xl" style={{ backgroundColor: quote.color }}>
                  <p className="line-clamp-5 font-display text-lg leading-tight text-white sm:text-2xl">“{quote.text}”</p>
                  <div className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[10px] text-white/65">
                    <span>av @{quote.postedBy.username}</span><span className="flex items-center gap-1"><Heart size={11} />{quote.likes}</span>
                  </div>
                  <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100"><span className="rounded-full bg-white px-4 py-2 text-xs font-semibold">Åpne</span></div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/15 py-16 text-center"><p className="text-sm font-semibold">Ingen sitater enda</p><p className="mt-1 text-xs text-black/45">Vennene dine har visst vært diskrete.</p></div>
          )}
        </section>
      </main>

      {selectedQuote && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm" onMouseDown={() => setSelectedQuote(null)}>
          <div className="relative my-12 w-full max-w-xl" onMouseDown={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedQuote(null)} className="absolute -top-12 right-0 grid h-9 w-9 place-items-center rounded-full bg-white text-black"><X size={19} /></button>
            <QuoteCard quote={quotes.find((item) => item.id === selectedQuote.id) ?? selectedQuote} onLike={() => onLike(selectedQuote.id)} onDelete={() => { onDelete(selectedQuote.id); setSelectedQuote(null) }} onComment={(text) => onComment(selectedQuote.id, text)} />
          </div>
        </div>
      )}
      {editing && <EditProfileModal onClose={() => setEditing(false)} onUpdated={onProfileUpdated} showToast={showToast} />}
    </>
  )
}

interface UserSearchResult {
  id: string
  name: string
  username: string
  bio: string
  avatarUrl: string | null
  requestId: string | null
  relationshipStatus: 'none' | 'sent' | 'received' | 'friend'
}

interface ApiPublicUser {
  id: string
  name: string
  username: string
  bio: string
  avatarUrl: string | null
  friendCount?: number
}

type FriendRequestUser = User & { requestId: string }

const apiUserToUser = (user: ApiPublicUser): User => ({
  id: user.id,
  name: user.name,
  username: user.username,
  bio: user.bio,
  initials: user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
  avatar: user.avatarUrl ? `url(${user.avatarUrl}) center / cover` : 'linear-gradient(145deg, #354d69, #86a2be)',
  friendCount: user.friendCount ?? 0,
  isFriend: false,
})

function Friends({ requests, accepted, onAccept, onDecline }: { requests: FriendRequestUser[]; accepted: User[]; onAccept: (user: User, requestId: string) => Promise<void>; onDecline: (userId: string, requestId: string) => Promise<void> }) {
  const [friendQuery, setFriendQuery] = useState('')
  const [discoverQuery, setDiscoverQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const visibleFriends = accepted.filter((user) => user.name.toLowerCase().includes(friendQuery.toLowerCase()) || user.username.includes(friendQuery.toLowerCase()))

  useEffect(() => {
    const cleanQuery = discoverQuery.trim()
    if (cleanQuery.length < 2) {
      setResults([])
      setSearchError('')
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      setSearchError('')
      try {
        const users = await api<UserSearchResult[]>(`/users/search?query=${encodeURIComponent(cleanQuery)}`, { signal: controller.signal })
        setResults(users)
      } catch (error) {
        if (!controller.signal.aborted) setSearchError(error instanceof Error ? error.message : 'Kunne ikke søke etter brukere.')
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [discoverQuery])

  const sendRequest = async (userId: string) => {
    try {
      await api('/friend-requests', { method: 'POST', body: JSON.stringify({ toUserId: userId }) })
      setResults((items) => items.map((item) => item.id === userId ? { ...item, relationshipStatus: 'sent' } : item))
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Kunne ikke sende venneforespørselen.')
    }
  }

  const acceptSearchRequest = async (result: UserSearchResult) => {
    if (!result.requestId) return
    try {
      await onAccept(apiUserToUser(result), result.requestId)
      setResults((items) => items.map((item) => item.id === result.id ? { ...item, relationshipStatus: 'friend' } : item))
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Kunne ikke godta venneforespørselen.')
    }
  }

  return (
    <>
      <MobileHeader title="Venner" onFriends={() => undefined} requestCount={requests.length} />
      <main className="page-shell-wide">
        <div className="hidden lg:block"><p className="eyebrow">Ditt nettverk</p><h1 className="page-title">Venner</h1></div>
        <section className="pt-6 lg:pt-9">
          <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Venneforespørsler</h2>{requests.length > 0 && <span className="rounded-full bg-[#a75d50] px-2 py-0.5 text-[10px] font-bold text-white">{requests.length}</span>}</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {requests.length === 0 && <p className="rounded-2xl border border-dashed border-black/10 p-6 text-sm text-black/40">Du er helt ajour.</p>}
            {requests.map((user) => (
              <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
                <Avatar user={user} size="lg" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="text-xs text-black/40">@{user.username} · {user.friendCount} venner</p></div>
                <button onClick={() => onAccept(user, user.requestId)} className="grid h-9 w-9 place-items-center rounded-full bg-black text-white" aria-label="Godta"><Check size={16} /></button>
                <button onClick={() => onDecline(user.id, user.requestId)} className="grid h-9 w-9 place-items-center rounded-full border border-black/10" aria-label="Avslå"><X size={16} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-black/10 pt-7">
          <div>
            <p className="eyebrow">Oppdag</p>
            <h2 className="mt-1 text-lg font-semibold">Finn venner</h2>
            <p className="mt-1 text-xs text-black/45">Søk etter navn eller eksakt brukernavn.</p>
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3.5 focus-within:border-black">
            <Search size={18} className="text-black/35" />
            <input value={discoverQuery} onChange={(event) => setDiscoverQuery(event.target.value)} placeholder="Søk etter @brukernavn" className="w-full bg-transparent text-sm outline-none" />
            {searching && <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-black" />}
          </label>
          <div aria-live="polite" className="mt-3 min-h-5">{searchError && <p className="text-xs text-[#a75d50]">{searchError}</p>}</div>
          {discoverQuery.trim().length >= 2 && !searching && results.length === 0 && !searchError && (
            <p className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-xs text-black/40">Ingen brukere matcher søket.</p>
          )}
          <div className="mt-1 grid gap-2 md:grid-cols-2">
            {results.map((result) => {
              const user = apiUserToUser(result)
              return (
                <div key={result.id} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
                  <Avatar user={user} size="md" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{result.name}</p><p className="truncate text-xs text-black/40">@{result.username}</p></div>
                  {result.relationshipStatus === 'none' && <button onClick={() => sendRequest(result.id)} className="rounded-full bg-black px-4 py-2 text-[11px] font-semibold text-white">Legg til</button>}
                  {result.relationshipStatus === 'sent' && <span className="rounded-full bg-black/5 px-3 py-2 text-[10px] font-semibold text-black/40">Sendt</span>}
                  {result.relationshipStatus === 'received' && <button onClick={() => acceptSearchRequest(result)} className="rounded-full bg-black px-4 py-2 text-[11px] font-semibold text-white">Godta</button>}
                  {result.relationshipStatus === 'friend' && <span className="flex items-center gap-1 text-[10px] font-semibold text-black/40"><Check size={13} /> Venner</span>}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-10 border-t border-black/10 pt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-base font-semibold">Alle venner <span className="ml-1 text-black/35">{accepted.length}</span></h2><label className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5"><Search size={16} className="text-black/35"/><input value={friendQuery} onChange={(e) => setFriendQuery(e.target.value)} placeholder="Filtrer venner" className="w-full bg-transparent text-xs outline-none sm:w-40" /></label></div>
          <div className="mt-5 divide-y divide-black/5">
            {visibleFriends.map((user) => (
              <div key={user.id} className="flex items-center gap-3 py-4"><Avatar user={user} size="md"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-black/40">{user.bio}</p></div><button className="rounded-full border border-black/10 px-4 py-2 text-[11px] font-semibold">Se profil</button></div>
            ))}
            {visibleFriends.length === 0 && (
              <div className="py-14 text-center">
                <UsersRound size={22} className="mx-auto text-black/25" />
                <p className="mt-3 text-sm font-semibold">Ingen venner enda</p>
                <p className="mt-1 text-xs text-black/40">Søk etter noen du kjenner og send en forespørsel.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

function OverhortApp() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [quotes, setQuotes] = useState(initialQuotes)
  const [requests, setRequests] = useState<FriendRequestUser[]>(pendingRequests as FriendRequestUser[])
  const [acceptedFriends, setAcceptedFriends] = useState(friends)
  const [toast, setToast] = useState('')
  const [profileRevision, setProfileRevision] = useState(0)

  useEffect(() => {
    Promise.all([
      api<ApiPublicUser[]>('/friends'),
      api<(ApiPublicUser & { requestId: string })[]>('/friend-requests'),
      api<{ id: string; name: string; username: string; email: string | null; bio: string; avatarUrl: string | null }>('/me'),
    ]).then(([friendRows, requestRows, me]) => {
      setAcceptedFriends(friendRows.map((user) => ({ ...apiUserToUser(user), isFriend: true })))
      setRequests(requestRows.map((user) => ({ ...apiUserToUser(user), requestId: user.requestId })))
      const syncedProfile: Partial<User> = {
        id: me.id,
        name: me.name,
        username: me.username,
        email: me.email ?? undefined,
        bio: me.bio,
        initials: me.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
        ...(me.avatarUrl ? { avatar: `url(${me.avatarUrl}) center / cover` } : {}),
      }
      Object.assign(currentUser, syncedProfile)
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(currentUser))
      setProfileRevision((value) => value + 1)
    }).catch(() => {
      // Tomtilstandene beholdes dersom API-et er midlertidig utilgjengelig.
    })
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2500)
  }
  const like = (id: string) => setQuotes((items) => items.map((quote) => quote.id === id ? { ...quote, liked: !quote.liked, likes: quote.likes + (quote.liked ? -1 : 1) } : quote))
  const comment = (id: string, text: string) => setQuotes((items) => items.map((quote) => quote.id === id ? { ...quote, comments: [...quote.comments, { id: crypto.randomUUID(), author: currentUser, text }] } : quote))
  const publish = (text: string, subject: User, color: string) => {
    setQuotes((items) => [{ id: crypto.randomUUID(), text, subject, postedBy: currentUser, timestamp: 'akkurat nå', color, liked: false, likes: 0, comments: [] }, ...items])
    setActiveTab('feed')
    showToast(`Sitatet ble lagt på profilen til ${subject.name.split(' ')[0]}`)
  }
  const removeQuote = (id: string) => {
    setQuotes((items) => items.filter((quote) => quote.id !== id))
    showToast('Sitatet er slettet fra profilen din')
  }
  const content = useMemo(() => {
    if (activeTab === 'create') return <CreateQuote onPublish={publish} onCancel={() => setActiveTab('feed')} />
    if (activeTab === 'profile') return <Profile quotes={quotes} onDelete={removeQuote} onLike={like} onComment={comment} showToast={showToast} onProfileUpdated={(changes) => { Object.assign(currentUser, changes); localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(currentUser)); setProfileRevision((value) => value + 1) }} />
    if (activeTab === 'friends') return <Friends requests={requests} accepted={acceptedFriends} onAccept={async (user, requestId) => { await api(`/friend-requests/${requestId}`, { method: 'PATCH', body: JSON.stringify({ status: 'accepted' }) }); setRequests((items) => items.filter((item) => item.id !== user.id)); setAcceptedFriends((items) => [...items.filter((item) => item.id !== user.id), { ...user, isFriend: true }]); showToast(`Du og ${user.name.split(' ')[0]} er nå venner`) }} onDecline={async (userId, requestId) => { await api(`/friend-requests/${requestId}`, { method: 'PATCH', body: JSON.stringify({ status: 'declined' }) }); setRequests((items) => items.filter((item) => item.id !== userId)) }} />
    return <Feed quotes={quotes} onLike={like} onComment={comment} goFriends={() => setActiveTab('friends')} requestCount={requests.length} />
  }, [activeTab, quotes, requests, acceptedFriends, profileRevision])

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#101010]">
      <Nav active={activeTab} onChange={setActiveTab} requestCount={requests.length} />
      <div className="pb-24 lg:ml-[244px] lg:pb-0">{content}</div>
      {toast && <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-black px-5 py-3 text-center text-xs font-medium text-white shadow-xl lg:bottom-8 lg:ml-[122px]">{toast}</div>}
    </div>
  )
}

const DEMO_KEY = 'jegelskerpetra!'
const DEMO_ACCESS_SESSION_KEY = 'overhort_demo_access'
const AUTH_SESSION_KEY = 'overhort_authenticated'
const DEMO_PROFILE_STORAGE_KEY = 'overhort_demo_profile'

type DemoProfile = Pick<User, 'name' | 'username' | 'initials' | 'avatar' | 'bio'> & { id?: string; email?: string }

function AuthChoice({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f7f5] px-5 py-10 text-[#101010]">
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#a75d50]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#496f6b]/15 blur-3xl" />
      <section className="relative w-full max-w-[470px] rounded-[28px] border border-black/10 bg-white p-7 shadow-card sm:p-10">
        <div className="flex justify-center"><Wordmark /></div>
        <div className="mt-10 text-center">
          <p className="eyebrow">Demo-tilgang godkjent</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em]">Hvordan vil du fortsette?</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-black/50">Logg inn hvis du allerede har en konto, eller opprett en ny profil.</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button onClick={onLogin} className="group rounded-2xl border border-black/10 bg-[#f7f7f5] p-5 text-left transition hover:border-black hover:bg-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black text-white"><LogIn size={18} /></span>
            <span className="mt-5 block text-sm font-semibold">Logg inn</span>
            <span className="mt-1 block text-[11px] leading-relaxed text-black/45">Jeg har allerede en profil</span>
          </button>
          <button onClick={onRegister} className="group rounded-2xl bg-black p-5 text-left text-white transition hover:bg-black/80">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black"><UserPlus size={18} /></span>
            <span className="mt-5 block text-sm font-semibold">Opprett profil</span>
            <span className="mt-1 block text-[11px] leading-relaxed text-white/50">Jeg er ny på Overhørt</span>
          </button>
        </div>
      </section>
    </main>
  )
}

interface AuthUserResponse {
  id: string
  email: string | null
  username: string
  name: string
  bio: string
  avatarUrl: string | null
}

function LoginScreen({ onBack, onComplete }: { onBack: () => void; onComplete: (user: AuthUserResponse, token: string) => void }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await api<{ user: AuthUserResponse; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })
      onComplete(result.user, result.token)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kunne ikke logge inn.')
      setSubmitting(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f7f5] px-5 py-10 text-[#101010]">
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#76608a]/12 blur-3xl" />
      <section className="relative w-full max-w-[440px] rounded-[28px] border border-black/10 bg-white p-7 shadow-card sm:p-10">
        <div className="flex items-center justify-between"><button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-black/45"><ChevronLeft size={17} /> Tilbake</button><Wordmark /></div>
        <div className="mt-9"><p className="eyebrow">Velkommen tilbake</p><h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em]">Logg inn</h1><p className="mt-2 text-sm text-black/45">Bruk brukernavn eller e-post sammen med passordet ditt.</p></div>
        <form onSubmit={login} className="mt-7 space-y-4">
          <label className="profile-field"><span>Brukernavn eller e-post</span><input value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError('') }} autoComplete="username" autoFocus placeholder="@brukernavn" required /></label>
          <label className="profile-field"><span>Passord</span><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} autoComplete="current-password" placeholder="Passordet ditt" required /></label>
          <div aria-live="polite" className="min-h-5">{error && <p className="text-xs text-[#a75d50]">{error}</p>}</div>
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:bg-black/40">{submitting ? 'Logger inn …' : 'Logg inn'}</button>
        </form>
        <button onClick={onBack} className="mt-6 w-full text-center text-xs text-black/45">Har du ingen profil? <span className="font-semibold text-black">Opprett en</span></button>
      </section>
    </main>
  )
}

function ProfileSetup({ onComplete, onBack }: { onComplete: (profile: DemoProfile, credentials: { email?: string; password: string; avatarUrl?: string }) => Promise<void>; onBack: () => void }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('linear-gradient(145deg, #1d2530 0%, #64707c 100%)')
  const [avatarData, setAvatarData] = useState<string>()
  const [processingImage, setProcessingImage] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const avatarChoices = [
    'linear-gradient(145deg, #1d2530 0%, #64707c 100%)',
    'linear-gradient(145deg, #7a4d3d, #d6a584)',
    'linear-gradient(145deg, #314f43, #89a99b)',
    'linear-gradient(145deg, #523e69, #ad91c9)',
    'linear-gradient(145deg, #7c713c, #c8bd79)',
  ]
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'DU'

  const chooseProfileImage = async (file?: File) => {
    if (!file) return
    setProcessingImage(true)
    setError('')
    try {
      const resized = await resizeProfileImage(file)
      setAvatarData(resized)
      setAvatar(`url(${resized}) center / cover`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kunne ikke behandle bildet.')
    } finally {
      setProcessingImage(false)
    }
  }

  const createProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '')
    if (name.trim().length < 2) return setError('Skriv inn navnet ditt.')
    if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) return setError('Brukernavnet må ha 3–24 tegn og kan bare inneholde små bokstaver, tall og _.')
    if (password.length < 8) return setError('Passordet må inneholde minst 8 tegn.')

    setSubmitting(true)
    try {
      await onComplete({
        name: name.trim(),
        username: cleanUsername,
        initials,
        avatar,
        bio: bio.trim() || 'Ny på Overhørt.',
      }, { ...(email.trim() ? { email: email.trim().toLowerCase() } : {}), password, ...(avatarData ? { avatarUrl: avatarData } : {}) })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kunne ikke opprette profilen.')
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f5] px-5 py-8 text-[#101010] sm:py-12">
      <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-[#76608a]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#a17b3f]/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[720px]">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-black/45"><ChevronLeft size={17} /> Tilbake</button>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-black/35">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-white">1</span>
            <span className="h-px w-5 bg-black/15" />
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-white">2</span>
            Profil
          </div>
        </div>

        <section className="mt-9 rounded-[28px] border border-black/10 bg-white p-6 shadow-card sm:mt-12 sm:p-10">
          <div>
            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">Opprett profil</h1>
          </div>

          <form onSubmit={createProfile} className="mt-8 grid gap-8 md:grid-cols-[150px_1fr]">
            <div>
              <p className="text-xs font-semibold">Profilbilde</p>
              <div className="mt-4 grid h-24 w-24 place-items-center rounded-full text-xl font-semibold text-white ring-2 ring-black ring-offset-4 ring-offset-white" style={{ background: avatar }}>{!avatar.includes('url(') && initials}</div>
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-3.5 py-2.5 text-[11px] font-semibold text-white">
                <Camera size={14} /> {processingImage ? 'Behandler …' : 'Velg bilde'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={processingImage} onChange={(event) => chooseProfileImage(event.target.files?.[0])} />
              </label>
              <p className="mt-2 text-[9px] leading-relaxed text-black/35">JPG, PNG eller WebP · maks 8 MB</p>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35">Eller velg farge</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {avatarChoices.map((choice) => (
                  <button key={choice} type="button" onClick={() => { setAvatar(choice); setAvatarData(undefined) }} aria-label="Velg profilfarge" className={`h-7 w-7 rounded-full transition ${avatar === choice ? 'ring-2 ring-black ring-offset-2' : 'hover:scale-110'}`} style={{ background: choice }} />
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <label className="profile-field">
                <span>Fullt navn</span>
                <input value={name} onChange={(event) => { setName(event.target.value); setError('') }} autoFocus autoComplete="name" placeholder="Kari Nordmann" required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="profile-field">
                  <span>Brukernavn</span>
                  <div className="flex items-center"><span className="text-sm text-black/35">@</span><input value={username} onChange={(event) => { setUsername(event.target.value); setError('') }} autoComplete="username" placeholder="kari_nordmann" required /></div>
                </label>
                <label className="profile-field">
                  <span>E-post <em>valgfritt</em></span>
                  <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} autoComplete="email" placeholder="deg@eksempel.no" />
                </label>
              </div>
              <label className="profile-field">
                <span>Passord</span>
                <input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} autoComplete="new-password" placeholder="Minst 8 tegn" minLength={8} required />
              </label>
              <label className="profile-field">
                <span>Biografi <em>valgfritt</em></span>
                <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={120} placeholder="Fortell litt om deg selv …" rows={3} />
                <small>{bio.length}/120</small>
              </label>

              <div aria-live="polite" className="min-h-5">{error && <p className="text-xs text-[#a75d50]">{error}</p>}</div>
              <button type="submit" disabled={submitting || processingImage} className="w-full rounded-full bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-wait disabled:bg-black/50">{submitting ? 'Oppretter profil …' : 'Opprett profil'}</button>
              <p className="text-center text-[10px] leading-relaxed text-black/35">Passordet sendes kryptert til serveren og lagres kun som en sikker hash.</p>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const [hasAccess, setHasAccess] = useState(() => sessionStorage.getItem(DEMO_ACCESS_SESSION_KEY) === 'granted')
  const [hasProfile, setHasProfile] = useState(() => {
    const savedProfile = localStorage.getItem(DEMO_PROFILE_STORAGE_KEY)
    const token = localStorage.getItem('overhort_token')
    const authenticatedThisSession = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true'
    if (!savedProfile || !token || !authenticatedThisSession) return false
    try {
      Object.assign(currentUser, JSON.parse(savedProfile) as DemoProfile)
      return true
    } catch {
      localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY)
      return false
    }
  })
  const [demoKey, setDemoKey] = useState('')
  const [error, setError] = useState('')
  const [authMode, setAuthMode] = useState<'choice' | 'login' | 'register'>('choice')

  const unlockDemo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (demoKey !== DEMO_KEY) {
      setError('Det var ikke riktig demo-nøkkel. Prøv igjen.')
      return
    }

    sessionStorage.setItem(DEMO_ACCESS_SESSION_KEY, 'granted')
    setHasAccess(true)
  }

  if (hasAccess && !hasProfile) {
    if (authMode === 'choice') return <AuthChoice onLogin={() => setAuthMode('login')} onRegister={() => setAuthMode('register')} />

    if (authMode === 'login') return <LoginScreen onBack={() => setAuthMode('choice')} onComplete={(user, token) => {
      const storedProfile: DemoProfile = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email ?? undefined,
        bio: user.bio,
        initials: user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
        avatar: user.avatarUrl ? `url(${user.avatarUrl}) center / cover` : 'linear-gradient(145deg, #1d2530 0%, #64707c 100%)',
      }
      Object.assign(currentUser, storedProfile)
      localStorage.setItem('overhort_token', token)
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(storedProfile))
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
      setHasProfile(true)
    }} />

    return <ProfileSetup onBack={() => setAuthMode('choice')} onComplete={async (profile, credentials) => {
      const result = await api<{ user: { id: string }; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...credentials,
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
        }),
      })
      const storedProfile = { ...profile, id: result.user.id, email: credentials.email }
      Object.assign(currentUser, storedProfile)
      localStorage.setItem('overhort_token', result.token)
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(storedProfile))
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
      setHasProfile(true)
    }} />
  }

  if (hasAccess && hasProfile) return <OverhortApp />

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f7f5] px-5 py-10 text-[#101010]">
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#a75d50]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#496f6b]/15 blur-3xl" />

      <section className="relative w-full max-w-[430px] rounded-[28px] border border-black/10 bg-white p-7 shadow-card sm:p-10">
        <div className="flex justify-center">
          <Wordmark />
        </div>

        <div className="mx-auto mt-10 grid h-12 w-12 place-items-center rounded-full bg-black text-white">
          <KeyRound size={20} />
        </div>
        <div className="mt-5 text-center">
          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em]">Velkommen til demoen</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-black/50">Skriv inn demo-nøkkelen for å nå Overhørt.</p>
        </div>

        <form onSubmit={unlockDemo} className="mt-8">
          <div className={`mt-2 flex items-center rounded-xl border bg-[#f7f7f5] px-4 transition focus-within:border-black ${error ? 'border-[#a75d50]' : 'border-black/10'}`}>
            <KeyRound size={17} className="shrink-0 text-black/35" />
            <input
              id="demo-key"
              type="password"
              value={demoKey}
              onChange={(event) => { setDemoKey(event.target.value); setError('') }}
              autoComplete="off"
              autoFocus
              placeholder="Skriv inn nøkkelen"
              className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-black/30"
            />
          </div>
          <div aria-live="polite" className="min-h-7 pt-2">
            {error && <p className="text-xs text-[#a75d50]">{error}</p>}
          </div>
          <button type="submit" disabled={!demoKey} className="mt-2 w-full rounded-full bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/35">
            Åpne demo
          </button>
        </form>

        <p className="mt-7 text-center text-[10px] uppercase tracking-[0.14em] text-black/30">Kun for inviterte testere</p>
      </section>
    </main>
  )
}
