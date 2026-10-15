import { Order } from '../types';

/**
 * Normalizes a phone number for WhatsApp wa.me links.
 * WhatsApp requires full international format with country code and digits only (no +, no spaces, no hyphens).
 * Defaults to 91 (India) if a standard 10-digit number is provided.
 */
export function formatWhatsAppNumber(phone?: string, defaultNumber: string = '919845012345'): string {
  if (!phone || typeof phone !== 'string' || !phone.trim()) return defaultNumber;
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return defaultNumber;

  // Standard Indian 10-digit mobile number -> prefix with 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } 
  // 11-digit number starting with 0 (e.g. 09845012345) -> replace leading 0 with 91
  else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = `91${cleaned.substring(1)}`;
  }

  return cleaned;
}

export function generateWhatsAppOrderUrl(order: Order, storePhoneNumber?: string): string {
  const targetNumber = formatWhatsAppNumber(storePhoneNumber);

  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.productName} (Qty: ${item.approvedQuantity !== undefined ? item.approvedQuantity : item.requestedQuantity}) - ₹${item.itemTotal.toLocaleString('en-IN')}`
    )
    .join('\n');

  const total = order.revisedTotal || order.originalTotal;
  const statusFormatted = order.currentStatus.replace(/_/g, ' ');

  const message = `*Mantralaya Arts - Order #${order.orderNumber}*
Status: ${statusFormatted}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Address: ${order.deliveryAddress}

*Order Items:*
${itemsText}

*Total Amount:* ₹${total.toLocaleString('en-IN')}

${order.customerNotes ? `*Customer Notes:* ${order.customerNotes}\n` : ''}
${order.supplierDecisionNotes ? `*Supplier Notes:* ${order.supplierDecisionNotes}\n` : ''}
_Sent via Mantralaya Arts PWA_`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${targetNumber}?text=${encoded}`;
}
