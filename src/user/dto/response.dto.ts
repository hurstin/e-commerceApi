import { Expose } from 'class-transformer';

export class ResponseDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  accessToken: string;
  //   @Expose()
  password: string;

  //     @Expose()
  // get fullName() {
  //   return `${this.firstName} ${this.lastName}`;
  // }

  constructor(partial: Partial<ResponseDto>) {
    Object.assign(this, partial);
  }
}
