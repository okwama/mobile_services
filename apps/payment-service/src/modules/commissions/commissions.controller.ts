import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommissionsService } from './commissions.service';

@Controller()
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @MessagePattern({ cmd: 'calculate_commission' })
  async calculateCommission(@Payload() data: any) {
    return this.commissionsService.calculateCommission(data);
  }

  @MessagePattern({ cmd: 'get_company_commissions' })
  async getCompanyCommissions(@Payload() data: { companyId: number }) {
    return this.commissionsService.getCompanyCommissions(data.companyId);
  }
}

