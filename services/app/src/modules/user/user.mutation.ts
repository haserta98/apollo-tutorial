import UserService from "./user.service";
import {inject, injectable} from "inversify";
import {UserEntity,UserAddressEntity} from "@ecommerce/libs/src/entity/user.entity";


@injectable()
class UserMutation {

  constructor(@inject(UserService) private readonly userService: UserService) {
  }

  createUser(_: any, user: UserEntity) {
    return this.userService.createUser(user);
  }

  createAddress(_: any, address: UserAddressEntity) {
    return this.userService.createAddress(address);
  }

  removeUser(_: any, id: number) {
    return this.userService.removeUser(id);
  }
}

export default UserMutation;