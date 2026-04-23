import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ContentLibraryClient } from '@/components/library/content-library-client'

export default async function ContentLibraryPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const assets = await prisma.contentAsset.findMany({
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = assets.map(asset => ({
    ...asset,
    tags: JSON.parse(asset.tags || '[]') as string[],
    createdAt: asset.createdAt.toISOString(),
  }))

  return (
    <div>
      <ContentLibraryClient assets={serialized} />
    </div>
  )
}
