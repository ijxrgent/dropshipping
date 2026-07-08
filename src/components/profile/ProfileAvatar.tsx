'use client'

import { Camera } from 'lucide-react'

interface ProfileAvatarProps {
  avatarUrl: string | null
  name: string
  initials: string
  onAvatarUpload: (url: string) => void
}

export function ProfileAvatar({
  avatarUrl,
  name,
  initials,
  onAvatarUpload,
}: ProfileAvatarProps) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      )
      formData.append('folder', 'modaguajira/avatars')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) onAvatarUpload(data.secure_url)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="relative flex-shrink-0">
      <div className="w-16 h-16 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-lg font-bold">{initials}</span>
        )}
      </div>
      <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
        <Camera size={12} color="white" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  )
}
