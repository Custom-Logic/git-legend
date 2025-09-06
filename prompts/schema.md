**Prompt for Agentic AI Coder:**

---

**Objective:** Fix NextAuth.js GitHub OAuth integration error where Prisma client validation fails due to field name mismatch between NextAuth's expected `image` field and our schema's `avatar` field.

**Current Error:**
```
Unknown argument `image`. Did you mean `email`?
```

**Root Cause:** NextAuth.js provider returns user data with an `image` field containing the avatar URL, but our Prisma schema uses `avatar` as the field name.

**Required Solution:** Create a custom Prisma adapter that properly maps NextAuth's field names to our database schema.

**Technical Context:**
- **Framework:** Next.js 14+ with NextAuth.js v4
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** GitHub OAuth provider
- **Current Schema:** User model has `avatar` field instead of `image`

**Implementation Requirements:**

1. **Create custom adapter** in `lib/auth/prisma-adapter.ts`:
   - Extend the default PrismaAdapter
   - Override `createUser` method to map `image` → `avatar`
   - Override `updateUser` method to map `image` → `avatar`
   - Handle `getUser` methods appropriately

2. **Adapter must:**
   - Maintain all existing PrismaAdapter functionality
   - Transform `image` field from NextAuth to `avatar` field for database
   - Preserve all other user data fields
   - Handle optional fields gracefully

3. **Update NextAuth configuration** in `lib/auth.ts` or `pages/api/auth/[...nextauth].ts`:
   - Replace default PrismaAdapter with custom adapter
   - Ensure all providers and callbacks remain functional

4. **Code quality requirements:**
   - TypeScript with proper type definitions
   - Error handling for database operations
   - Clean, maintainable code structure
   - Comments explaining the field mapping

**Expected Input/Output:**
- **Input:** NextAuth user object with `image` field
- **Output:** Prisma user creation with `avatar` field containing the image URL

**Testing Requirements:**
- GitHub OAuth flow should complete successfully
- User should be created/updated in database with avatar URL
- No data loss or field mapping issues
- Existing authentication functionality should remain intact

**Additional Considerations:**
- The solution should not require database schema changes
- Maintain backward compatibility with existing users
- Handle edge cases (null values, missing fields)
- Follow NextAuth.js best practices

**Deliverable:** Production-ready code that resolves the field mapping issue without breaking existing authentication flows.

