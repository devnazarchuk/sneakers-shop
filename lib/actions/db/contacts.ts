'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { contactsTable, InsertContact, SelectContact } from '@/db/schema/contacts'
import { ActionState } from '@/lib/types/server-action'

export async function createContact(contact: InsertContact): Promise<ActionState<SelectContact>> {
  try {
    const [newContact] = await db.insert(contactsTable).values(contact).returning()

    return {
      isSuccess: true,
      message: 'Contact created successfully',
      data: newContact,
    }
  } catch (error) {
    console.error('Error creating contact:', error)

    return { isSuccess: false, message: 'Failed to create contact' }
  }
}

export async function getContacts(userId: string): Promise<ActionState<SelectContact[]>> {
  try {
    const contacts = await db.query.contacts.findMany({
      where: eq(contactsTable.userId, userId),
    })

    return {
      isSuccess: true,
      message: 'Contacts retrieved successfully',
      data: contacts,
    }
  } catch (error) {
    console.error('Error getting contacts:', error)

    return { isSuccess: false, message: 'Failed to get contacts' }
  }
}

export async function updateContact(
  id: string,
  data: Partial<InsertContact>,
): Promise<ActionState<SelectContact>> {
  try {
    const [updatedContact] = await db
      .update(contactsTable)
      .set(data)
      .where(eq(contactsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: 'Contact updated successfully',
      data: updatedContact,
    }
  } catch (error) {
    console.error('Error updating contact:', error)

    return { isSuccess: false, message: 'Failed to update contact' }
  }
}

export async function deleteContact(id: string): Promise<ActionState<void>> {
  try {
    await db.delete(contactsTable).where(eq(contactsTable.id, id))

    return {
      isSuccess: true,
      message: 'Contact deleted successfully',
      data: undefined,
    }
  } catch (error) {
    console.error('Error deleting contact:', error)

    return { isSuccess: false, message: 'Failed to delete contact' }
  }
}
