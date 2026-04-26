import fs from 'fs'
import path from 'path'

export function generateInvoiceHTML(order: any, productDescription: string, settings: any = { cod_enabled: true, cod_deposit_required: false }) {
    const shortId = order.id.split('-')[0].toUpperCase()
    const date = new Date(order.created_at).toLocaleDateString('ar-EG')

    let logoBase64 = ''
    try {
        const logoPath = path.join(process.cwd(), 'public', 'logo.jpg')
        const logoBuffer = fs.readFileSync(logoPath)
        logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`
    } catch (e) {
        console.error('Logo not found for PDF')
    }

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --rose-600: #e11d48;
            --rose-50: #fff1f2;
            --zinc-900: #18181b;
            --zinc-600: #52525b;
            --zinc-400: #a1a1aa;
            --zinc-100: #f4f4f5;
            --zinc-50: #f8fafc;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Cairo', sans-serif;
            background: white;
            color: var(--zinc-900);
            width: 210mm;
            height: 297mm;
            padding: 12mm 15mm;
            position: relative;
        }

        .top-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 6mm;
            background-color: var(--rose-600);
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
            margin-top: 15px;
            border-bottom: 1px solid var(--zinc-100);
            padding-bottom: 25px;
        }

        .brand-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo {
            width: 75px;
            height: 75px;
            border-radius: 15px;
            object-fit: cover;
        }

        .brand-name {
            font-size: 30px;
            font-weight: 900;
            color: var(--zinc-900);
            letter-spacing: -0.5px;
            line-height: 1;
        }

        .brand-sub {
            font-size: 11px;
            color: var(--zinc-400);
            font-weight: 700;
            margin-top: 2px;
        }

        .invoice-meta {
            text-align: left;
        }

        .invoice-label {
            font-size: 48px;
            font-weight: 900;
            color: #f1f5f9;
            text-transform: uppercase;
            line-height: 0.8;
            margin-bottom: 15px;
            letter-spacing: 2px;
        }

        .meta-grid {
            display: flex;
            gap: 30px;
            justify-content: flex-end;
        }

        .meta-item { text-align: right; }
        .meta-label { font-size: 10px; color: var(--zinc-400); font-weight: 700; margin-bottom: 2px; }
        .meta-value { font-size: 13px; font-weight: 900; }

        .unified-info-box {
            background: var(--zinc-50);
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-radius: 16px;
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #f1f5f9;
        }

        .info-col {
            padding: 0 15px;
        }

        .info-col.border-l {
            border-left: 1pt solid #e2e8f0;
        }

        .info-label {
            font-size: 10px;
            font-weight: 800;
            color: var(--zinc-400);
            margin-bottom: 8px;
            text-align: right;
        }

        .info-value-title {
            font-size: 16px;
            font-weight: 900;
            margin-bottom: 4px;
            text-align: right;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .info-value-title svg { color: var(--rose-600); }

        .info-value-desc {
            font-size: 12px;
            color: var(--zinc-600);
            line-height: 1.5;
            font-weight: 600;
            text-align: right;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .info-value-desc svg { color: var(--rose-600); }

        .no-bold { font-weight: 400 !important; }

        .instr-box {
            background: #fff5f5;
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 30px;
            border: 1px solid #fee2e2;
        }

        .instr-title {
            font-size: 15px;
            font-weight: 900;
            color: var(--rose-600);
            margin-bottom: 6px;
        }

        .instr-text {
            font-size: 12px;
            color: var(--zinc-600);
            line-height: 1.6;
            font-weight: 600;
        }

        .table-header {
            display: flex;
            border-bottom: 2pt solid var(--zinc-900);
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .th-item { font-size: 13px; font-weight: 900; }
        .flex-1 { flex: 1; }
        .w-120 { width: 140px; text-align: left; }
        .w-180 { width: 180px; text-align: center; }

        .item-row {
            display: flex;
            align-items: flex-start;
            padding: 20px 0;
            border-bottom: 1pt solid var(--zinc-100);
        }

        .item-name { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
        .item-desc { font-size: 11px; color: var(--zinc-400); font-weight: 600; }
        .item-price { font-size: 15px; font-weight: 700; color: var(--zinc-600); }
        .item-total { font-size: 17px; font-weight: 900; text-align: left; }

        .bottom-section {
            display: flex;
            gap: 25px;
            margin-top: 35px;
            align-items: flex-start;
        }

        .calc-section {
            flex: 1.3;
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding-top: 25px;
        }

        .calc-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;
        }

        .calc-label { font-size: 12px; color: var(--zinc-400); font-weight: 700; text-align: right; }
        .calc-value { font-size: 13px; font-weight: 800; text-align: left; min-width: 100px; white-space: nowrap; }

        .total-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;
            margin-top: 5px;
        }

        .total-label { font-size: 18px; font-weight: 900; text-align: right; white-space: nowrap; }
        .total-value { font-size: 28px; font-weight: 900; color: var(--rose-600); text-align: left; min-width: 160px; white-space: nowrap; }

        .payment-card {
            flex: 0.9;
            background: #fffcfc;
            border: 1px solid #ffe4e6;
            border-radius: 20px;
            padding: 22px;
        }

        .payment-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
            font-weight: 900;
            margin-bottom: 18px;
        }

        .icon-box {
            width: 24px;
            height: 24px;
            background: var(--rose-50);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--rose-600);
            border: 1px solid #fecaca;
        }

        .pay-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #fff1f2;
        }

        .pay-item:last-child { border: none; }
        .pay-label { font-size: 13px; font-weight: 700; color: var(--zinc-400); }
        .pay-value { font-size: 13px; font-weight: 900; }

        footer {
            position: absolute;
            bottom: 12mm;
            left: 15mm;
            right: 15mm;
            border-top: 1pt solid var(--zinc-100);
            padding-top: 25px;
            text-align: center;
        }

        .thanks { font-size: 16px; font-weight: 900; margin-bottom: 8px; }
        .footer-note { font-size: 11px; color: var(--zinc-400); font-weight: 600; }
    </style>
</head>
<body>
    <div class="top-bar"></div>

    <header>
        <div class="brand-section">
            <img src="${logoBase64}" class="logo">
            <div>
                <h1 class="brand-name">RIO BOUQUET</h1>
                <p class="brand-sub">لتنسيق أروع الزهور والهدايا</p>
            </div>
        </div>

        <div class="invoice-meta">
            <h2 class="invoice-label">Invoice</h2>
            <div class="meta-grid">
                <div class="meta-item">
                    <p class="meta-label">تاريخ الإصدار</p>
                    <p class="meta-value">${date}</p>
                </div>
                <div class="meta-item">
                    <p class="meta-label">رقم الفاتورة</p>
                    <p class="meta-value">#${shortId}</p>
                </div>
            </div>
        </div>
    </header>

    <div class="unified-info-box">
        <div class="info-col">
            <p class="info-label">فاتورة إلى (العميل)</p>
            <p class="info-value-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ${order.customer_name || 'غير مسجل'}
            </p>
            <p class="info-value-desc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span dir="ltr">${order.customer_phone || 'غير مسجل'}</span>
            </p>
            <p class="info-value-desc" style="margin-top: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${order.customer_address || 'عنوان التوصيل غير مسجل'}
            </p>
        </div>
        <div class="info-col border-l">
            <p class="info-label">طريقة الدفع المحددة و التواصل</p>
            <p class="info-value-title no-bold" style="color: var(--rose-600); font-weight: 900 !important; font-size: 15px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                ${order.payment_method || 'غير محدد'}
            </p>
            <p class="info-value-desc" style="margin-top: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                الواتساب: <span class="no-bold">01124417693</span>
            </p>
        </div>
    </div>

    ${order.payment_method === 'الدفع عند الاستلام' && !settings.cod_deposit_required ? `
    <div class="instr-box" style="background: #f0fdf4; border-color: #bbf7d0;">
        <p class="instr-title" style="color: #16a34a;">تأكيد الحجز:</p>
        <p class="instr-text" style="color: #15803d;">
            سيتم تجهيز طلبك قريباً. الدفع سيكون عند استلام الطلب. يرجى إرسال هذه الفاتورة عبر الواتساب لتأكيد طلبك.
        </p>
    </div>
    ` : order.payment_method === 'الدفع عند الاستلام' && settings.cod_deposit_required ? `
    <div class="instr-box">
        <p class="instr-title">لإتمام الطلب وتأكيد الحجز:</p>
        <p class="instr-text">
            يرجى دفع مقدم بنسبة ${settings.deposit_percentage || 50}% (${Number((order.final_price * (settings.deposit_percentage || 50)) / 100).toFixed(2)} ج.م) عبر إحدى الطرق الموضحة بالأسفل لتأكيد الحجز والبدء في تجهيز طلبك فوراً. سيتم دفع باقي المبلغ عند الاستلام. (يرجى إرسال إيصال التحويل مع هذه الفاتورة عبر الواتساب).
        </p>
    </div>
    ` : `
    <div class="instr-box">
        <p class="instr-title">لإتمام الطلب وتأكيد الحجز:</p>
        <p class="instr-text">
            يرجى إتمام عملية الدفع عبر إحدى الطرق الموضحة بالأسفل، ثم إرسال صورة من إيصال التحويل مع هذه الفاتورة عبر الواتساب للبدء في تجهيز طلبك فوراً.
        </p>
    </div>
    `}

    <div class="table-header">
        <div class="th-item flex-1">تفاصيل الطلب</div>
        <div class="th-item w-180">السعر الأساسي</div>
        <div class="th-item w-120">الإجمالي</div>
    </div>

    <div class="item-row">
        <div class="flex-1">
            <p class="item-name">${order.product_name}</p>
            ${productDescription ? `<p class="item-desc">${productDescription}</p>` : ''}
        </div>
        <div class="w-180 item-price">${Number(order.product_price).toFixed(2)} ج.م</div>
        <div class="w-120 item-total">${Number(order.product_price).toFixed(2)} ج.م</div>
    </div>

    <div class="bottom-section">
        <!-- Payment Card on the RIGHT -->
        <div class="payment-card">
            <div class="payment-card-header">
                <div class="icon-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <span>بيانات الدفع الإلكتروني</span>
            </div>
            <div class="pay-item">
                <p class="pay-label">إنستا باي:</p>
                <p class="pay-value">riobouquet@instapay</p>
            </div>
            <div class="pay-item">
                <p class="pay-label">المحفظة:</p>
                <p class="pay-value">01124417693</p>
            </div>
        </div>

        <!-- Totals on the LEFT -->
        <div class="calc-section">
            <div class="calc-row">
                <p class="calc-label">المجموع الفرعي:</p>
                <p class="calc-value">${Number(order.product_price).toFixed(2)} ج.م</p>
            </div>
            ${order.discount_percentage > 0 ? `
            <div class="calc-row" style="color: var(--rose-600)">
                <p class="calc-label" style="color: inherit">خصم الكوبون (${order.coupon_code}):</p>
                <p class="calc-value" style="color: inherit">-${order.discount_percentage}%</p>
            </div>
            ` : ''}
            <div class="total-row">
                <p class="total-label">المبلغ الإجمالي المطلوب:</p>
                <p class="total-value">${Number(order.final_price).toFixed(2)} ج.م</p>
            </div>
        </div>
    </div>

    <footer>
        ${settings.policies ? `
        <div style="margin-bottom: 20px; padding: 15px; background: #fafafa; border-radius: 12px; border: 1px dashed #e4e4e7; text-align: right;">
            <p style="font-size: 11px; font-weight: 800; color: var(--zinc-900); margin-bottom: 4px;">سياسات المتجر:</p>
            <p style="font-size: 10px; color: var(--zinc-600); line-height: 1.6; white-space: pre-line;">${settings.policies}</p>
        </div>
        ` : ''}
        <p class="thanks">شكراً لاختيارك ريو بوكيه!</p>
        <p class="footer-note">هذه الفاتورة معتمدة إلكترونياً من متجر RIO BOUQUET.</p>
    </footer>
</body>
</html>
  `
}
