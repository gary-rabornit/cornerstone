import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (category) where.category = category
  if (search) {
    where.name = { contains: search }
  }

  const assets = await prisma.contentAsset.findMany({
    where,
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(assets)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const category = formData.get('category') as string | null
    const tags = formData.get('tags') as string | null

    if (!file || !name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const uniqueName = `${uuidv4()}${ext}`
    const filePath = path.join(uploadDir, uniqueName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Convert comma-separated tags to a JSON array
    const tagsArray = tags
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const asset = await prisma.contentAsset.create({
      data: {
        name,
        type,
        category: category || null,
        tags: JSON.stringify(tagsArray),
        filePath: `/uploads/${uniqueName}`,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: session.user.id!,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } else {
    const body = await request.json()
    const { name, type, category, tags, content } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Accept tags as array or comma-separated string, always store as JSON array string
    let tagsJson = '[]'
    if (Array.isArray(tags)) {
      tagsJson = JSON.stringify(tags.map((t: string) => String(t).trim()).filter(Boolean))
    } else if (typeof tags === 'string' && tags.trim()) {
      const arr = tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      tagsJson = JSON.stringify(arr)
    }

    const asset = await prisma.contentAsset.create({
      data: {
        name,
        type,
        category: category || null,
        tags: tagsJson,
        content: content || null,
        uploadedById: session.user.id!,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  }
}
