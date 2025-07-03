import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Custom validator to check password match
@ValidatorConstraint({ name: 'isPasswordMatching', async: false })
class IsPasswordMatchingConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password and confirm password do not match';
  }
}

export class CreateAuthDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(4)
  password: string;

  @MinLength(4)
  @Validate(IsPasswordMatchingConstraint, ['password'])
  passwordConfirm: string;
}
