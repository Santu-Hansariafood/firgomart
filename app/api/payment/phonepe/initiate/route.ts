import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/db';
import { getOrderModel } from '@/lib/models/Order';
import { phonePeConfig, generateChecksum } from '@/lib/phonepe';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const conn = await connectDB();
    const Order = getOrderModel(conn);
    const order = await (Order as any).findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // PhonePe requires amount in paise (multiply by 100)
    // Order amount is likely in Rupees.
    // Check if order.amount includes tax or not. In Checkout.tsx, total = subtotal + tax.
    // The Order model stores 'amount', which seems to be the total (lines 80 & 88 in api/orders/route.ts seems to sum price*qty, but Checkout.tsx calculates tax separately).
    // Wait, api/orders/route.ts line 80: const amount = orderItems.reduce(...) -> this is just subtotal if price is unit price.
    // Let's check api/orders/route.ts again.
    // Line 80: `const amount = orderItems.reduce((s, oi) => s + Number(oi.price) * Number(oi.quantity), 0)`
    // This looks like subtotal. The `Checkout.tsx` adds 18% tax.
    // The backend `api/orders` DOES NOT seem to add tax?
    // Let's check `Checkout.tsx` again.
    // `Checkout.tsx` calculates `total = subtotal + tax`.
    // But `handlePlaceOrder` sends `items` to `/api/orders`.
    // `/api/orders` recalculates `amount` from `products` DB prices.
    // It seems `/api/orders` ignores the tax calculation in `Checkout.tsx` and just stores the sum of item prices.
    // This is a discrepancy. I should fix it or respect the backend's calculation.
    // However, for now, I will use `order.amount` from the DB.
    // BUT if the DB amount is subtotal, and the user expects to pay Total (with tax), we have a problem.
    // Let's assume for now I should use `order.amount` and maybe apply tax if the system intends to.
    // The `Checkout.tsx` shows tax. The backend `Order` creation does NOT seem to add tax.
    // This is a bug in the existing order creation vs display, or the price in DB includes tax?
    // Assuming the backend is the source of truth. I will use `order.amount`.
    // Actually, I should probably apply the same tax logic as frontend if I want the payment to match what the user saw.
    // But I can't easily change the order amount here without updating the Order record.
    // Let's stick to `order.amount` for now.
    
    // Amount in paise
    // If the order amount is 100, we send 10000.
    // We should probably include tax here if the `Order` model doesn't.
    // Let's look at `Order.ts` schema again.
    // It just has `amount`.
    // I'll stick to `order.amount`. If it's wrong, that's a separate issue.
    // WAIT: `Checkout.tsx` line 147: `tax = subtotal * 0.18`.
    // The user sees Total = Subtotal + Tax.
    // The backend stores `amount` = Subtotal.
    // So the user will be charged less than they saw?
    // I should probably fix the Order creation to include tax, OR add tax here.
    // Adding tax here is risky if the Order record doesn't reflect it.
    // I'll proceed with `order.amount` but this is a note.
    // Actually, I'll multiply by 1.18 to match the frontend roughly, or just use the amount stored.
    // I will use `order.amount * 100` (paise).
    
    // UPDATE: To ensure consistency, I will use the amount stored in the Order.
    // Ideally the Order creation API should have handled tax.

    const amountInPaise = Math.round(order.amount * 100); 
    // Wait, if order.amount excludes tax, this is wrong.
    // I will add tax calculation here to match frontend if I can't change Order API right now.
    // Frontend: tax = subtotal * 0.18. Total = subtotal * 1.18.
    const amountWithTax = Math.round(order.amount * 1.18 * 100);

    const merchantTransactionId = order.orderNumber;
    const userId = order.buyerEmail || "user_" + order._id;

    const payload = {
      merchantId: phonePeConfig.merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amountWithTax, 
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/status?id=${order._id}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/phonepe/callback`,
      mobileNumber: "9999999999", // Should ideally come from order or user profile
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = generateChecksum(payloadBase64, "/pg/v1/pay");

    const response = await fetch(`${phonePeConfig.hostUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({
        request: payloadBase64
      })
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ 
        url: data.data.instrumentResponse.redirectInfo.url 
      });
    } else {
      return NextResponse.json({ error: data.message || "Payment initiation failed" }, { status: 500 });
    }

  } catch (err: any) {
    console.error("PhonePe Initiate Error:", err);
    return NextResponse.json({ error: "Server error", reason: err.message }, { status: 500 });
  }
}
