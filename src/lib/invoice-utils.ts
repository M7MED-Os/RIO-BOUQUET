export function generateWhatsAppInvoiceMessage(order: any) {
  const shortId = order.id.split('-')[0].toUpperCase()
  const total = Number(order.final_price).toFixed(2)
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '201124417693'
  
  const text = `اهلا بيك👋\nأرسل لكم فاتورة الطلب:\n\n🧾 رقم الفاتورة: #${shortId}\n💰 الإجمالي: ${total} ج.م\n\nيرجى تأكيد الطلب. شكراً!`
  
  const encodedText = encodeURIComponent(text)
  return `https://wa.me/${phone}?text=${encodedText}`
}
