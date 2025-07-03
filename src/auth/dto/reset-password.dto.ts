import {
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

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @Validate(IsPasswordMatchingConstraint, ['password'])
  passwordConfirm: string;
}
