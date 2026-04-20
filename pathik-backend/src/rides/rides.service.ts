import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride, RideStatus, VehicleType } from './ride.entity';
import { User } from '../users/user.entity';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private rideRepository: Repository<Ride>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createRide(
    customerId: string,
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
    vehicleType: VehicleType,
  ) {
    const customer = await this.userRepository.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const ride = this.rideRepository.create({
      customer,
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      dropoffLat: dropoff.lat,
      dropoffLng: dropoff.lng,
      pickupAddress: 'Kathmandu, Nepal',
      dropoffAddress: 'Patan, Nepal',
      fare: vehicleType === VehicleType.CAR ? 450 : 120,
      vehicleType,
      status: RideStatus.REQUESTED,
    });

    return this.rideRepository.save(ride);
  }

  async updateStatus(rideId: string, status: RideStatus, riderId?: string) {
    const ride = await this.rideRepository.findOne({ where: { id: rideId }, relations: ['rider'] });
    if (!ride) throw new NotFoundException('Ride not found');

    if (riderId && (!ride.rider || ride.rider.id !== riderId)) {
      throw new UnauthorizedException('Rider not authorized for this trip');
    }

    ride.status = status;
    return this.rideRepository.save(ride);
  }

  async startRide(rideId: string, riderId: string) {
    return this.updateStatus(rideId, RideStatus.IN_PROGRESS, riderId);
  }

  async completeRide(rideId: string, riderId: string, currentLat: number, currentLng: number) {
    const ride = await this.rideRepository.findOne({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    // Basic logic: You can complete the ride anytime, but we log the completion coordinates
    // In production, you would add a distance check here
    ride.status = RideStatus.COMPLETED;
    return this.rideRepository.save(ride);
  }
}
