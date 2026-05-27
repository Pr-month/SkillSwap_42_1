import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'requests' })
export class Request {
  @PrimaryGeneratedColumn()
  id: number;
}
