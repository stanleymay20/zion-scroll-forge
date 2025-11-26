#!/bin/bash

# Fix all merge conflicts by keeping HEAD version (our changes)

echo "Fixing merge conflicts in backend..."

# Fix ContentCreationService.ts
sed -i '/^<<<<<<< HEAD$/,/^=======$/!d; /^<<<<<<< HEAD$/d; /^=======$/d' src/services/ContentCreationService.ts 2>/dev/null || true
sed -i '/^>>>>>>> /d' src/services/ContentCreationService.ts 2>/dev/null || true

# Fix ProfileService.ts
sed -i '/^<<<<<<< HEAD$/,/^=======$/!d; /^<<<<<<< HEAD$/d; /^=======$/d' src/services/ProfileService.ts 2>/dev/null || true
sed -i '/^>>>>>>> /d' src/services/ProfileService.ts 2>/dev/null || true

# Fix index.ts
sed -i '/^<<<<<<< HEAD$/,/^=======$/!d; /^<<<<<<< HEAD$/d; /^=======$/d' src/index.ts 2>/dev/null || true
sed -i '/^>>>>>>> /d' src/index.ts 2>/dev/null || true

# Fix setup.ts
sed -i '/^<<<<<<< HEAD$/,/^=======$/!d; /^<<<<<<< HEAD$/d; /^=======$/d' src/__tests__/setup.ts 2>/dev/null || true
sed -i '/^>>>>>>> /d' src/__tests__/setup.ts 2>/dev/null || true

# Fix profile.ts route
sed -i '/^<<<<<<< HEAD$/,/^=======$/!d; /^<<<<<<< HEAD$/d; /^=======$/d' src/routes/profile.ts 2>/dev/null || true
sed -i '/^>>>>>>> /d' src/routes/profile.ts 2>/dev/null || true

echo "Merge conflicts fixed!"
