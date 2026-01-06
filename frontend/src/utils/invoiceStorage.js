// // src/utils/invoiceStorage.js
// const KEY = 'invoice_list'

// export function readInvoices() {
//   try {
//     const raw = localStorage.getItem(KEY)
//     if (!raw) return []
//     return JSON.parse(raw)
//   } catch (e) {
//     console.error('readInvoices', e)
//     return []
//   }
// }

// export function writeInvoices(arr) {
//   try {
//     localStorage.setItem(KEY, JSON.stringify(arr))
//   } catch (e) {
//     console.error('writeInvoices', e)
//   }
// }

// export function generateInvoiceId() {
//   // readable unique invoice number, like INV-kg9xj-170...
//   return 'INV-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 900 + 100)
// }

// export function addInvoice(inv) {
//   const arr = readInvoices()
//   arr.unshift(inv)
//   writeInvoices(arr)
// }

// export function getInvoiceById(id) {
//   return readInvoices().find(i => i.id === id)
// }

// export function removeInvoice(id) {
//   const arr = readInvoices().filter(i => i.id !== id)
//   writeInvoices(arr)
// }

// export function upsertInvoice(invoice) {
//   const arr = readInvoices()
//   const id = String(invoice.id || invoice.invoiceNumber || Date.now())
//   const idx = arr.findIndex(i => String(i.id) === id)
//   const toSave = { ...invoice, id }
//   if (idx >= 0) arr[idx] = toSave
//   else arr.push(toSave)
//   saveAllInvoices(arr)
//   return toSave
// }


