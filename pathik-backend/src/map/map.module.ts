import { Module } from '@nestjs/common';
import { MapGateway } from './map.gateway';

@Module({
  providers: [MapGateway],
})
export class MapModule {}
