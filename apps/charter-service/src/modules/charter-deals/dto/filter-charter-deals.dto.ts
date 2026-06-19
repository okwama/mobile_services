export class FilterCharterDealsDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
  dealType?: string;
  fromDate?: string;
  toDate?: string;
  aircraftTypeImagePlaceholderId?: number;
  origin?: string;
  destination?: string;
  userLat?: number;
  userLng?: number;
  groupBy?: boolean = false;
}
