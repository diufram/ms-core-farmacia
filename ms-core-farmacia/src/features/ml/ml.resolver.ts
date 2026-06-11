import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Rol } from '../../database/entities/usuario.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CategoryRiskModel } from './category-risk.model';
import { FeatureBuilderService } from './feature-builder.service';
import { MlModelStatusType } from './graphql/ml.types';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MlResolver {
  constructor(
    private readonly categoryRiskModel: CategoryRiskModel,
    private readonly featureBuilderService: FeatureBuilderService,
  ) {}

  @Query(() => MlModelStatusType)
  mlModelStatus(): MlModelStatusType {
    const loaded = this.categoryRiskModel.isLoaded();
    const last = this.categoryRiskModel.getLastTraining();
    return {
      cargado: loaded,
      categoriasEntrenadas: last?.categoriasEntrenadas ?? 0,
      oobAccuracy: last?.oobAccuracy ?? null,
      fechaEntrenamiento: last?.fechaEntrenamiento ?? null,
    };
  }

  @Mutation(() => MlModelStatusType)
  @Roles(Rol.SUPER_ADMIN)
  async retrainCategoryRiskModel(
    @Args('sucursalId', { type: () => Int, nullable: true })
    sucursalId: number | null,
    @Args('fechaDesde', { type: () => String, nullable: true })
    fechaDesde: string | null,
    @Args('fechaHasta', { type: () => String, nullable: true })
    fechaHasta: string | null,
    @Args('stockBajoUmbral', { type: () => Int, nullable: true })
    stockBajoUmbral: number | null,
  ): Promise<MlModelStatusType> {
    const result = await this.featureBuilderService.trainCategoryRiskModel({
      sucursalId: sucursalId ?? undefined,
      fechaDesde: fechaDesde ?? undefined,
      fechaHasta: fechaHasta ?? undefined,
      stockBajoUmbral: stockBajoUmbral ?? undefined,
    });
    return {
      cargado: true,
      categoriasEntrenadas: result.categoriasEntrenadas,
      oobAccuracy: result.oobAccuracy,
      fechaEntrenamiento: result.fechaEntrenamiento,
    };
  }
}
