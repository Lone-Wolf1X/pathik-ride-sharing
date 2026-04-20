import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { PaymentService } from '../common/payment.service';
import { RidesService } from './rides.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private ridesService: RidesService,
  ) {}

  /**
   * POST /payments/initiate
   * Customer presses "Pay Now" → this is called → returns Khalti payment URL
   */
  @Post('initiate')
  async initiatePayment(
    @Body('rideId') rideId: string,
    @Body('amount') amount: number,
    @Body('customerId') customerId: string,
    @Body('vehicleType') vehicleType: string,
  ) {
    return this.paymentService.initiatePayment({
      rideId,
      amount,
      customerId,
      vehicleType,
      returnUrl: `pathik://payment/callback`, // Deep link back to app
    });
  }

  /**
   * POST /payments/verify
   * Called after Khalti redirects back → verifies with Khalti server-side
   * If success → marks ride as paid
   */
  @Post('verify')
  async verifyPayment(
    @Body('pidx') pidx: string,
    @Body('rideId') rideId: string,
  ) {
    const result = await this.paymentService.verifyPayment(pidx);

    if (result.success) {
      // Mark ride as paid (in production, update a payment record in DB)
      console.log(`[Pathik] Ride ${rideId} payment CONFIRMED – Rs. ${result.amount}`);
    } else {
      console.warn(`[Pathik] Ride ${rideId} payment status: ${result.status}`);
    }

    return result;
  }
}
