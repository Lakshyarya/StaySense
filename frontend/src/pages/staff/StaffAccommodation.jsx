import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Image, AlertTriangle } from 'lucide-react'
import StaffLayout from '../../components/staff/StaffLayout'
import { Button, Input, toast } from '../../components/ui'
import { DEFAULT_ROOMS } from '../Home'

const ROOMS_KEY = 'stay-sense-rooms'

const BLANK_FORM = {
  title: '', description: '', price: '', capacity_adults: '2',
  capacity_children: '0', bed_config: '', status: 'available',
  amenities: '', images: ['', '', '', '', ''],
}

/* Load rooms from localStorage, seed with defaults on first run */
function loadRooms() {
  try {
    const stored = localStorage.getItem(ROOMS_KEY)
    const parsed = stored ? JSON.parse(stored) : null
    if (parsed && parsed.length) return parsed
    /* Seed defaults */
    const seed = DEFAULT_ROOMS.map(r => ({ ...r, images: r.images ?? [r.image ?? ''] }))
    localStorage.setItem(ROOMS_KEY, JSON.stringify(seed))
    return seed
  } catch { return DEFAULT_ROOMS }
}

function saveRooms(rooms) {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
}

/* Mini carousel for the Accommodation cards */
function MiniCarousel({ images = [] }) {
  const imgs = images.filter(Boolean)
  const [idx, setIdx] = useState(0)
  if (!imgs.length) return (
    <div className="w-full h-44 rounded-xl bg-gray-100 dark:bg-void-card flex items-center justify-center">
      <Image className="w-8 h-8 text-gray-300 dark:text-void-muted" />
    </div>
  )
  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-void-card h-44 select-none">
      <img src={imgs[idx]} alt="" className="w-full h-full object-cover" />
      {imgs.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length) }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length) }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white">
            <ChevronRight className="w-3 h-3" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <span key={i} className={`block w-1 h-1 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* Add / Edit Room Modal */
function RoomModal({ isOpen, onClose, onSave, editRoom }) {
  const [form, setForm]     = useState(BLANK_FORM)
  const [errors, setErrors] = useState({})
  const modalRef = useRef(null)

  /* Pre-fill when editing */
  useEffect(() => {
    if (!isOpen) return
    if (editRoom) {
      setForm({
        title:            editRoom.title ?? editRoom.name ?? '',
        description:      editRoom.description ?? '',
        price:            String(editRoom.price ?? editRoom.price_per_night ?? ''),
        capacity_adults:  String(editRoom.capacity_adults ?? editRoom.capacity?.split(' ')[0] ?? '2'),
        capacity_children:String(editRoom.capacity_children ?? '0'),
        bed_config:       editRoom.bedConfig ?? editRoom.bed_config ?? '',
        status:           editRoom.status ?? 'available',
        amenities:        (editRoom.amenities ?? []).join(', '),
        images:           [...(editRoom.images ?? [editRoom.image ?? '']).slice(0, 5), '', '', '', '', ''].slice(0, 5),
      })
    } else {
      setForm(BLANK_FORM)
    }
    setErrors({})
  }, [isOpen, editRoom])

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }))
  }
  const setImg = idx => e => {
    const imgs = [...form.images]; imgs[idx] = e.target.value
    setForm(f => ({ ...f, images: imgs }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Room name is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Enter a valid price per night.'
    if (!form.bed_config.trim()) e.bed_config = 'Bed configuration is required.'
    return e
  }

  const handleSave = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const room = {
      id:               editRoom?.id ?? `room-${Date.now()}`,
      title:            form.title.trim(),
      name:             form.title.trim(),
      description:      form.description.trim(),
      price:            Number(form.price),
      price_per_night:  Number(form.price),
      capacity_adults:  Number(form.capacity_adults),
      capacity_children:Number(form.capacity_children),
      capacity:         `${form.capacity_adults} Adults${form.capacity_children !== '0' ? `, ${form.capacity_children} Children` : ''}`,
      bed_config:       form.bed_config.trim(),
      bedConfig:        form.bed_config.trim(),
      status:           form.status,
      amenities:        form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      images:           form.images.filter(Boolean),
      image:            form.images.find(Boolean) ?? '',
    }
    onSave(room)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div ref={modalRef}
        className="relative w-full sm:max-w-xl bg-white dark:bg-void-surface
                   rounded-t-2xl sm:rounded-2xl shadow-2xl
                   max-h-[92vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-void-border flex-shrink-0">
          <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">
            {editRoom ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-void-card transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4">
          <Input label="Room Name" value={form.title} onChange={set('title')} error={errors.title}
            placeholder="e.g. Deluxe Hill View Room" required />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              placeholder="Describe the room — views, feel, unique features..."
              className={`w-full rounded-xl border px-4 py-3 text-sm resize-none
                         bg-white dark:bg-void-card text-gray-900 dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-gray-600
                         focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400
                         transition-all duration-200
                         ${errors.description ? 'border-red-400' : 'border-gray-200 dark:border-void-border'}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price / Night (₹)" type="number" value={form.price} onChange={set('price')}
              error={errors.price} placeholder="4500" required />
            <Input label="Bed Configuration" value={form.bed_config} onChange={set('bed_config')}
              error={errors.bed_config} placeholder="1 King Bed" required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Max Adults"   type="number" value={form.capacity_adults}   onChange={set('capacity_adults')}   min="1" />
            <Input label="Max Children" type="number" value={form.capacity_children} onChange={set('capacity_children')} min="0" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select value={form.status} onChange={set('status')}
                className="w-full rounded-xl border border-gray-200 dark:border-void-border
                           bg-white dark:bg-void-card text-gray-900 dark:text-white
                           px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/25">
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          </div>

          <Input label="Amenities (comma-separated)" value={form.amenities} onChange={set('amenities')}
            placeholder="Hill View, Hot Water, Attached Bath, Balcony" />

          {/* Photo URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo URLs <span className="text-gray-400 font-normal">(up to 5 — paste Unsplash or any direct image URL)</span>
            </label>
            <div className="space-y-2">
              {form.images.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-void-muted w-4 flex-shrink-0">{i + 1}</span>
                  <input
                    type="url"
                    value={url}
                    onChange={setImg(i)}
                    placeholder={`Photo ${i + 1} URL`}
                    className="flex-1 rounded-xl border border-gray-200 dark:border-void-border
                               bg-white dark:bg-void-card text-gray-900 dark:text-white text-sm
                               px-3 py-2.5 placeholder:text-gray-400 dark:placeholder:text-gray-600
                               focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                               transition-all duration-200"
                  />
                  {url && (
                    <img src={url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-void-border"
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-void-muted mt-2">
              Tip: Right-click any image online → "Copy image address" and paste here.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-void-border flex-shrink-0">
          <Button variant="primary" fullWidth onClick={handleSave} className="!rounded-xl">
            {editRoom ? 'Save Changes' : 'Publish Room'}
          </Button>
          <Button variant="outline" onClick={onClose} className="!rounded-xl">Cancel</Button>
        </div>
      </div>
    </div>
  )
}

/* Delete confirm modal */
function DeleteConfirm({ room, onConfirm, onCancel }) {
  if (!room) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-void-surface rounded-2xl shadow-2xl p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">Delete room?</h3>
            <p className="text-sm text-gray-500 dark:text-void-muted">{room.title ?? room.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          This will remove the room from both the staff panel and the public site. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" fullWidth onClick={onConfirm} className="!rounded-xl">Delete Room</Button>
          <Button variant="outline" fullWidth onClick={onCancel} className="!rounded-xl">Cancel</Button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function StaffAccommodation() {
  const [rooms,      setRooms]      = useState(loadRooms)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editRoom,   setEditRoom]   = useState(null)
  const [deleteRoom, setDeleteRoom] = useState(null)
  const [activeTab,  setActiveTab]  = useState('featured')

  const persist = (updated) => {
    setRooms(updated)
    saveRooms(updated)
  }

  const handleSave = (room) => {
    let updated
    if (editRoom) {
      updated = rooms.map(r => r.id === room.id ? room : r)
      toast.success('Room updated successfully.')
    } else {
      updated = [...rooms, room]
      toast.success('Room published to the site.')
    }
    persist(updated)
    setModalOpen(false)
    setEditRoom(null)
    setActiveTab('featured')
  }

  const handleDelete = () => {
    const updated = rooms.filter(r => r.id !== deleteRoom.id)
    persist(updated)
    setDeleteRoom(null)
    toast.success('Room removed.')
  }

  const openEdit = (room) => {
    setEditRoom(room)
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditRoom(null)
    setModalOpen(true)
  }

  return (
    <StaffLayout title="Accommodation">
      <div className="p-6 sm:p-8">

        {/* Tab bar + Add button */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex rounded-xl bg-gray-100 dark:bg-void-card p-1 gap-1">
            {[{ id: 'featured', label: 'Featured Rooms' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150
                            ${activeTab === tab.id
                              ? 'bg-white dark:bg-void-surface text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-void-muted hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <Button variant="primary" onClick={openAdd} className="!rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </div>

        {/* Room grid */}
        {rooms.length === 0 ? (
          <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border
                          p-12 text-center">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">No rooms yet</p>
            <p className="text-sm text-gray-500 dark:text-void-muted mb-5">
              Add your first room to have it appear on the public site.
            </p>
            <Button variant="primary" onClick={openAdd} className="!rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add First Room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {rooms.map(room => (
              <div key={room.id}
                className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border overflow-hidden
                           hover:shadow-md transition-shadow">
                <MiniCarousel images={room.images ?? (room.image ? [room.image] : [])} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-semibold text-gray-900 dark:text-white text-base leading-snug">
                      {room.title ?? room.name}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5
                                      ${room.status === 'available' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : room.status === 'limited' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-void-muted mb-3 line-clamp-2">
                    {room.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      ₹{(room.price ?? room.price_per_night)?.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-gray-400 ml-0.5">/night</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(room)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 dark:hover:text-cyan
                                   hover:bg-primary-50 dark:hover:bg-cyan/10 transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteRoom(room)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500
                                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RoomModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditRoom(null) }}
        onSave={handleSave} editRoom={editRoom} />
      <DeleteConfirm room={deleteRoom} onConfirm={handleDelete} onCancel={() => setDeleteRoom(null)} />
    </StaffLayout>
  )
}
