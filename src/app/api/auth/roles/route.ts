export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ValidationError } from '@/lib/errors';
import { authorizeActiveUser, authorizeSuperAdmin } from '@/lib/utils/adminGuard';
import rbacService from '@/lib/services/rbacService';
import { ADMIN_MODULES } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeActiveUser(req);
    if (errorResponse || !user) return errorResponse!;

    const roles = await rbacService.getRolesCatalog();
    return NextResponse.json({
      roles,
      modules: ADMIN_MODULES,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeSuperAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    let body: any;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Request body must be valid JSON');
    }

    const role = await rbacService.upsertRole(user.id, user.role, {
      key: body.key,
      label: body.label,
      icon: body.icon,
      description: body.description,
      tier: body.tier,
      badgeColor: body.badgeColor,
      permissions: Array.isArray(body.permissions) ? body.permissions : [],
    });

    const roles = await rbacService.getRolesCatalog();
    return NextResponse.json({ role, roles }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeSuperAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    let body: any;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Request body must be valid JSON');
    }

    if (body.action === 'reset_defaults') {
      const roles = await rbacService.resetSystemRolesToDefaults(user.id, user.role);
      return NextResponse.json({ message: 'System role permissions reset to defaults', roles });
    }

    if (!body.roleKey || !Array.isArray(body.permissions)) {
      throw new ValidationError('roleKey and permissions array are required');
    }

    const role = await rbacService.updateRolePermissions(
      user.id,
      user.role,
      String(body.roleKey),
      body.permissions
    );
    const roles = await rbacService.getRolesCatalog();

    return NextResponse.json({ role, roles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeSuperAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    const roleKey = req.nextUrl.searchParams.get('key')?.trim();
    if (!roleKey) {
      throw new ValidationError('Query parameter "key" is required');
    }

    await rbacService.deleteCustomRole(user.id, user.role, roleKey);
    const roles = await rbacService.getRolesCatalog();

    return NextResponse.json({
      message: 'Custom role deleted successfully',
      roles,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

