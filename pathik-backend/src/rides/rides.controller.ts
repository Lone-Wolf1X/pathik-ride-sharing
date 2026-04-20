import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { RidesService } from './rides.service';
import { VehicleType } from './ride.entity';

@Controller('rides')
export class RidesController {
  constructor(private ridesService: RidesService) {}

  @Post('request')
  async requestRide(
    @Body('customerId') customerId: string,
    @Body('pickup') pickup: any,
    @Body('dropoff') dropoff: any,
    @Body('vehicleType') vehicleType: VehicleType,
  ) {
    return this.ridesService.createRide(customerId, pickup, dropoff, vehicleType);
  }

  @Patch('start/:rideId')
  async startRide(
    @Param('rideId') rideId: string,
    @Body('riderId') riderId: string,
  ) {
    return this.ridesService.startRide(rideId, riderId);
  }

  @Patch('complete/:rideId')
  async completeRide(
    @Param('rideId') rideId: string,
    @Body('riderId') riderId: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    return this.ridesService.completeRide(rideId, riderId, lat, lng);
  }
}
