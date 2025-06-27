/*
<ai_context>
Contains server actions related to profiles in the DB.
Updated: Removed unused profile actions (updateProfileAction and deleteProfileAction)
</ai_context>
*/

'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { InsertProfile, profilesTable, SelectProfile } from '@/db/schema/profiles'
import { ActionState } from '@/lib//types/server-action'

export async function createProfile(data: InsertProfile): Promise<ActionState<SelectProfile>> {
  try {
    const [newProfile] = await db.insert(profilesTable).values(data).returning()

    return {
      isSuccess: true,
      message: 'Profile created successfully',
      data: newProfile,
    }
  } catch (error) {
    console.error('Error creating profile:', error)

    return { isSuccess: false, message: 'Failed to create profile' }
  }
}

export async function getProfileByUserId(userId: string): Promise<ActionState<SelectProfile>> {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId),
    })

    if (!profile) {
      return { isSuccess: false, message: 'Profile not found' }
    }

    return {
      isSuccess: true,
      message: 'Profile retrieved successfully',
      data: profile,
    }
  } catch (error) {
    console.error('Error getting profile by user id', error)

    return { isSuccess: false, message: 'Failed to get profile' }
  }
}
