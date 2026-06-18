import { UnauthorizedException } from '@nestjs/common';
import { RpcEnvelope } from './rpc.types';

export function assertRpcAuth(envelope: RpcEnvelope, expectedToken: string) {
  if (!envelope?.token || !expectedToken || envelope.token !== expectedToken) {
    throw new UnauthorizedException('Invalid internal service token');
  }
}
