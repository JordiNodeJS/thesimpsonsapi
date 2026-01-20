#!/usr/bin/env tsx

/**
 * DDD Domain Validator
 *
 * Validates that a domain follows DDD architecture principles.
 *
 * Usage:
 *   pnpm dlx tsx .github/skills/nextjs-ddd-architect/scripts/validate-domain.ts <domain-name>
 *
 * Example:
 *   pnpm dlx tsx .github/skills/nextjs-ddd-architect/scripts/validate-domain.ts episodes
 */

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

interface ValidationResult {
  category: string;
  passed: number;
  total: number;
  issues: string[];
}

interface DomainValidation {
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  results: ValidationResult[];
  grade: string;
}

const domainName = process.argv[2];

if (!domainName) {
  console.error("❌ Error: Domain name is required");
  console.log("\nUsage:");
  console.log(
    "  pnpm dlx tsx .github/skills/nextjs-ddd-architect/scripts/validate-domain.ts <domain-name>",
  );
  console.log("\nExample:");
  console.log(
    "  pnpm dlx tsx .github/skills/nextjs-ddd-architect/scripts/validate-domain.ts episodes",
  );
  process.exit(1);
}

const domainPath = join(process.cwd(), "domains", domainName);

if (!existsSync(domainPath)) {
  console.error(`❌ Error: Domain "${domainName}" not found at ${domainPath}`);
  console.log("\nMake sure the domain exists in the domains/ directory.");
  process.exit(1);
}

console.log(`\n🔍 Validating domain: ${domainName}\n`);
console.log(`📂 Path: ${domainPath}\n`);

// Validation Categories
const validation: DomainValidation = {
  domain: domainName,
  score: 0,
  maxScore: 52,
  percentage: 0,
  results: [],
  grade: "",
};

// 1. Structure Validation (6 points)
function validateStructure(): ValidationResult {
  const result: ValidationResult = {
    category: "Structure",
    passed: 0,
    total: 6,
    issues: [],
  };

  const requiredDirs = ["components", "services", "actions", "store"];
  const requiredFiles = ["index.ts", "types.ts", "schemas.ts"];

  requiredDirs.forEach((dir) => {
    const dirPath = join(domainPath, dir);
    if (existsSync(dirPath)) {
      result.passed++;
    } else {
      result.issues.push(`Missing directory: ${dir}/`);
    }
  });

  requiredFiles.forEach((file) => {
    const filePath = join(domainPath, file);
    if (existsSync(filePath)) {
      result.passed++;
    } else {
      result.issues.push(`Missing file: ${file}`);
    }
  });

  return result;
}

// 2. Services Validation (6 points)
function validateServices(): ValidationResult {
  const result: ValidationResult = {
    category: "Services",
    passed: 0,
    total: 6,
    issues: [],
  };

  const servicesPath = join(domainPath, "services");
  if (!existsSync(servicesPath)) {
    result.issues.push("services/ directory not found");
    return result;
  }

  const serviceFiles = readdirSync(servicesPath).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
  );

  if (serviceFiles.length === 0) {
    result.issues.push("No service files found");
    return result;
  }

  // Check at least one service exists
  result.passed++;

  // Check for framework-agnostic patterns
  serviceFiles.forEach((file) => {
    const content = readFileSync(join(servicesPath, file), "utf-8");

    // Should NOT import from next/headers, next/navigation
    if (
      !content.includes('from "next/headers"') &&
      !content.includes('from "next/navigation"')
    ) {
      result.passed++;
    } else {
      result.issues.push(
        `${file}: Contains Next.js-specific imports (should be framework-agnostic)`,
      );
    }

    // Should have explicit return types
    const functionMatches = content.match(
      /export\s+(async\s+)?function\s+\w+\([^)]*\)/g,
    );
    if (functionMatches && functionMatches.length > 0) {
      result.passed++;
    }
  });

  // Cap at total
  if (result.passed > result.total) result.passed = result.total;

  return result;
}

// 3. Actions Validation (6 points)
function validateActions(): ValidationResult {
  const result: ValidationResult = {
    category: "Actions",
    passed: 0,
    total: 6,
    issues: [],
  };

  const actionsPath = join(domainPath, "actions");
  if (!existsSync(actionsPath)) {
    result.issues.push("actions/ directory not found");
    return result;
  }

  const actionFiles = readdirSync(actionsPath).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
  );

  if (actionFiles.length === 0) {
    result.issues.push("No action files found");
    return result;
  }

  result.passed++; // At least one action exists

  actionFiles.forEach((file) => {
    const content = readFileSync(join(actionsPath, file), "utf-8");

    // Should have "use server" directive
    if (content.includes('"use server"') || content.includes("'use server'")) {
      result.passed++;
    } else {
      result.issues.push(`${file}: Missing "use server" directive`);
    }

    // Should call revalidatePath
    if (content.includes("revalidatePath")) {
      result.passed++;
    }

    // Should use Zod validation
    if (content.includes(".parse(") || content.includes(".safeParse(")) {
      result.passed++;
    }
  });

  if (result.passed > result.total) result.passed = result.total;

  return result;
}

// 4. Components Validation (6 points)
function validateComponents(): ValidationResult {
  const result: ValidationResult = {
    category: "Components",
    passed: 0,
    total: 6,
    issues: [],
  };

  const componentsPath = join(domainPath, "components");
  if (!existsSync(componentsPath)) {
    result.issues.push("components/ directory not found");
    return result;
  }

  const componentFiles = readdirSync(componentsPath).filter(
    (f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"),
  );

  if (componentFiles.length === 0) {
    result.issues.push("No component files found");
    return result;
  }

  result.passed++; // At least one component exists

  componentFiles.forEach((file) => {
    const content = readFileSync(join(componentsPath, file), "utf-8");

    // Check for proper naming (PascalCase)
    if (/^[A-Z][a-zA-Z]+\.tsx$/.test(file)) {
      result.passed++;
    }

    // Should have typed props
    if (content.includes("interface") || content.includes("type")) {
      result.passed++;
    }
  });

  if (result.passed > result.total) result.passed = result.total;

  return result;
}

// 5. Types Validation (5 points)
function validateTypes(): ValidationResult {
  const result: ValidationResult = {
    category: "Types",
    passed: 0,
    total: 5,
    issues: [],
  };

  const typesPath = join(domainPath, "types.ts");
  if (!existsSync(typesPath)) {
    result.issues.push("types.ts not found");
    return result;
  }

  const content = readFileSync(typesPath, "utf-8");

  // Should export types
  if (content.includes("export type") || content.includes("export interface")) {
    result.passed += 2;
  } else {
    result.issues.push("No exported types found");
  }

  // Should not import from app/_lib (framework coupling)
  if (!content.includes('from "@/app/_lib')) {
    result.passed++;
  }

  // Should have at least one domain entity
  if (content.length > 50) {
    result.passed += 2;
  }

  return result;
}

// 6. Schemas Validation (5 points)
function validateSchemas(): ValidationResult {
  const result: ValidationResult = {
    category: "Schemas",
    passed: 0,
    total: 5,
    issues: [],
  };

  const schemasPath = join(domainPath, "schemas.ts");
  if (!existsSync(schemasPath)) {
    result.issues.push("schemas.ts not found");
    return result;
  }

  const content = readFileSync(schemasPath, "utf-8");

  // Should import Zod
  if (content.includes('from "zod"')) {
    result.passed += 2;
  } else {
    result.issues.push("No Zod imports found");
  }

  // Should have schemas
  if (content.includes("z.object(")) {
    result.passed += 2;
  } else {
    result.issues.push("No Zod schemas found");
  }

  // Should export inferred types
  if (content.includes("z.infer<typeof")) {
    result.passed++;
  }

  return result;
}

// 7. Public API Validation (4 points)
function validatePublicAPI(): ValidationResult {
  const result: ValidationResult = {
    category: "Public API",
    passed: 0,
    total: 4,
    issues: [],
  };

  const indexPath = join(domainPath, "index.ts");
  if (!existsSync(indexPath)) {
    result.issues.push("index.ts not found");
    return result;
  }

  const content = readFileSync(indexPath, "utf-8");

  // Should have organized exports
  if (content.includes("export {")) {
    result.passed += 2;
  } else {
    result.issues.push("No organized exports found");
  }

  // Should export types
  if (content.includes("export type")) {
    result.passed++;
  }

  // Should have comments/sections
  if (content.includes("//") || content.includes("/*")) {
    result.passed++;
  }

  return result;
}

// 8. Testing Validation (5 points)
function validateTesting(): ValidationResult {
  const result: ValidationResult = {
    category: "Testing",
    passed: 0,
    total: 5,
    issues: [],
  };

  const servicesPath = join(domainPath, "services");
  const actionsPath = join(domainPath, "actions");

  let hasTests = false;

  if (existsSync(servicesPath)) {
    const files = readdirSync(servicesPath);
    const testFiles = files.filter((f) => f.endsWith(".test.ts"));
    if (testFiles.length > 0) {
      result.passed += 3;
      hasTests = true;
    }
  }

  if (existsSync(actionsPath)) {
    const files = readdirSync(actionsPath);
    const testFiles = files.filter((f) => f.endsWith(".test.ts"));
    if (testFiles.length > 0) {
      result.passed += 2;
      hasTests = true;
    }
  }

  if (!hasTests) {
    result.issues.push("No test files found (services or actions)");
  }

  return result;
}

// 9. Independence Validation (4 points)
function validateIndependence(): ValidationResult {
  const result: ValidationResult = {
    category: "Independence",
    passed: 0,
    total: 4,
    issues: [],
  };

  const allFiles = getAllFiles(domainPath);

  let hasCrossDomainImports = false;

  allFiles.forEach((file) => {
    const content = readFileSync(file, "utf-8");

    // Check for cross-domain imports
    const domainImportPattern = /from\s+["']@\/domains\/(?!_shared)(\w+)/g;
    const matches = content.match(domainImportPattern);

    if (matches) {
      const otherDomains = matches.filter((m) => !m.includes(domainName));
      if (otherDomains.length > 0) {
        hasCrossDomainImports = true;
        result.issues.push(
          `Cross-domain import found in ${file.replace(domainPath, "")}`,
        );
      }
    }
  });

  if (!hasCrossDomainImports) {
    result.passed += 4;
  }

  return result;
}

// Helper: Get all files recursively
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Run all validations
validation.results.push(validateStructure());
validation.results.push(validateServices());
validation.results.push(validateActions());
validation.results.push(validateComponents());
validation.results.push(validateTypes());
validation.results.push(validateSchemas());
validation.results.push(validatePublicAPI());
validation.results.push(validateTesting());
validation.results.push(validateIndependence());

// Calculate score
validation.score = validation.results.reduce((sum, r) => sum + r.passed, 0);
validation.percentage = Math.round(
  (validation.score / validation.maxScore) * 100,
);

// Determine grade
if (validation.percentage >= 90) validation.grade = "A+ (Excellent)";
else if (validation.percentage >= 80) validation.grade = "A (Good)";
else if (validation.percentage >= 70)
  validation.grade = "B (Needs Improvement)";
else if (validation.percentage >= 60)
  validation.grade = "C (Requires Refactoring)";
else validation.grade = "F (Significant Issues)";

// Print results
console.log("═".repeat(60));
console.log(`📊 Validation Results for "${domainName}"`);
console.log("═".repeat(60));
console.log();

validation.results.forEach((result) => {
  const icon =
    result.passed === result.total ? "✅" : result.passed > 0 ? "🟡" : "❌";
  console.log(`${icon} ${result.category}: ${result.passed}/${result.total}`);

  if (result.issues.length > 0) {
    result.issues.forEach((issue) => {
      console.log(`   ⚠️  ${issue}`);
    });
  }
  console.log();
});

console.log("═".repeat(60));
console.log(
  `📈 Final Score: ${validation.score}/${validation.maxScore} (${validation.percentage}%)`,
);
console.log(`🎓 Grade: ${validation.grade}`);
console.log("═".repeat(60));
console.log();

// Exit with error code if score is too low
if (validation.percentage < 60) {
  console.log("❌ Domain validation failed. Please address the issues above.");
  process.exit(1);
} else {
  console.log("✅ Domain validation passed!");
  process.exit(0);
}
