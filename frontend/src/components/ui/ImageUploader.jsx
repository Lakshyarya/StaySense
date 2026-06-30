/**
 * ImageUploader
 * Drag-and-drop + file browse image uploader.
 * Compresses images to ≤800×600 JPEG before storing as base64.
 *
 * Props:
 *   images   — string[]  — current base64/URL array (controlled)
 *   onChange — (string[]) => void
 *   min      — number (default 1)
 *   max      — number (default 5)
 */
import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

async function compress(file, maxW = 800, maxH = 600, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        let { width: w, height: h } = img
        const ratio = Math.min(maxW / w, maxH / h, 1)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ImageUploader({ images = [], onChange, min = 1, max = 5 }) {
  const [dragging,    setDragging]    = useState(false)
  const [processing,  setProcessing]  = useState(false)
  const inputRef = useRef(null)

  const addFiles = useCallback(async (files) => {
    const valid = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, max - images.length)
    if (!valid.length) return
    setProcessing(true)
    try {
      const compressed = await Promise.all(valid.map(f => compress(f)))
      onChange([...images, ...compressed].slice(0, max))
    } finally {
      setProcessing(false)
    }
  }, [images, max, onChange])

  const onDrop       = useCallback(e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }, [addFiles])
  const onDragOver   = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave  = () => setDragging(false)
  const onFileChange = e => { addFiles(e.target.files); e.target.value = '' }
  const remove       = idx => onChange(images.filter((_, i) => i !== idx))

  const canAdd = images.length < max && !processing

  return (
    <div className="space-y-3">
      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden
                                    bg-gray-100 dark:bg-void-card group">
              <img src={src} alt={`Room photo ${i + 1}`}
                className="w-full h-full object-cover" />
              {/* Cover label */}
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-semibold
                                 bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60
                           hover:bg-black/80 text-white flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add-more tile */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed
                         border-gray-200 dark:border-void-border
                         flex flex-col items-center justify-center gap-1
                         text-gray-400 dark:text-void-muted
                         hover:border-primary-400 dark:hover:border-cyan/50
                         hover:text-primary-500 dark:hover:text-cyan
                         transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-[10px] font-medium">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone — shown when 0 images OR as a secondary target */}
      {canAdd && (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative border-2 border-dashed rounded-xl text-center
                      transition-all duration-200 select-none
                      ${images.length === 0 ? 'py-10 cursor-pointer' : 'py-5'}
                      ${dragging
                        ? 'border-primary-400 dark:border-cyan bg-primary-50 dark:bg-cyan/5'
                        : 'border-gray-200 dark:border-void-border hover:border-gray-300 dark:hover:border-void-muted'
                      }
                      ${processing ? 'pointer-events-none opacity-60' : ''}`}
          onClick={() => images.length === 0 && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors
                             ${dragging
                               ? 'bg-primary-100 dark:bg-cyan/10 text-primary-500 dark:text-cyan'
                               : 'bg-gray-100 dark:bg-void-card text-gray-400 dark:text-void-muted'}`}>
              {processing
                ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Upload className="w-5 h-5" />
              }
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {processing ? 'Compressing images…'
                  : dragging ? 'Drop to upload'
                  : 'Drag & drop photos here'}
              </p>
              <p className="text-xs text-gray-400 dark:text-void-muted mt-0.5">
                {images.length > 0
                  ? `${max - images.length} more photo${max - images.length !== 1 ? 's' : ''} allowed`
                  : `Up to ${max} photos · JPG, PNG, WebP`}
              </p>
            </div>
          </div>

          {/* Browse button — pointer-events-auto so it works inside the non-clickable parent */}
          {!processing && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              className="pointer-events-auto mt-3 text-xs font-semibold
                         text-primary-500 dark:text-cyan hover:underline"
            >
              Browse files
            </button>
          )}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Counter + validation hint */}
      <div className="flex items-center justify-between text-[11px]">
        <span className={`font-medium ${images.length === 0 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-void-muted'}`}>
          {images.length === 0
            ? `At least ${min} photo required`
            : `${images.length} of ${max} photo${max !== 1 ? 's' : ''} added`}
        </span>
        {images.length > 0 && (
          <span className="text-gray-400 dark:text-void-muted">First photo is the cover image</span>
        )}
      </div>
    </div>
  )
}
