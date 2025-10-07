import { createParamDecorator } from '@nestjs/common';
export const OrganizationId = createParamDecorator((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.organizationId;
});
//# sourceMappingURL=organization-id.decorator.js.map