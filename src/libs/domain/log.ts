import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

interface Log {
  type: string;
  message: string;
  owner: string;
}

@Entity("logs")
export class LogEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  message: string;

  @Column()
  owner: string;

  @CreateDateColumn()
  createdAt: Date;
}

export default Log;