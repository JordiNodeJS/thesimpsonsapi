#!/usr/bin/env tsx

/**
 * Clean Architecture Validation Script
 *
 * Validates Clean Architecture implementation by checking:
 * - Layer dependencies (Dependency Rule)
 * - Domain purity (zero framework dependencies)
 * - Application layer isolation
 * - Repository pattern compliance
 * - Use case design
 *
 * Usage:
 *   pnpm tsx .github/skills/clean-architecture-frontend/scripts/validate-clean-arch.ts
 *
 * Exit codes:
 *   0 - All checks passed (A grade: 90-100 points)
 *   1 - Warnings found (B grade: 75-89 points)
 *   2 - Errors found (C grade or below: <75 points)
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";

interface ValidationResult {
  category: string;
  message: string;
  severity: "error" | "warning" | "info";
  file?: string;
  line?: number;
  points: number;
}

interface Score {
  domain: number;
  application: number;
  infrastructure: number;
  delivery: number;
  testing: number;
  total: number;
  maxPoints: number;
  grade: string;
}

class CleanArchitectureValidator {
  private results: ValidationResult[] = [];
  private score: Score = {
    domain: 0,
    application: 0,
    infrastructure: 0,
    delivery: 0,
    testing: 0,
    total: 0,
    maxPoints: 100,
    grade: "F",
  };

  private readonly projectRoot = process.cwd();
  private readonly domainPath = join(this.projectRoot, "core", "domain");
  private readonly applicationPath = join(
    this.projectRoot,
    "core",
    "application",
  );
  private readonly infrastructurePath = join(
    this.projectRoot,
    "infrastructure",
  );
  private readonly deliveryPath = join(this.projectRoot, "app");

  async validate(): Promise<void> {
    console.log("🔍 Validating Clean Architecture implementation...\n");

    // Check if core directories exist
    if (!existsSync(this.domainPath)) {
      this.addResult({
        category: "Setup",
        message: "Domain layer not found at core/domain/",
        severity: "error",
        points: 0,
      });
      return;
    }

    // Layer 1: Domain Layer (25 points)
    await this.validateDomainLayer();

    // Layer 2: Application Layer (25 points)
    await this.validateApplicationLayer();

    // Layer 3: Infrastructure Layer (20 points)
    await this.validateInfrastructureLayer();

    // Layer 4: Delivery Layer (20 points)
    await this.validateDeliveryLayer();

    // Layer 5: Testing (10 points)
    await this.validateTesting();

    // Calculate final score
    this.calculateScore();
  }

  private async validateDomainLayer(): Promise<void> {
    console.log("📦 Validating Domain Layer...");

    let points = 0;

    // Check 1: Domain has zero framework dependencies (10 points)
    const domainFiles = this.getTypeScriptFiles(this.domainPath);
    let frameworkViolations = 0;

    for (const file of domainFiles) {
      const content = readFileSync(file, "utf-8");

      // Check for framework imports
      const violations = [
        { pattern: /from ['"]@\/app/g, name: "app/" },
        { pattern: /from ['"]@\/infrastructure/g, name: "infrastructure/" },
        { pattern: /from ['"]@\/core\/application/g, name: "application/" },
        { pattern: /from ['"]next/g, name: "Next.js" },
        { pattern: /from ['"]react/g, name: "React" },
        { pattern: /from ['"]@prisma/g, name: "Prisma" },
      ];

      for (const { pattern, name } of violations) {
        const matches = content.match(pattern);
        if (matches) {
          frameworkViolations += matches.length;
          this.addResult({
            category: "Domain Layer",
            message: `Domain imports ${name} (Dependency Rule violation)`,
            severity: "error",
            file: relative(this.projectRoot, file),
            points: -2,
          });
        }
      }
    }

    if (frameworkViolations === 0) {
      points += 10;
      this.addResult({
        category: "Domain Layer",
        message: "✅ Domain has zero framework dependencies",
        severity: "info",
        points: 10,
      });
    }

    // Check 2: Rich domain model (8 points)
    let richModelCount = 0;
    const entityFiles = this.getTypeScriptFiles(
      join(this.domainPath, "entities"),
    );

    for (const file of entityFiles) {
      const content = readFileSync(file, "utf-8");

      // Check for business methods (not just getters/setters)
      const methodMatches = content.match(/^\s*\w+\([^)]*\):\s*\w+/gm) || [];
      const businessMethods = methodMatches.filter(
        (m) =>
          !m.includes("get ") &&
          !m.includes("set ") &&
          !m.includes("constructor"),
      );

      if (businessMethods.length >= 2) {
        richModelCount++;
      } else {
        this.addResult({
          category: "Domain Layer",
          message: `Possible anemic model in ${relative(this.projectRoot, file)}`,
          severity: "warning",
          file: relative(this.projectRoot, file),
          points: -2,
        });
      }
    }

    if (richModelCount > 0) {
      points += Math.min(8, richModelCount * 2);
      this.addResult({
        category: "Domain Layer",
        message: `✅ Found ${richModelCount} rich domain models`,
        severity: "info",
        points: Math.min(8, richModelCount * 2),
      });
    }

    // Check 3: Domain services (4 points)
    const servicesPath = join(this.domainPath, "services");
    if (existsSync(servicesPath)) {
      const serviceFiles = this.getTypeScriptFiles(servicesPath);
      if (serviceFiles.length > 0) {
        points += 4;
        this.addResult({
          category: "Domain Layer",
          message: `✅ Found ${serviceFiles.length} domain service(s)`,
          severity: "info",
          points: 4,
        });
      }
    }

    // Check 4: Exception handling (3 points)
    const exceptionsPath = join(this.domainPath, "exceptions");
    if (existsSync(exceptionsPath)) {
      const exceptionFiles = this.getTypeScriptFiles(exceptionsPath);
      if (exceptionFiles.length > 0) {
        points += 3;
        this.addResult({
          category: "Domain Layer",
          message: `✅ Found ${exceptionFiles.length} domain exception(s)`,
          severity: "info",
          points: 3,
        });
      }
    }

    this.score.domain = points;
  }

  private async validateApplicationLayer(): Promise<void> {
    console.log("🎯 Validating Application Layer...");

    let points = 0;

    if (!existsSync(this.applicationPath)) {
      this.addResult({
        category: "Application Layer",
        message: "Application layer not found",
        severity: "warning",
        points: 0,
      });
      return;
    }

    // Check 1: Use case design (10 points)
    const useCasePath = join(this.applicationPath, "use-cases");
    if (existsSync(useCasePath)) {
      const useCaseFiles = this.getTypeScriptFiles(useCasePath);

      for (const file of useCaseFiles) {
        const content = readFileSync(file, "utf-8");

        // Check for single execute method
        const executeMatches = content.match(/async execute\(/g) || [];
        if (executeMatches.length === 1) {
          points += 2;
          this.addResult({
            category: "Application Layer",
            message: `✅ Use case has single execute method: ${relative(this.projectRoot, file)}`,
            severity: "info",
            points: 2,
          });
        } else if (executeMatches.length > 1) {
          this.addResult({
            category: "Application Layer",
            message: `God use case detected (${executeMatches.length} execute methods): ${relative(this.projectRoot, file)}`,
            severity: "error",
            file: relative(this.projectRoot, file),
            points: -2,
          });
        }
      }
    }

    // Check 2: Repository interfaces (8 points)
    const portsPath = join(this.applicationPath, "ports");
    if (existsSync(portsPath)) {
      const portFiles = this.getTypeScriptFiles(portsPath);

      for (const file of portFiles) {
        const content = readFileSync(file, "utf-8");

        // Check for interface definition
        if (
          content.includes("export interface") &&
          content.includes("Repository")
        ) {
          points += 2;
          this.addResult({
            category: "Application Layer",
            message: `✅ Repository interface found: ${relative(this.projectRoot, file)}`,
            severity: "info",
            points: 2,
          });
        }
      }
    }

    // Check 3: DTOs (4 points)
    const dtosPath = join(this.applicationPath, "dtos");
    if (existsSync(dtosPath)) {
      const dtoFiles = this.getTypeScriptFiles(dtosPath);
      if (dtoFiles.length > 0) {
        points += 4;
        this.addResult({
          category: "Application Layer",
          message: `✅ Found ${dtoFiles.length} DTO file(s)`,
          severity: "info",
          points: 4,
        });
      }
    }

    // Check 4: Dependency direction (3 points)
    const applicationFiles = this.getTypeScriptFiles(this.applicationPath);
    let infraViolations = 0;

    for (const file of applicationFiles) {
      const content = readFileSync(file, "utf-8");

      // Check for Infrastructure imports
      const infraImports = content.match(/from ['"]@\/infrastructure/g);
      if (infraImports) {
        infraViolations += infraImports.length;
        this.addResult({
          category: "Application Layer",
          message: `Application imports Infrastructure (violation): ${relative(this.projectRoot, file)}`,
          severity: "error",
          file: relative(this.projectRoot, file),
          points: -1,
        });
      }
    }

    if (infraViolations === 0) {
      points += 3;
      this.addResult({
        category: "Application Layer",
        message: "✅ Application has zero Infrastructure imports",
        severity: "info",
        points: 3,
      });
    }

    this.score.application = points;
  }

  private async validateInfrastructureLayer(): Promise<void> {
    console.log("🔧 Validating Infrastructure Layer...");

    let points = 0;

    if (!existsSync(this.infrastructurePath)) {
      this.addResult({
        category: "Infrastructure Layer",
        message: "Infrastructure layer not found",
        severity: "warning",
        points: 0,
      });
      return;
    }

    // Check 1: Repository implementation (10 points)
    const repositoriesPath = join(
      this.infrastructurePath,
      "prisma",
      "repositories",
    );
    if (existsSync(repositoriesPath)) {
      const repoFiles = this.getTypeScriptFiles(repositoriesPath);

      for (const file of repoFiles) {
        const content = readFileSync(file, "utf-8");

        // Check for interface implementation
        if (content.includes("implements") && content.includes("Repository")) {
          points += 2;
          this.addResult({
            category: "Infrastructure Layer",
            message: `✅ Repository implements interface: ${relative(this.projectRoot, file)}`,
            severity: "info",
            points: 2,
          });
        }
      }
    }

    // Check 2: Mappers (5 points)
    const mappersPath = join(this.infrastructurePath, "prisma", "mappers");
    if (existsSync(mappersPath)) {
      const mapperFiles = this.getTypeScriptFiles(mappersPath);

      for (const file of mapperFiles) {
        const content = readFileSync(file, "utf-8");

        // Check for toDomain and toPersistence methods
        const hasToDomain = content.includes("toDomain");
        const hasToPersistence = content.includes("toPersistence");

        if (hasToDomain && hasToPersistence) {
          points += 2;
          this.addResult({
            category: "Infrastructure Layer",
            message: `✅ Mapper has toDomain/toPersistence: ${relative(this.projectRoot, file)}`,
            severity: "info",
            points: 2,
          });
        }
      }
    }

    // Check 3: Adapter pattern (5 points)
    const factoriesPath = join(this.infrastructurePath, "factories");
    if (existsSync(factoriesPath)) {
      const factoryFiles = this.getTypeScriptFiles(factoriesPath);
      if (factoryFiles.length > 0) {
        points += 5;
        this.addResult({
          category: "Infrastructure Layer",
          message: `✅ Found ${factoryFiles.length} factory/factories for DI`,
          severity: "info",
          points: 5,
        });
      }
    }

    this.score.infrastructure = points;
  }

  private async validateDeliveryLayer(): Promise<void> {
    console.log("🚀 Validating Delivery Layer...");

    let points = 0;

    // Check 1: Server Actions as thin controllers (8 points)
    const actionsFiles = this.findFiles(this.deliveryPath, /actions\.ts$/);

    for (const file of actionsFiles) {
      const content = readFileSync(file, "utf-8");

      // Check for direct Prisma usage
      if (content.includes("prisma.")) {
        this.addResult({
          category: "Delivery Layer",
          message: `Direct Prisma usage in Server Action: ${relative(this.projectRoot, file)}`,
          severity: "warning",
          file: relative(this.projectRoot, file),
          points: -2,
        });
      } else if (content.includes("UseCase")) {
        points += 2;
        this.addResult({
          category: "Delivery Layer",
          message: `✅ Server Action uses use cases: ${relative(this.projectRoot, file)}`,
          severity: "info",
          points: 2,
        });
      }
    }

    // Check 2: Pages as composition layer (6 points)
    const pageFiles = this.findFiles(this.deliveryPath, /page\.tsx$/);

    for (const file of pageFiles) {
      const content = readFileSync(file, "utf-8");

      // Check for direct Prisma usage
      if (content.includes("prisma.")) {
        this.addResult({
          category: "Delivery Layer",
          message: `Direct Prisma usage in page: ${relative(this.projectRoot, file)}`,
          severity: "error",
          file: relative(this.projectRoot, file),
          points: -2,
        });
      } else if (content.includes("UseCase") || content.includes("Factory")) {
        points += 2;
        this.addResult({
          category: "Delivery Layer",
          message: `✅ Page uses use cases/factory: ${relative(this.projectRoot, file)}`,
          severity: "info",
          points: 2,
        });
      }
    }

    this.score.delivery = points;
  }

  private async validateTesting(): Promise<void> {
    console.log("🧪 Validating Testing...");

    let points = 0;

    // Check 1: Domain tests (4 points)
    const domainTests = this.findFiles(this.domainPath, /\.test\.ts$/);
    if (domainTests.length > 0) {
      points += 4;
      this.addResult({
        category: "Testing",
        message: `✅ Found ${domainTests.length} domain test(s)`,
        severity: "info",
        points: 4,
      });
    }

    // Check 2: Use case tests (4 points)
    if (existsSync(this.applicationPath)) {
      const useCaseTests = this.findFiles(this.applicationPath, /\.test\.ts$/);
      if (useCaseTests.length > 0) {
        points += 4;
        this.addResult({
          category: "Testing",
          message: `✅ Found ${useCaseTests.length} use case test(s)`,
          severity: "info",
          points: 4,
        });
      }
    }

    // Check 3: Infrastructure tests (2 points)
    if (existsSync(this.infrastructurePath)) {
      const infraTests = this.findFiles(this.infrastructurePath, /\.test\.ts$/);
      if (infraTests.length > 0) {
        points += 2;
        this.addResult({
          category: "Testing",
          message: `✅ Found ${infraTests.length} infrastructure test(s)`,
          severity: "info",
          points: 2,
        });
      }
    }

    this.score.testing = points;
  }

  private calculateScore(): void {
    this.score.total =
      this.score.domain +
      this.score.application +
      this.score.infrastructure +
      this.score.delivery +
      this.score.testing;

    const percentage = (this.score.total / this.score.maxPoints) * 100;

    if (percentage >= 90) this.score.grade = "A";
    else if (percentage >= 75) this.score.grade = "B";
    else if (percentage >= 60) this.score.grade = "C";
    else if (percentage >= 45) this.score.grade = "D";
    else this.score.grade = "F";
  }

  printReport(): void {
    console.log("\n" + "=".repeat(80));
    console.log("📊 Clean Architecture Validation Report");
    console.log("=".repeat(80) + "\n");

    // Group results by severity
    const errors = this.results.filter((r) => r.severity === "error");
    const warnings = this.results.filter((r) => r.severity === "warning");
    const info = this.results.filter((r) => r.severity === "info");

    if (errors.length > 0) {
      console.log("❌ ERRORS:\n");
      errors.forEach((r) => {
        console.log(`  [${r.category}] ${r.message}`);
        if (r.file) console.log(`    File: ${r.file}`);
      });
      console.log();
    }

    if (warnings.length > 0) {
      console.log("⚠️  WARNINGS:\n");
      warnings.forEach((r) => {
        console.log(`  [${r.category}] ${r.message}`);
        if (r.file) console.log(`    File: ${r.file}`);
      });
      console.log();
    }

    if (info.length > 0) {
      console.log("✅ PASSED:\n");
      info.forEach((r) => {
        console.log(`  [${r.category}] ${r.message}`);
      });
      console.log();
    }

    // Score breakdown
    console.log("=".repeat(80));
    console.log("📈 Score Breakdown");
    console.log("=".repeat(80) + "\n");
    console.log(`  Domain Layer:         ${this.score.domain}/25 points`);
    console.log(`  Application Layer:    ${this.score.application}/25 points`);
    console.log(
      `  Infrastructure Layer: ${this.score.infrastructure}/20 points`,
    );
    console.log(`  Delivery Layer:       ${this.score.delivery}/20 points`);
    console.log(`  Testing:              ${this.score.testing}/10 points`);
    console.log(`  ${"─".repeat(40)}`);
    console.log(
      `  TOTAL:                ${this.score.total}/${this.score.maxPoints} points`,
    );
    console.log(`  GRADE:                ${this.score.grade}`);
    console.log();

    // Grade interpretation
    console.log("=".repeat(80));
    console.log("📚 Grade Interpretation");
    console.log("=".repeat(80) + "\n");

    const gradeInfo = {
      A: "Excellent Clean Architecture adherence. Minor improvements only.",
      B: "Good implementation with some violations. Refactor problem areas.",
      C: "Acceptable but needs improvement. Focus on Dependency Rule.",
      D: "Significant violations. Review core principles.",
      F: "Major architectural issues. Consider migration guide.",
    };

    console.log(`  ${gradeInfo[this.score.grade as keyof typeof gradeInfo]}\n`);
  }

  getExitCode(): number {
    if (this.score.grade === "A") return 0;
    if (this.score.grade === "B") return 1;
    return 2;
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  private getTypeScriptFiles(dir: string): string[] {
    if (!existsSync(dir)) return [];

    let files: string[] = [];
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(this.getTypeScriptFiles(fullPath));
      } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private findFiles(dir: string, pattern: RegExp): string[] {
    if (!existsSync(dir)) return [];

    let files: string[] = [];
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(this.findFiles(fullPath, pattern));
      } else if (pattern.test(entry)) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

// Main execution
async function main() {
  const validator = new CleanArchitectureValidator();
  await validator.validate();
  validator.printReport();
  process.exit(validator.getExitCode());
}

main().catch(console.error);
