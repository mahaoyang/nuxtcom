import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Roles
  console.log('Creating roles...')
  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: 'Basic viewer role with read-only access',
      isSuperAdmin: false,
    },
  })

  const commenterRole = await prisma.role.upsert({
    where: { name: 'commenter' },
    update: {},
    create: {
      name: 'commenter',
      description: 'Can view content and create comments',
      isSuperAdmin: false,
    },
  })

  const authorRole = await prisma.role.upsert({
    where: { name: 'author' },
    update: {},
    create: {
      name: 'author',
      description: 'Can create and edit own content',
      isSuperAdmin: false,
    },
  })

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Can moderate content and manage users',
      isSuperAdmin: false,
    },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Full administrative access',
      isSuperAdmin: false,
    },
  })

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: {
      name: 'superadmin',
      description: 'SuperAdmin with code-level overrides',
      isSuperAdmin: true,
    },
  })

  console.log('✅ Roles created')

  // Create Permissions
  console.log('Creating permissions...')
  const permissions = [
    { code: 'view_content', name: 'View Content', description: 'Can view published content', category: 'content' },
    { code: 'create_comment', name: 'Create Comment', description: 'Can create comments', category: 'content' },
    { code: 'edit_own_comment', name: 'Edit Own Comment', description: 'Can edit own comments', category: 'content' },
    { code: 'delete_own_comment', name: 'Delete Own Comment', description: 'Can delete own comments', category: 'content' },
    { code: 'upvote_comment', name: 'Upvote Comment', description: 'Can upvote comments', category: 'content' },
    { code: 'create_post', name: 'Create Post', description: 'Can create blog posts', category: 'content' },
    { code: 'edit_own_post', name: 'Edit Own Post', description: 'Can edit own blog posts', category: 'content' },
    { code: 'delete_own_post', name: 'Delete Own Post', description: 'Can delete own blog posts', category: 'content' },
    { code: 'create_ranking', name: 'Create Ranking', description: 'Can create ranking entries', category: 'content' },
    { code: 'edit_own_ranking', name: 'Edit Own Ranking', description: 'Can edit own ranking entries', category: 'content' },
    { code: 'upvote_ranking', name: 'Upvote Ranking', description: 'Can upvote rankings', category: 'content' },
    { code: 'moderate_content', name: 'Moderate Content', description: 'Can moderate any content', category: 'moderation' },
    { code: 'hide_comment', name: 'Hide Comment', description: 'Can hide any comment', category: 'moderation' },
    { code: 'delete_any_content', name: 'Delete Any Content', description: 'Can delete any content', category: 'moderation' },
    { code: 'flag_user', name: 'Flag User', description: 'Can flag users for review', category: 'moderation' },
    { code: 'manage_users', name: 'Manage Users', description: 'Can manage user accounts', category: 'administration' },
    { code: 'manage_roles', name: 'Manage Roles', description: 'Can manage roles and permissions', category: 'administration' },
    { code: 'manage_categories', name: 'Manage Categories', description: 'Can manage categories', category: 'administration' },
    { code: 'adjust_credits', name: 'Adjust Credits', description: 'Can manually adjust user credits', category: 'administration' },
    { code: 'view_analytics', name: 'View Analytics', description: 'Can view system analytics', category: 'administration' },
  ]

  const createdPermissions: any = {}
  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    })
    createdPermissions[perm.code] = created
  }

  console.log('✅ Permissions created')

  // Assign Permissions to Roles
  console.log('Assigning permissions to roles...')

  // Viewer permissions
  const viewerPermissions = ['view_content']
  for (const code of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: createdPermissions[code].id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: createdPermissions[code].id,
      },
    })
  }

  // Commenter permissions (includes viewer)
  const commenterPermissions = [
    'view_content',
    'create_comment',
    'edit_own_comment',
    'delete_own_comment',
    'upvote_comment',
  ]
  for (const code of commenterPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: commenterRole.id,
          permissionId: createdPermissions[code].id,
        },
      },
      update: {},
      create: {
        roleId: commenterRole.id,
        permissionId: createdPermissions[code].id,
      },
    })
  }

  // Author permissions (includes commenter)
  const authorPermissions = [
    ...commenterPermissions,
    'create_post',
    'edit_own_post',
    'delete_own_post',
    'create_ranking',
    'edit_own_ranking',
    'upvote_ranking',
  ]
  for (const code of authorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: authorRole.id,
          permissionId: createdPermissions[code].id,
        },
      },
      update: {},
      create: {
        roleId: authorRole.id,
        permissionId: createdPermissions[code].id,
      },
    })
  }

  // Moderator permissions (includes author + moderation)
  const moderatorPermissions = [
    ...authorPermissions,
    'moderate_content',
    'hide_comment',
    'delete_any_content',
    'flag_user',
  ]
  for (const code of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: createdPermissions[code].id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: createdPermissions[code].id,
      },
    })
  }

  // Admin permissions (all permissions)
  for (const code of Object.keys(createdPermissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: createdPermissions[code].id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: createdPermissions[code].id,
      },
    })
  }

  console.log('✅ Role-Permission assignments completed')

  // Create Ranking Types
  console.log('Creating ranking types...')
  await prisma.rankingType.upsert({
    where: { slug: 'cli-tools' },
    update: {},
    create: {
      name: 'CLI Tools',
      slug: 'cli-tools',
      description: 'Command-line tools for vibe coding',
      icon: '⚡',
      displayOrder: 1,
    },
  })

  await prisma.rankingType.upsert({
    where: { slug: 'coding-models' },
    update: {},
    create: {
      name: 'Coding Models',
      slug: 'coding-models',
      description: 'AI models optimized for coding',
      icon: '🤖',
      displayOrder: 2,
    },
  })

  await prisma.rankingType.upsert({
    where: { slug: 'third-party-proxies' },
    update: {},
    create: {
      name: 'Third-party Proxies',
      slug: 'third-party-proxies',
      description: 'API proxy services and gateways',
      icon: '🔗',
      displayOrder: 3,
    },
  })

  console.log('✅ Ranking types created')

  // Create Sample Categories
  console.log('Creating sample categories...')
  const categories = [
    { name: 'AI Coding', slug: 'ai-coding', color: '#3B82F6', icon: '🤖' },
    { name: 'Tools', slug: 'tools', color: '#10B981', icon: '🛠️' },
    { name: 'Tutorials', slug: 'tutorials', color: '#F59E0B', icon: '📚' },
    { name: 'Best Practices', slug: 'best-practices', color: '#8B5CF6', icon: '✨' },
    { name: 'Performance', slug: 'performance', color: '#EF4444', icon: '⚡' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  console.log('✅ Categories created')

  console.log('✨ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
