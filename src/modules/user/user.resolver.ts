import UserService from "./user.service";
import {inject, injectable} from "inversify";

@injectable()
class UserResolver {

  constructor(@inject(UserService) private readonly userService: UserService) {
  }

  resolveUsers = async () => {
    return await this.userService.getUsers();
  }

  resolveUser = async (id: number) => {
    return await this.userService.getUser(id)
  }

  resolveUserAddress = async (userId: number) => {
    return await this.userService.getUserAddresses(userId);
  }
}

export default UserResolver;