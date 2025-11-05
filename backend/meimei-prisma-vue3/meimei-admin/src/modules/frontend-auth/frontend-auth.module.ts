import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FrontendAuthController } from './frontend-auth.controller';
import { FrontendAuthService } from './frontend-auth.service';
import { SharedModule } from 'src/shared/shared.module';
import { EmailModule } from '../common/email/email.module';
import config from 'src/config';

@Module({
  imports: [
    SharedModule,
    EmailModule,
    JwtModule.register({
      secret: config().jwtSecret,
      signOptions: { expiresIn: config().expiresIn },
    }),
  ],
  controllers: [FrontendAuthController],
  providers: [FrontendAuthService],
  exports: [FrontendAuthService],
})
export class FrontendAuthModule {}

