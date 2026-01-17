export interface LineItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Payment {
  id: string
  amount: number
  date: string
  note: string
}

export interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  billFrom: {
    name: string
    email: string
    address: string
  }
  billTo: {
    name: string
    email: string
    address: string
  }
  items: LineItem[]
  taxRate: number
  discount: number
  paymentStatus: "unpaid" | "partially-paid" | "paid"
  payments: Payment[]
  notes: string
}
