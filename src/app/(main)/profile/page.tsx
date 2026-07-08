// src/app/(main)/profile/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ProfilePage as ProfileView } from '@/components/profile/ProfilePage'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return <ProfileView />
}
