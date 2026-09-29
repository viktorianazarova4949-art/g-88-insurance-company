import { UsersRepository } from '../../../../Downloads/src/src/users/users.repository';
import { User } from '../../../../Downloads/src/src/users/user.entity';
import { Role } from '../../../../Downloads/src/src/users/enums/role.enum';
export declare class UsersService {
    private readonly repository;
    constructor(repository: UsersRepository);
    create(user: User): Promise<User>;
    getAllActiveUsers(): Promise<User[]>;
    getActiveUserById(id: number): Promise<User>;
    update(id: number, user: User): Promise<void>;
    deleteById(id: number): Promise<void>;
    restoreById(id: number): Promise<void>;
    setRole(id: number, role: Role): Promise<void>;
}
