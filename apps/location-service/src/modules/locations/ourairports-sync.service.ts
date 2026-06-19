import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Location } from './entities/location.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class OurAirportsSyncService {
  private readonly logger = new Logger(OurAirportsSyncService.name);
  private readonly OURAIRPORTS_CSV_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
  private isSyncing = false;

  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 🕐 CRON JOB: Daily sync at 3 AM
   * Automatically syncs Kenya airports from OurAirports
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailySync() {
    if (this.isSyncing) {
      this.logger.warn('⏭️  Sync already in progress, skipping...');
      return;
    }

    this.logger.log('🕐 Starting scheduled daily sync (3 AM)');
    
    try {
      this.isSyncing = true;
      
      // Sync East African countries (primary focus)
      const eastAfricanCountries = ['KE', 'TZ', 'UG', 'RW', 'ET'];
      const results = await this.syncMultipleCountries(eastAfricanCountries);
      
      this.logger.log(`✅ Daily sync complete!`, results);
    } catch (error) {
      this.logger.error(`❌ Daily sync failed: ${error.message}`);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync airports from OurAirports CSV to our database
   * Filters for Kenya and operational airports
   */
  async syncAirports(countryCode: string = 'KE'): Promise<{ imported: number; updated: number; failed: number }> {
    this.logger.log(`🚀 Starting OurAirports sync for country: ${countryCode}`);
    
    let imported = 0;
    let updated = 0;
    let failed = 0;

    try {
      // Download CSV from OurAirports with timeout
      this.logger.log(`📥 Downloading OurAirports CSV from ${this.OURAIRPORTS_CSV_URL}...`);
      
      const response = await firstValueFrom(
        this.httpService.get(this.OURAIRPORTS_CSV_URL, { 
          responseType: 'stream',
          timeout: 60000, // 60 second timeout
        })
      );
      
      this.logger.log(`✅ CSV download successful, parsing data...`);

      const airports: any[] = [];

      // Parse CSV
      await new Promise<void>((resolve, reject) => {
        const stream = response.data as Readable;
        
        stream
          .pipe(csvParser())
          .on('data', (row) => {
            // Filter for specified country and exclude closed airports
            if (row.iso_country === countryCode && row.type !== 'closed') {
              airports.push(row);
            }
          })
          .on('end', () => {
            this.logger.log(`✅ Downloaded ${airports.length} airports for ${countryCode}`);
            resolve();
          })
          .on('error', (error) => {
            this.logger.error(`❌ Error parsing CSV: ${error.message}`);
            reject(error);
          });
      });

      // Process each airport
      for (const airportRow of airports) {
        try {
          await this.processAirportRow(airportRow);
          
          // Check if it's a new record or update
          const exists = await this.locationRepository.findOne({
            where: [
              { icaoCode: airportRow.ident },
              { iataCode: airportRow.iata_code },
            ],
          });

          if (exists) {
            updated++;
          } else {
            imported++;
          }
        } catch (error) {
          this.logger.error(`❌ Failed to process ${airportRow.name}: ${error.message}`);
          failed++;
        }
      }

      this.logger.log(`✅ Sync complete: ${imported} imported, ${updated} updated, ${failed} failed`);
      
      return { imported, updated, failed };
    } catch (error) {
      this.logger.error(`❌ OurAirports sync failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a single airport row from OurAirports CSV
   */
  private async processAirportRow(row: any): Promise<void> {
    const icaoCode = row.ident; // Primary identifier (e.g., HKJK)
    const iataCode = row.iata_code || null; // May be empty for small airports
    const name = row.name;
    const type = this.mapAirportType(row.type);
    const latitude = parseFloat(row.latitude_deg);
    const longitude = parseFloat(row.longitude_deg);
    const elevationFt = row.elevation_ft ? parseInt(row.elevation_ft) : null;
    const municipality = row.municipality || null;
    const country = this.getCountryName(row.iso_country);

    // Generate a unique code (prefer IATA, fallback to ICAO)
    const code = iataCode || icaoCode;

    // Check if airport already exists
    const existing = await this.locationRepository.findOne({
      where: [
        { icaoCode },
        { iataCode: iataCode || undefined },
        { code },
      ],
    });

    if (existing) {
      // Update existing record
      existing.name = name;
      existing.iataCode = iataCode || existing.iataCode;
      existing.icaoCode = icaoCode;
      existing.latitude = latitude;
      existing.longitude = longitude;
      existing.elevationFt = elevationFt;
      existing.municipality = municipality;
      existing.country = country;
      existing.type = type;
      existing.source = 'ourairports';
      existing.lastVerified = new Date();

      await this.locationRepository.save(existing);
      this.logger.debug(`✅ Updated: ${name} (${code})`);
    } else {
      // Create new record
      const newLocation = this.locationRepository.create({
        name,
        code,
        iataCode,
        icaoCode,
        country,
        municipality,
        type,
        latitude,
        longitude,
        elevationFt,
        source: 'ourairports',
        lastVerified: new Date(),
      });

      await this.locationRepository.save(newLocation);
      this.logger.debug(`✅ Imported: ${name} (${code})`);
    }
  }

  /**
   * Map OurAirports type to our simplified type enum
   */
  private mapAirportType(ourAirportsType: string): string {
    const typeMap: { [key: string]: string } = {
      'large_airport': 'airport',
      'medium_airport': 'airport',
      'small_airport': 'airport',
      'heliport': 'airport',
      'seaplane_base': 'airport',
      'balloonport': 'airport',
      'closed': 'airport', // We filter these out, but just in case
    };

    return typeMap[ourAirportsType] || 'airport';
  }

  /**
   * Get full country name from ISO code
   */
  private getCountryName(isoCode: string): string {
    const countries: { [key: string]: string } = {
      'KE': 'Kenya',
      'TZ': 'Tanzania',
      'UG': 'Uganda',
      'ET': 'Ethiopia',
      'SO': 'Somalia',
      'SS': 'South Sudan',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'GH': 'Ghana',
      'EG': 'Egypt',
      'MA': 'Morocco',
      'RW': 'Rwanda',
      'ZW': 'Zimbabwe',
      // Add more as needed
    };

    return countries[isoCode] || isoCode;
  }

  /**
   * Sync airports for multiple countries
   */
  async syncMultipleCountries(countryCodes: string[]): Promise<any> {
    const results = [];

    for (const code of countryCodes) {
      try {
        const result = await this.syncAirports(code);
        results.push({ country: code, ...result });
      } catch (error) {
        this.logger.error(`Failed to sync ${code}: ${error.message}`);
        results.push({ country: code, error: error.message });
      }
    }

    return results;
  }
}

