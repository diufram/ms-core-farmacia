import { Module, forwardRef } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { CategoryRiskModel } from './category-risk.model';
import { FeatureBuilderService } from './feature-builder.service';
import { MlResolver } from './ml.resolver';

@Module({
  imports: [forwardRef(() => DashboardModule)],
  providers: [CategoryRiskModel, FeatureBuilderService, MlResolver],
  exports: [CategoryRiskModel, FeatureBuilderService],
})
export class MlModule {}
