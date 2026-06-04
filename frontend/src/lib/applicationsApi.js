import { supabase, isSupabaseConfigured } from './supabase'

// All four functions are no-ops (returning a `skipped` flag) if Supabase isn't
// configured, so the demo UI keeps working with in-memory state.

export async function listApplications(userId) {
  if (!isSupabaseConfigured || !userId) return []
  const { data, error } = await supabase
    .from('applications')
    .select('*, scholarship:scholarships(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) {
    console.warn('listApplications:', error.message)
    return []
  }
  return data || []
}

// Save a scholarship into the user's tracker as `saved`. Uses upsert so
// clicking Apply twice doesn't error or duplicate.
export async function saveApplication(userId, scholarshipId, matchScore) {
  if (!isSupabaseConfigured || !userId) return { skipped: true }
  const { data, error } = await supabase
    .from('applications')
    .upsert({
      user_id: userId,
      scholarship_id: scholarshipId,
      status: 'saved',
      match_score: matchScore ?? null,
      is_new: true,
    }, { onConflict: 'user_id,scholarship_id' })
    .select()
    .maybeSingle()
  if (error) {
    console.warn('saveApplication:', error.message)
    return { error: error.message }
  }
  return { data }
}

export async function deleteApplication(userId, scholarshipId) {
  if (!isSupabaseConfigured || !userId) return
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('user_id', userId)
    .eq('scholarship_id', scholarshipId)
  if (error) console.warn('deleteApplication:', error.message)
}

export async function updateStatus(applicationId, status) {
  if (!isSupabaseConfigured || !applicationId) return
  const patch = { status, updated_at: new Date().toISOString() }
  if (status === 'result') patch.result_status = 'won'
  const { error } = await supabase.from('applications').update(patch).eq('id', applicationId)
  if (error) console.warn('updateStatus:', error.message)
}

export async function setReminder(applicationId, days) {
  if (!isSupabaseConfigured || !applicationId) return
  const { error } = await supabase
    .from('applications')
    .update({
      reminder_set: days != null,
      reminder_days: days,
    })
    .eq('id', applicationId)
  if (error) console.warn('setReminder:', error.message)
}

export async function markSeen(applicationId) {
  if (!isSupabaseConfigured || !applicationId) return
  const { error } = await supabase.from('applications').update({ is_new: false }).eq('id', applicationId)
  if (error) console.warn('markSeen:', error.message)
}
