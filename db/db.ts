/*
<ai_context>
Initializes the database connection and schema for the app.
Updated to implement proper connection pooling to prevent "too many clients" errors.
</ai_context>
*/

import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { contactsTable } from '@/db/schema/contacts'
import { profilesTable } from '@/db/schema/profiles'

config({ path: '.env.local' })

const schema = {
  profiles: profilesTable,
  contacts: contactsTable,
}

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections from growing exponentially
// during API Route usage.
let cachedClient: ReturnType<typeof postgres> | undefined

function getClient() {
  if (cachedClient) return cachedClient

  const connectionString = process.env.DATABASE_URL!

  const options = {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  }

  cachedClient = postgres(connectionString, options)

  return cachedClient
}

const client = getClient()
export const db = drizzle(client, { schema })
