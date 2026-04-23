import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { unlink } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const asset = await prisma.contentAsset.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
  })

  if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

  return NextResponse.json(asset)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.contentAsset.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.category !== undefined) data.category = body.category
  if (body.tags !== undefined) data.tags = JSON.stringify(body.tags)
  if (body.content !== undefined) data.content = body.content

  const asset = await prisma.contentAsset.update({
    where: { id },
    data,
  })

  return NextResponse.json(asset)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const asset = await prisma.contentAsset.findUnique({ where: { id } })
  if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

  if (asset.filePath) {
    try {
      const fullPath = path.join(process.cwd(), 'public', asset.filePath)
      await unlink(fullPath)
    } catch {
      // File may not exist, continue with deletion
    }
  }

  await prisma.contentAsset.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
