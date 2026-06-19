import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity } from './entities/amenity.entity';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
  ) {}

  async findByAircraft(aircraftId: number): Promise<Amenity[]> {
    // Query aircraft_amenities join table
    const result = await this.amenityRepository.query(`
      SELECT a.* FROM amenities a
      INNER JOIN aircraft_amenities aa ON a.id = aa.amenityId
      WHERE aa.aircraftId = ?
    `, [aircraftId]);

    return result;
  }

  async findAll(): Promise<Amenity[]> {
    return this.amenityRepository.find();
  }
}

