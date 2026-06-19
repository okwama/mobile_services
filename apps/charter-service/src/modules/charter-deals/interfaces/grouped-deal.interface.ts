export interface GroupedCharterDeal {
  aircraftTypeId: number;
  aircraftType: string;
  aircraftTypeImageUrl: string;
  route: {
    origin: string;
    destination: string;
    distanceFromUser?: number;
  };
  deals: any[];
}

export interface PaginatedGroupedResponse {
  success: boolean;
  data: GroupedCharterDeal[];
  total: number;
  page: number;
  limit: number;
  totalGroups: number;
}
