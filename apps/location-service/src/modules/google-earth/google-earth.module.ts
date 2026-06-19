import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleEarthService } from './google-earth.service';

@Module({
  imports: [HttpModule],
  providers: [GoogleEarthService],
  exports: [GoogleEarthService],
})
export class GoogleEarthModule {}

