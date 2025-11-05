import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import config from 'src/config';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: config().email.host,
        port: config().email.port,
        secure: config().email.secure,
        auth: {
          user: config().email.user,
          pass: config().email.pass,
        },
      },
      defaults: {
        from: config().email.from,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

