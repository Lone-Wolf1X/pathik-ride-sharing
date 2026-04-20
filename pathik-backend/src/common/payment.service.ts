import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────
//  Khalti Payment Service – Sandbox (dev) + Production ready
//
//  Sandbox URL : https://dev.khalti.com/api/v2/
//  Production  : https://khalti.com/api/v2/
//
//  Test Credentials (no real money, completely free):
//    Phone  : 9800000000 – 9800000005
//    MPIN   : 1111
//    OTP    : 987654
// ─────────────────────────────────────────────────────────────

@Injectable()
export class PaymentService {
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    const isSandbox = configService.get<string>('NODE_ENV') !== 'production';

    // Sandbox vs Production switch – just change NODE_ENV in .env
    this.baseUrl = isSandbox
      ? 'https://dev.khalti.com/api/v2'
      : 'https://khalti.com/api/v2';

    this.secretKey = isSandbox
      ? configService.get<string>('KHALTI_TEST_SECRET_KEY') || 'test_secret_key_dc74e0fd11ba4b32a8bdb3af6b6e8ba9'
      : configService.get<string>('KHALTI_LIVE_SECRET_KEY') || '';

    console.log(`[Pathik Payment] Running in ${isSandbox ? '🧪 SANDBOX' : '💰 PRODUCTION'} mode`);
  }

  /**
   * Step 1: Initiate payment – backend creates a payment intent at Khalti
   * Returns { pidx, payment_url } – frontend opens payment_url for user
   */
  async initiatePayment(params: {
    rideId: string;
    amount: number;       // in PAISA (Rs. 120 = 12000 paisa)
    customerId: string;
    returnUrl: string;    // Where Khalti redirects after payment (deep link)
    vehicleType: string;
  }) {
    const amountInPaisa = params.amount * 100; // Convert Rs to Paisa

    const payload = {
      return_url: params.returnUrl,              // e.g. pathik://payment/success
      website_url: 'https://pathik.app',
      amount: amountInPaisa,
      purchase_order_id: `ride_${params.rideId}`,
      purchase_order_name: `Pathik ${params.vehicleType === 'bike' ? 'Bike' : 'Car'} Ride`,
      customer_info: {
        name: 'Pathik Customer',
        email: `customer_${params.customerId}@pathik.app`,
        phone: '9800000000',                     // Will be real number in production
      },
    };

    try {
      const response = await axios.post(`${this.baseUrl}/epayment/initiate/`, payload, {
        headers: {
          Authorization: `Key ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[Pathik Payment] Payment initiated:', response.data);

      return {
        pidx: response.data.pidx,
        payment_url: response.data.payment_url,   // Open this in mobile WebView
        expires_at: response.data.expires_at,
      };
    } catch (err) {
      console.error('[Pathik Payment] Initiation failed:', err.response?.data);
      throw new BadRequestException(
        err.response?.data?.detail || 'Payment initiation failed'
      );
    }
  }

  /**
   * Step 2: Verify payment – called after user returns from Khalti screen
   * This MUST be called server-side – never trust client alone!
   */
  async verifyPayment(pidx: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `Key ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { status, total_amount, purchase_order_id } = response.data;

      console.log(`[Pathik Payment] Verification result: ${status} for ${purchase_order_id}`);

      return {
        success: status === 'Completed',
        status,
        amount: total_amount / 100,    // Back to Rs.
        rideId: purchase_order_id?.replace('ride_', ''),
        rawResponse: response.data,
      };
    } catch (err) {
      console.error('[Pathik Payment] Verification failed:', err.response?.data);
      throw new InternalServerErrorException('Payment verification failed');
    }
  }
}
