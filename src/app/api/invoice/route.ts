import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import puppeteer from 'puppeteer'
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

  // 3. Generate HTML Template
  const html = generateInvoiceHTML(order, productDescription)

  // 4. Generate PDF using Puppeteer
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
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

    // 5. Return PDF Response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="RIO-BOUQUET-Invoice-${shortId}.pdf"`,
      },
    })

  } catch (err) {
    console.error('PDF Generation Error:', err)
    if (browser) await browser.close()
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
