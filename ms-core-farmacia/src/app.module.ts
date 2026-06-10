import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './features/auth/auth.module';
import { CategoriasModule } from './features/categorias/categorias.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { ProductosModule } from './features/productos/productos.module';
import { ProfileModule } from './features/profile/profile.module';
import { SucursalesModule } from './features/sucursales/sucursales.module';
import { UsuariosModule } from './features/usuarios/usuarios.module';
import { VentasModule } from './features/ventas/ventas.module';
import { NotificationsModule } from './features/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
      context: ({ req }) => ({ req }),
    }),
    DatabaseModule,
    AuthModule,
    SucursalesModule,
    UsuariosModule,
    ProfileModule,
    CategoriasModule,
    ProductosModule,
    VentasModule,
    DashboardModule,
    NotificationsModule,
  ],
})
export class AppModule {}
