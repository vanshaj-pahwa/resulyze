import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { connectToDB } from '@/lib/mongodb'
import { UserProfile } from '@/lib/models/User'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type
  const { id, email_addresses, first_name, last_name } = evt.data

  try {
    // Try to use MongoDB, but don't fail if it's not available
    try {
      await connectToDB()

      if (eventType === 'user.created') {
        const newUser = new UserProfile({
          userId: id,
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          createdAt: new Date(),
          updatedAt: new Date()
        })

        await newUser.save()
        console.log('User created:', id)
      }

      if (eventType === 'user.updated') {
        await UserProfile.findOneAndUpdate(
          { userId: id },
          {
            email: email_addresses[0]?.email_address || '',
            firstName: first_name || '',
            lastName: last_name || '',
            updatedAt: new Date()
          },
          { upsert: true }
        )
        console.log('User updated:', id)
      }

      if (eventType === 'user.deleted') {
        await UserProfile.findOneAndDelete({ userId: id })
        console.log('User deleted:', id)
      }
    } catch (dbError) {
      console.warn('MongoDB not available for webhook, user data will be created on first app use:', dbError)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    // Still return success to avoid webhook retries
    return NextResponse.json({ received: true, warning: 'Processed with fallback' })
  }
}