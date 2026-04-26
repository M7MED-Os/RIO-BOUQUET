'use server'

import { createClient } from '@/lib/supabase/server'
import { Product } from '@/types/product'
import { revalidatePath } from 'next/cache'

export async function createOrder(
  product: Product, 
  couponCode: string, 
  currentDiscount: number,
  customerName: string,
  customerAddress: string
) {
  const supabase = await createClient()
  let finalPrice = product.price || 0
  let discount = 0
  let appliedCoupon = null

  if (couponCode && currentDiscount > 0) {
    // Validate coupon on the server
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (coupon) {
      // Check limits
      const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
      const isLimitReached = coupon.max_uses && coupon.current_uses >= coupon.max_uses

      if (!isExpired && !isLimitReached) {
        discount = coupon.discount_percentage
        finalPrice = product.price! - (product.price! * discount / 100)
        appliedCoupon = coupon.code

        // Increment usage
        await supabase.from('coupons').update({ current_uses: coupon.current_uses + 1 }).eq('id', coupon.id)
      }
    }
  }

  const { data: order, error } = await supabase.from('orders').insert({
    product_name: product.name,
    product_price: product.price || 0,
    coupon_code: appliedCoupon,
    discount_percentage: discount,
    final_price: finalPrice,
    customer_name: customerName,
    customer_address: customerAddress
  }).select().single()

  if (error || !order) {
    return { success: false, error: 'حدث خطأ أثناء إنشاء الطلب' }
  }

  return { success: true, orderId: order.id }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  return { success: true }
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/orders')
  return { success: true }
}
