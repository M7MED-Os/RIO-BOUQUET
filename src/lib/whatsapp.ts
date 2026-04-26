import { Product } from "@/types/product";

export function generateWhatsAppLink(product: Product): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '201124417693';
  
  const message = `مرحباً 👋، أريد طلب هذا المنتج:

🌸 الاسم: ${product.name}
🔑 الرقم: ${product.id}
💰 السعر: ${product.price ? `${product.price} ج.م` : "يُحدد عند التواصل"}

أرجو التواصل معي للتأكيد. شكراً!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
}
