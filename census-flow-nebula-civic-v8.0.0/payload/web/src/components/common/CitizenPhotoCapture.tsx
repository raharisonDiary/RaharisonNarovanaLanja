import { Camera, ImagePlus, RefreshCw, Trash2, VideoOff, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

interface PhotoLabels {
  empty: string
  take: string
  import: string
  retake: string
  remove: string
  cancel: string
  capture: string
  help: string
  cameraUnavailable: string
  cameraStarting: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  onError: (message: string) => void
  labels: PhotoLabels
}

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  if (!file.type.startsWith('image/')) {
    reject(new Error('Le fichier sélectionné n’est pas une image.'))
    return
  }

  const reader = new FileReader()
  reader.onerror = () => reject(new Error('Lecture de la photo impossible.'))
  reader.onload = () => {
    const image = new Image()
    image.onerror = () => reject(new Error('Photo invalide.'))
    image.onload = () => {
      const maximum = 1_080
      const ratio = Math.min(1, maximum / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * ratio))
      canvas.height = Math.max(1, Math.round(image.height * ratio))
      const context = canvas.getContext('2d')

      if (!context) {
        reject(new Error('Compression de la photo impossible.'))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.78))
    }
    image.src = String(reader.result)
  }
  reader.readAsDataURL(file)
})

export default function CitizenPhotoCapture({ value, onChange, onError, labels }: Props) {
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const deviceCameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStarting, setCameraStarting] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const closeCamera = () => {
    stopCamera()
    setCameraOpen(false)
    setCameraStarting(false)
    setCameraError('')
  }

  useEffect(() => () => stopCamera(), [])

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      void videoRef.current.play().catch(() => undefined)
    }
  }, [cameraOpen, cameraStarting])

  const handleFile = (file?: File) => {
    if (!file) return
    void fileToDataUrl(file)
      .then((photo) => {
        onChange(photo)
        if (cameraOpen) closeCamera()
      })
      .catch((failure: Error) => onError(failure.message))
  }

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      deviceCameraInputRef.current?.click()
      return
    }

    setCameraOpen(true)
    setCameraStarting(true)
    setCameraError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraStarting(false)
    } catch {
      closeCamera()
      deviceCameraInputRef.current?.click()
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError(labels.cameraUnavailable)
      return
    }

    const maximum = 1_080
    const ratio = Math.min(1, maximum / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(video.videoWidth * ratio))
    canvas.height = Math.max(1, Math.round(video.videoHeight * ratio))
    const context = canvas.getContext('2d')

    if (!context) {
      setCameraError(labels.cameraUnavailable)
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    onChange(canvas.toDataURL('image/jpeg', 0.8))
    closeCamera()
  }

  return (
    <div className="citizen-photo-capture">
      <div className={`citizen-photo-preview ${value ? 'has-photo' : ''}`}>
        {value ? (
          <img src={value} alt={labels.empty} />
        ) : (
          <div className="citizen-photo-placeholder">
            <span><Camera size={34} /></span>
            <strong>{labels.empty}</strong>
            <small>{labels.help}</small>
          </div>
        )}

        {value && (
          <button type="button" className="citizen-photo-remove" onClick={() => onChange('')} aria-label={labels.remove} title={labels.remove}>
            <Trash2 size={17} />
          </button>
        )}
      </div>

      <div className="citizen-photo-actions">
        <button type="button" className="photo-source photo-source--camera" onClick={() => void openCamera()}>
          {value ? <RefreshCw size={19} /> : <Camera size={19} />}
          <span><strong>{value ? labels.retake : labels.take}</strong><small>{labels.capture}</small></span>
        </button>
        <button type="button" className="photo-source" onClick={() => galleryInputRef.current?.click()}>
          <ImagePlus size={19} />
          <span><strong>{labels.import}</strong><small>JPG, PNG ou WEBP</small></span>
        </button>
      </div>

      <input ref={galleryInputRef} hidden type="file" accept="image/*" onChange={(event) => { handleFile(event.target.files?.[0]); event.currentTarget.value = '' }} />
      <input ref={deviceCameraInputRef} hidden type="file" accept="image/*" capture="user" onChange={(event) => { handleFile(event.target.files?.[0]); event.currentTarget.value = '' }} />

      {cameraOpen && createPortal(
        <div className="camera-capture-backdrop fade-in" role="presentation">
          <section className="camera-capture-panel scale-in" role="dialog" aria-modal="true">
            <header>
              <div><strong>{labels.take}</strong><small>{labels.help}</small></div>
              <button type="button" className="icon-button" onClick={closeCamera} aria-label={labels.cancel}><X size={20} /></button>
            </header>
            <div className="camera-capture-stage">
              {cameraStarting && <div className="camera-capture-message"><Camera size={30} /><span>{labels.cameraStarting}</span></div>}
              {cameraError && <div className="camera-capture-message camera-capture-message--error"><VideoOff size={30} /><span>{cameraError}</span></div>}
              <video ref={videoRef} muted playsInline autoPlay />
              <span className="camera-face-guide" aria-hidden="true" />
            </div>
            <footer>
              <button type="button" className="button button--secondary" onClick={closeCamera}>{labels.cancel}</button>
              <button type="button" className="camera-shutter" onClick={capture} disabled={cameraStarting} aria-label={labels.capture}><span /></button>
              <button type="button" className="button button--secondary" onClick={() => galleryInputRef.current?.click()}>{labels.import}</button>
            </footer>
          </section>
        </div>,
        document.body,
      )}
    </div>
  )
}
