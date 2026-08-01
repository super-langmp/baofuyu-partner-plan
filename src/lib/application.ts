import { createClient } from '@supabase/supabase-js'
import type { ApplicationInput, ApplicationResult } from '../types'
import { demoStore } from './demoStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const dataMode = import.meta.env.VITE_DATA_MODE as string | undefined
const supabase =
  dataMode === 'supabase' && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

function createLocalApplication(input: ApplicationInput): ApplicationResult {
  const application = demoStore.createApplication(input)
  return { id: application.id, mode: 'demo' }
}

export async function submitApplication(input: ApplicationInput): Promise<ApplicationResult> {
  if (!supabase) return createLocalApplication(input)

  const { data, error } = await supabase.rpc('submit_application', {
    p_real_name: input.realName.trim(),
    p_phone: input.phone.trim(),
    p_platform: input.platform,
    p_profile_url: input.profileUrl.trim(),
    p_invite_code: input.inviteCode.trim().toUpperCase() || null,
    p_source: input.source,
  })

  if (error) throw new Error(error.message)
  return { id: String(data), mode: 'cloud' }
}
