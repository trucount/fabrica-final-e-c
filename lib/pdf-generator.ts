import type { CustomerOrder } from "@/lib/client-commerce"
import { formatCurrency } from "@/lib/currency"

export function generateOrderPdfHtml(order: CustomerOrder, brandName: string, statusLabel: string): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">Size ${item.size}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join("")

  const shippingDisplay = order.totals.shipping === 0 ? "Free" : formatCurrency(order.totals.shipping)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Receipt - ${order.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
    }
    
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    
    .brand-name {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      font-family: Georgia, serif;
    }
    
    .header-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
    }
    
    .header-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 16px;
    }
    
    .meta-item {
      font-size: 13px;
    }
    
    .meta-label {
      color: #6b7280;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .meta-value {
      font-weight: 600;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      font-family: Georgia, serif;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .info-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
    }
    
    .info-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 14px;
      font-weight: 600;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .address-block {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      font-size: 14px;
      line-height: 1.8;
    }
    
    .address-name {
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .totals-table {
      width: 100%;
      margin-top: 24px;
    }
    
    .totals-table tr td {
      padding: 10px 0;
      border: none;
      font-size: 14px;
    }
    
    .totals-table tr td:first-child {
      color: #6b7280;
    }
    
    .totals-table tr td:last-child {
      text-align: right;
      font-weight: 500;
    }
    
    .totals-table tr.total-row td {
      border-top: 2px solid #000;
      padding-top: 12px;
      font-size: 16px;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .thank-you {
      text-align: center;
      margin-top: 32px;
      font-size: 14px;
      color: #6b7280;
    }
    
    @media print {
      body {
        background: white;
      }
      .container {
        max-width: 100%;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-name">${brandName}</div>
      <div class="header-subtitle">Order Receipt</div>
      <div class="header-meta">
        <div class="meta-item">
          <div class="meta-label">Order ID</div>
          <div class="meta-value">${order.id}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Order Date</div>
          <div class="meta-value">${new Date(order.date).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">Status</div>
        <div class="info-value">${statusLabel}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Payment Method</div>
        <div class="info-value">${order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Payment Status</div>
        <div class="info-value">${order.paymentVerified ? "Verified" : "Pending"}</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Order Items</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Size</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <div class="section">
        <div class="section-title">Shipping Address</div>
        <div class="address-block">
          <div class="address-name">${order.shipping.firstName} ${order.shipping.lastName}</div>
          <div>${order.shipping.phone}</div>
          <div>${order.shipping.address}</div>
          ${order.shipping.apartment ? `<div>${order.shipping.apartment}</div>` : ""}
          <div>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}</div>
          <div>${order.shipping.country}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Order Summary</div>
        <table class="totals-table">
          <tr>
            <td>Subtotal</td>
            <td>${formatCurrency(order.totals.subtotal)}</td>
          </tr>
          ${order.totals.discount > 0 ? `<tr><td>Discount</td><td>-${formatCurrency(order.totals.discount)}</td></tr>` : ""}
          <tr>
            <td>Shipping</td>
            <td>${shippingDisplay}</td>
          </tr>
          <tr>
            <td>Tax</td>
            <td>${formatCurrency(order.totals.tax)}</td>
          </tr>
          <tr class="total-row">
            <td>Total</td>
            <td>${formatCurrency(order.totals.total)}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="thank-you">
      Thank you for your order. Please keep this receipt for your records.
    </div>
    
  </div>
</body>
</html>
  `
}
