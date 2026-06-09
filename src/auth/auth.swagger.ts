import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login user' }),
    ApiResponse({ status: 200, description: 'Login successful' }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
  );
}

export function ApiAuthLogout() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Logout user' }),
    ApiResponse({ status: 200, description: 'Logout successful' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiAuthRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register user' }),
    ApiResponse({ status: 201, description: 'User created' }),
    ApiResponse({ status: 409, description: 'Email already exists' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: RegisterDto }),
  );
}

export function ApiAuthRefresh() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh tokens' }),
    ApiResponse({ status: 200, description: 'New tokens issued' }),
    ApiResponse({ status: 401, description: 'Invalid refresh token' }),
  );
}
