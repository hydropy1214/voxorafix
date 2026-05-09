import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuickCallDto {
  @ApiProperty({ example: '+15551234567', description: 'E.164 or digits; leading + allowed' })
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  phone!: string;

  @ApiProperty({ description: 'Registered phone account to originate from' })
  @IsUUID()
  sipAccountId!: string;

  @ApiPropertyOptional({ example: 'Jane Customer', description: 'Optional label for call logs / reporting only' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactName?: string;
}
