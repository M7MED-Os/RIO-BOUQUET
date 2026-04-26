import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoiceHTML } from '@/templates/InvoiceHTML'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  // 1. Fetch Order Data
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // 2. Fetch Product Description
  let productDescription = ''
  const { data: product } = await supabase
    .from('products')
    .select('description')
    .eq('name', order.product_name)
    .maybeSingle()

  if (product?.description) {
    const words = product.description.split(/\s+/)
    productDescription = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '')
  }

  // 3. Fetch Settings
  const { data: settings } = await supabase.from('store_settings').select('*').single()

  // 4. Generate HTML Template
  const html = generateInvoiceHTML(order, productDescription, settings || { cod_enabled: true, cod_deposit_required: false })

  // 5. Generate PDF using Puppeteer
  let browser
  try {
    if (process.env.NODE_ENV === 'production') {
      const puppeteerCore = await import('puppeteer-core')
      const chromium = (await import('@sparticuz/chromium')).default
      
      // Fix for Vercel deployment: use a specific Chromium version if needed,
      // but sparticuz/chromium usually handles the executablePath correctly.
      browser = await puppeteerCore.default.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    } else {
      const puppeteer = await import('puppeteer')
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }
    
    const page = await browser.newPage()
    
    // Set viewport for A4
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    
    // Set content and wait for fonts/images to load
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px',
      },
      displayHeaderFooter: false,
    })

    await browser.close()

    const shortId = order.id.split('-')[0].toUpperCase()

    // 6. Return PDF Response
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="RIO-BOUQUET-Invoice-${shortId}.pdf"`,
      },
    })

  } catch (err: any) {
    console.error('PDF Generation Error:', err)
    if (browser) {
      try {
        await browser.close()
      } catch (e) {}
    }
    return NextResponse.json({ 
      error: 'Failed to generate PDF', 
      details: err?.message || err?.toString() || 'Unknown error'
    }, { status: 500 })
  }
}
