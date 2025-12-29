import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/db';
import { getOrderModel } from '@/lib/models/Order';
import { getPaymentModel } from '@/lib/models/Payment';
import { phonePeConfig, generateChecksum } from '@/lib/phonepe';
import crypto from 'crypto';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // This is Order ID (database _id)

    const conn = await connectDB();
    const Order = getOrderModel(conn);
    const Payment = getPaymentModel(conn);

    const order = await (Order as any).findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if we already have a success status in DB
    if (order.status !== 'pending') {
      return NextResponse.json({ status: order.status, order });
    }

    // If still pending, check with PhonePe
    const merchantTransactionId = order.orderNumber;
    const merchantId = phonePeConfig.merchantId;

    const keyIndex = phonePeConfig.saltIndex;
    const stringToSign = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + phonePeConfig.saltKey;
    const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex') + "###" + keyIndex;

    const response = await fetch(`${phonePeConfig.hostUrl}/pg/v1/status/${merchantId}/${merchantTransactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId,
      },
    });

    const data = await response.json();

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      // Update DB if not already updated by callback
      if (order.status === 'pending') {
         order.status = "confirmed";
         order.completedAt = new Date();
         await order.save();

         // Create Payment Record if not exists
         const existingPayment = await (Payment as any).findOne({ transactionId: data.data.transactionId });
         if (!existingPayment) {
            await (Payment as any).create({
              orderId: order._id,
              orderNumber: order.orderNumber,
              buyerEmail: order.buyerEmail,
              amount: data.data.amount / 100,
              method: data.data.paymentInstrument?.type || "PHONEPE",
              status: "SUCCESS",
              transactionId: data.data.transactionId,
              gateway: "PHONEPE",
              settledAt: new Date(),
            });
         }
      }
      return NextResponse.json({ status: "confirmed", order });
    } else if (data.code === 'PAYMENT_ERROR' || data.code === 'PAYMENT_DECLINED') {
       return NextResponse.json({ status: "failed", message: data.message });
    }

    return NextResponse.json({ status: "pending", message: "Payment pending or not initiated" });

  } catch (err: any) {
    console.error("PhonePe Status Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
