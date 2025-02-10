import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  rating: number;

  @Column()
  comment: string;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;
}
