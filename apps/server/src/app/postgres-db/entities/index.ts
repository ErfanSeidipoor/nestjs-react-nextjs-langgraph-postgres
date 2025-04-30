import { User } from './user.entity';
import { Thread } from './thread.entity';

export * from './user.entity';
export * from './thread.entity';

export const entities = [User, Thread];
