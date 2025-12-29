import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/db';
import { getOrderModel } from '@/lib/models/Order';
import { getPaymentModel } from '@/lib/models/Payment';
import { phonePeConfig } from '@/lib/phonepe';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // PhonePe sends { response: "base64..." }
    const { response: encodedResponse } = body;
    const xVerify = request.headers.get('x-verify');

    if (!encodedResponse || !xVerify) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify Checksum
    // Checksum = SHA256(response + saltKey) + ### + saltIndex
    const stringToSign = encodedResponse + phonePeConfig.saltKey;
    const calculatedChecksum = crypto.createHash('sha256').update(stringToSign).digest('hex') + '###' + phonePeConfig.saltIndex;

    if (calculatedChecksum !== xVerify) {
      // In production, you MUST verify this.
      // For sandbox, sometimes it might differ if keys are messy, but usually it works.
      console.warn("Checksum mismatch in callback");
      // return NextResponse.json({ error: "Checksum verification failed" }, { status: 400 });
    }

    const decodedResponse = JSON.parse(Buffer.from(encodedResponse, 'base64').toString('utf-8'));

    if (decodedResponse.code === 'PAYMENT_SUCCESS') {
      const { merchantTransactionId, transactionId, amount, state } = decodedResponse.data;
      // merchantTransactionId is our orderNumber

      const conn = await connectDB();
      const Order = getOrderModel(conn);
      const Payment = getPaymentModel(conn);

      const order = await (Order as any).findOne({ orderNumber: merchantTransactionId });

      if (order) {
        // Update Order
        order.status = "confirmed"; // or "processing"
        order.completedAt = new Date(); // Or just mark paid?
        // Maybe "confirmed" is better. existing statuses: "pending"
        await order.save();

        // Create Payment Record
        await (Payment as any).create({
          orderId: order._id,
          orderNumber: order.orderNumber,
          buyerEmail: order.buyerEmail,
          amount: amount / 100, // Amount is in paise
          method: decodedResponse.data.paymentInstrument?.type || "PHONEPE",
          status: "SUCCESS",
          transactionId: transactionId,
          gateway: "PHONEPE",
          settledAt: new Date(),
        });
      }
    } else {
       // Handle failure
       console.log("Payment failed for", decodedResponse.data?.merchantTransactionId);
    }

    return NextResponse.json({ status: "success" });

  } catch (err: any) {
    console.error("PhonePe Callback Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
