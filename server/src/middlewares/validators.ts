import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';

// Login validation rules
export const signinValidationRules = () => {
  return [
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Please enter a valid email address'),

    check('password')
      .trim()
      .customSanitizer((value: string) => {
        return value.replace(/\s+/g, '');
      }),
  ];
};

// Signup validation rules
export const signupValidationRules = () => {
  return [
    check('fullname')
      .notEmpty()
      .trim()
      .escape()
      .isString()
      .withMessage('Full Name is required'),

    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Provide a valid email address'),

    check('password')
      .trim()
      .customSanitizer((value: string) => {
        return value.replace(/\s+/g, '');
      })
      // M-4 FIX: Changed minimum password length from 6 to 8 to match the
      // client-side validation in client/src/app/hooks/validation.ts.
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),

    check('confirmPassword')
      .trim()
      .customSanitizer((value: string) => {
        return value.replace(/\s+/g, '');
      })
      .custom((value: string, { req }: any) => {
        if (value !== req.body.password) {
          throw new Error('Password does not match');
        }
        return true;
      }),
  ];
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
