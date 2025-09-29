import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getStorageAdapter } from '@/lib/storage'
import { IUserProfile } from '@/lib/models/User'

export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storage = await getStorageAdapter()
    let user = await storage.getUserProfile(userId)

    if (!user) {
      // Create a new user profile
      const newUser = {
        userId,
        email: '', // Will be updated from Clerk
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await storage.saveUserProfile(userId, newUser)
      return NextResponse.json(newUser)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch user profile',
        fallback: true
      },
      { status: 200 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    const storage = await getStorageAdapter()
    const success = await storage.saveUserProfile(userId, {
      ...updates,
      updatedAt: new Date()
    })

    if (!success) {
      return NextResponse.json(
        {
          error: 'Failed to update user profile',
          fallback: true
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      {
        error: 'Failed to update user profile',
        fallback: true,
        message: 'Profile saved locally only'
      },
      { status: 200 }
    )
  }
}