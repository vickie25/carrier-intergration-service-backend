import { Carrier } from '../base/Carrier';
import { RateRequest, RateResponse } from '../../domain/models';
import { UPSAuthClient } from './UPSAuthClient';
import { UPSRatingService } from './UPSRatingService';

/**
 * UPS Carrier Implementation
 * 
 * This class ties together the UPS authentication and rating services,
 * implementing the Carrier interface. It serves as the main entry point
 * for all UPS operations.
 */
export class UPSCarrier extends Carrier {
  private readonly authClient: UPSAuthClient;
  private readonly ratingService: UPSRatingService;

  constructor() {
    super();
    this.authClient = new UPSAuthClient();
    this.ratingService = new UPSRatingService(this.authClient);
  }

  /**
   * Get carrier name
   */
  getName(): string {
    return 'UPS';
  }

  /**
   * Get shipping rates from UPS
   */
  async getRates(request: RateRequest): Promise<RateResponse> {
    return this.ratingService.getRates(request);
  }

  /**
   * Future: Create a shipping label
   * 
   * @example
   * async createLabel(request: LabelRequest): Promise<Label> {
   *   const labelService = new UPSLabelService(this.authClient);
   *   return labelService.createLabel(request);
   * }
   */

  /**
   * Future: Track a shipment
   * 
   * @example
   * async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
   *   const trackingService = new UPSTrackingService(this.authClient);
   *   return trackingService.track(trackingNumber);
   * }
   */
}