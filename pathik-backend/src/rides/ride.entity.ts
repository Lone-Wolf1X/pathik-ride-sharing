import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum RideStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum VehicleType {
  BIKE = 'bike',
  CAR = 'car',
}

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  customer: User;

  @ManyToOne(() => User, { nullable: true })
  rider: User;

  // Pickup location as plain decimal — no PostGIS needed
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  pickupLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  pickupLng: number;

  // Dropoff location as plain decimal
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  dropoffLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  dropoffLng: number;

  @Column({ nullable: true })
  pickupAddress: string;

  @Column({ nullable: true })
  dropoffAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fare: number;

  @Column({
    type: 'enum',
    enum: RideStatus,
    default: RideStatus.REQUESTED,
  })
  status: RideStatus;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.BIKE,
  })
  vehicleType: VehicleType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
