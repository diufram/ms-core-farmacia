import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../../database/entities/persona.entity';
import { Usuario } from '../../database/entities/usuario.entity';
import { ProfileRepository } from './profile.repository';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Persona, Usuario])],
  providers: [ProfileService, ProfileRepository, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
