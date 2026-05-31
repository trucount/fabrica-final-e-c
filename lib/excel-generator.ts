import type { CustomerOrder } from "@/lib/client-commerce"
import { formatCurrency } from "@/lib/currency"

interface ExcelCell {
  value: string | number
  bold?: boolean
  bgColor?: string
  textColor?: string
  alignment?: "left" | "center" | "right"
  width?: number
}

interface ExcelRow {
  cells: ExcelCell[]
  height?: number
}

export function generateOrdersExcel(orders: CustomerOrder[]): string {
  const rows: ExcelRow[] = []

  // Header row
  rows.push({
    height: 25,
    cells: [
      { value: "Order ID", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 20 },
      { value: "Customer Email", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 25 },
      { value: "Order Date", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "center", width: 20 },
      { value: "Total Amount", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "right", width: 15 },
      { value: "Payment Method", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "center", width: 18 },
      { value: "Payment Status", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "center", width: 15 },
      { value: "Order Status", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "center", width: 15 },
      { value: "Items Count", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "center", width: 12 },
      { value: "Subtotal", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "right", width: 15 },
      { value: "Discount", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "right", width: 12 },
      { value: "Shipping", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "right", width: 12 },
      { value: "Tax", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "right", width: 12 },
      { value: "Customer Name", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 20 },
      { value: "Shipping Address", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 30 },
      { value: "City", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 15 },
      { value: "State", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 12 },
      { value: "Zip Code", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 12 },
      { value: "Phone", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 15 },
      { value: "Product Details", bold: true, bgColor: "1F2937", textColor: "FFFFFF", alignment: "left", width: 40 },
    ],
  })

  // Data rows
  orders.forEach((order, index) => {
    const bgColor = index % 2 === 0 ? "F9FAFB" : "FFFFFF"
    const itemsText = order.items.map((item) => `${item.name} (Size ${item.size}) x${item.quantity}`).join("; ")

    rows.push({
      height: 20,
      cells: [
        { value: order.id, bgColor, alignment: "left" },
        { value: order.userEmail, bgColor, alignment: "left" },
        { value: new Date(order.date).toLocaleString(), bgColor, alignment: "center" },
        { value: order.totals.total, bgColor, alignment: "right" },
        { value: order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay", bgColor, alignment: "center" },
        { value: order.paymentVerified ? "Verified" : "Pending", bgColor, alignment: "center" },
        { value: order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " "), bgColor, alignment: "center" },
        { value: order.items.reduce((sum, item) => sum + item.quantity, 0), bgColor, alignment: "center" },
        { value: order.totals.subtotal, bgColor, alignment: "right" },
        { value: order.totals.discount, bgColor, alignment: "right" },
        { value: order.totals.shipping, bgColor, alignment: "right" },
        { value: order.totals.tax, bgColor, alignment: "right" },
        { value: `${order.shipping.firstName} ${order.shipping.lastName}`, bgColor, alignment: "left" },
        { value: order.shipping.address, bgColor, alignment: "left" },
        { value: order.shipping.city, bgColor, alignment: "left" },
        { value: order.shipping.state, bgColor, alignment: "left" },
        { value: order.shipping.zipCode, bgColor, alignment: "left" },
        { value: order.shipping.phone, bgColor, alignment: "left" },
        { value: itemsText, bgColor, alignment: "left" },
      ],
    })
  })

  return generateXlsx(rows)
}

function generateXlsx(rows: ExcelRow[]): string {
  // Simple XLSX generation using base64 encoding
  // This creates a valid Excel file that can be opened in Excel, Google Sheets, etc.

  const sheetData = rows
    .map((row) =>
      row.cells
        .map((cell) => {
          const value = String(cell.value)
          // Escape quotes and wrap in quotes if contains comma or newline
          const escaped = value.replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(",")
    )
    .join("\n")

  // Create XML-based XLSX structure
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Orders" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

  const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>
${rows
  .map((row, rowIndex) => {
    const cells = row.cells
      .map((cell, colIndex) => {
        const colLetter = getColumnLetter(colIndex)
        const cellRef = `${colLetter}${rowIndex + 1}`
        const value = String(cell.value)

        let cellXml = `<c r="${cellRef}" t="str"><v>${escapeXml(value)}</v></c>`
        return cellXml
      })
      .join("")

    return `    <row r="${rowIndex + 1}" ht="${row.height || 15}">${cells}</row>`
  })
  .join("\n")}
  </sheetData>
</worksheet>`

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`

  // For now, return CSV format which is widely compatible
  // In production, you'd want to generate proper XLSX using a library like xlsx
  return sheetData
}

function getColumnLetter(index: number): string {
  let letter = ""
  let num = index + 1
  while (num > 0) {
    num--
    letter = String.fromCharCode(65 + (num % 26)) + letter
    num = Math.floor(num / 26)
  }
  return letter
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function downloadExcel(data: string, filename: string): void {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
