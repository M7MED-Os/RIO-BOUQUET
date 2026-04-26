'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStoreSettings(codEnabled: boolean, codDepositRequired: boolean, policies: string, depositPercentage: number) {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Upsert settings (assuming id = 1 is always used for the single settings row)
  const { error } = await supabase
    .from('store_settings')
    .upsert({ id: 1, cod_enabled: codEnabled, cod_deposit_required: codDepositRequired, policies: policies, deposit_percentage: depositPercentage })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { success: true }
}
