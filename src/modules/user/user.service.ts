import {DataSource, Repository} from "typeorm";
import {UserEntity} from "./user.entity";
import {UserAddressEntity} from "./user-address.entity";
import {inject, injectable} from "inversify";

@injectable()
class UserService {

  private readonly userRepository: Repository<UserEntity>;
  private readonly userAddressRepository: Repository<UserAddressEntity>;

  constructor(@inject(DataSource) private readonly datasource: DataSource) {
    this.userRepository = this.datasource.getRepository(UserEntity);
    this.userAddressRepository = this.datasource.getRepository(UserAddressEntity);
  }

  public async getUsers() {
    return await this.userRepository.find({});
  }

  public async getUser(id: number) {
    return await this.userRepository.findOne({where: {id}});
  }

  public async getUserAddresses(userId: number) {
    return await this.userAddressRepository.find({
      where: {user: {id: userId}},
      relations: ["user"]
    });
  }

  public async createUser(user: Partial<UserEntity>) {
    const newUser = this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  public async createAddress(address: Partial<UserAddressEntity & { userId: string }>) {
    const newAddress = this.userAddressRepository.create(address);
    newAddress.user = await this.userRepository.findOne({where: {id: +address.userId}});
    if (!newAddress.user) {
      throw new Error(`User with ID ${address.userId} not found`);
    }
    return await this.userAddressRepository.save(newAddress);
  }

  async removeUser(id: number) {
    if (!id) {
      throw new Error("UserEntity ID is required for deletion");
    }

    const user = await this.userRepository.findOne({where: {id}});
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    await this.userAddressRepository.softDelete({
      user: {
        id: id
      }
    });
    return (await this.userRepository.softDelete(id)).affected == 1;
  }

}

export default UserService;