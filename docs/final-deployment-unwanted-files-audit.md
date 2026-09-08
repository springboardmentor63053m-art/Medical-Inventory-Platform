# Final Deployment Unwanted Files Audit

## 1. Audit Metadata

* **Date/Time:** 2026-09-08 20:20:00 +05:30
* **Repository / Project Root:** `d:/Medical-Inventory-Platform`
* **Git Branch:** `team8-manikanta`
* **Git Commit:** `1d368837 Calculate usable stock analytics by medicine`
* **Audit Method:** Automated recursive filesystem tree traversal (`os.walk`), Git index querying (`git ls-files`, `git status --ignored`), cryptographic checksum deduplication analysis (MD5 hashing), and static codebase reference graph inspection across backend Java, frontend JS/JSX, Dockerfiles, Flyway migrations, configuration files, and shell scripts.
* **Audit Mode:** **READ-ONLY INSPECTION**.
* **Integrity Statement:** **Strictly read-only audit. No files were deleted, renamed, or modified anywhere in the repository.**

---

## 2. Repository Statistics

* **Total Files Inspected:** 15,576 files
* **Total Directories Inspected:** 1,688 directories
* **Total Repository Footprint:** 220,416,825 bytes (~210.21 MB)
* **Git Tracking Breakdown:**
  * Tracked in Git: 584 files
  * Untracked / Ignored: 14,992 files (primarily `frontend/node_modules/`, `backend/target/`, `frontend/dist/`, `scratch/`, and newly produced Postman test evidences)

### Files by Major Category

| Category / Location | File Count | Size (Bytes) | Size (MB) | Git Status | Primary Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Dependencies** (`frontend/node_modules/`) | 14,396 | 179,516,774 | ~171.20 MB | Ignored | Local Node.js package dependencies |
| **Backend Target Build** (`backend/target/`) | 307 | 27,698,060 | ~26.41 MB | Ignored | Compiled Java `.class`, test reports, `.jar` artifact |
| **Frontend Production Build** (`frontend/dist/`) | 29 | 1,170,188 | ~1.12 MB | Ignored | Vite production build bundle & static assets |
| **Developer Scratch Workspace** (`scratch/`) | 95 | 12,940,317 | ~12.34 MB | Untracked | Ad-hoc CDP automation scripts, debug snapshots, alias copies |
| **Backend Application & Test Source** (`backend/src/`) | 395 | 1,621,682 | ~1.55 MB | Tracked/Untracked | Java source (171), Flyway SQL (24), YML (5), `.gitkeep` (170), README (25) |
| **Backend Maven Tooling & Config** (`backend/` root & `.mvn/`) | 8 | 76,013 | ~0.07 MB | Mixed | `pom.xml`, `mvnw`, `mvnw.cmd`, wrapper properties, wrapper jar, package-lock |
| **Frontend Source Code & Config** (`frontend/src/` & configs) | 140 | 664,528 | ~0.63 MB | Tracked | React JSX components, pages, services, styles, configs |
| **Frontend Static Assets** (`frontend/public/`) | 23 | 39,267 | ~0.04 MB | Tracked | Medicine icons, UI placeholder images, favicon |
| **Postman Test Collections & Screenshots** (`postman/`) | 136 | 29,819,731 | ~28.44 MB | Mixed | 2 collections, 11 summary JSONs, 123 test execution screenshots |
| **Repository Root Files** (`[root]`) | 23 | 2,476,334 | ~2.36 MB | Mixed | Docker configs, env example, 11 root screenshots, test scripts, logs |
| **Database Schema, Migrations & Backup** (`database/`) | 14 | 239,376 | ~0.23 MB | Tracked | Binary backup, 9 legacy migrations, schema/seed stubs |
| **Project Documentation** (`docs/`) | 6 | 160 | < 0.01 MB | Tracked | Documentation skeleton headers |
| **Shell Automation Scripts** (`scripts/`) | 3 | 147 | < 0.01 MB | Tracked | Build, deploy, and setup shell script stubs |
| **IDE Configuration** (`.vscode/`) | 1 | 55 | < 0.01 MB | Tracked | VS Code Java compiler settings |
| **Backend Local Uploads** (`backend/uploads/`) | 2 | 53 | < 0.01 MB | Untracked | Sample supplier attachment upload test files |
| **Total** | **15,576** | **220,416,825** | **~210.21 MB** | | |

---

## 3. KEEP

These components are essential for application runtime, automated test execution, containerized production deployment, database schema evolution, verification evidence, or repository structure.

| Path / Component | File Count | Reason | Deployment/Test/Evidence Role |
| :--- | :--- | :--- | :--- |
| `backend/src/main/java/**/*.java` | 159 | Core Spring Boot application domain logic, REST controllers, DTOs, entities, repositories, services, security, and exception handlers. | **Runtime & Deployment:** Required for compiling `app.jar`. |
| `backend/src/test/java/**/*.java` | 12 | Automated JUnit 5 / Spring Boot test suite covering unit tests, controller web layer tests, DTO schema naming, and integration tests. | **Automated Testing:** Required for CI verification (`mvn test`). |
| `backend/src/main/resources/db/migration/V1__*.sql` through `V24__*.sql` | 24 | Complete Flyway database schema evolution and seeding scripts (V1 through V24). | **Runtime & Deployment:** Required for database initialization and migrations on startup. |
| `backend/src/main/resources/application*.yml` | 5 | Main application configuration (`application.yml`) and profile configs (`dev`, `prod`, `test`, `h2`). | **Runtime & Deployment:** Defines database connections, JWT secrets, server ports, and Flyway settings. |
| `backend/pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties` | 4 | Maven project descriptor, build lifecycle configuration, and official wrapper wrappers. | **Deployment & CI:** Required for multi-stage Docker build (`RUN mvn clean package -DskipTests`). |
| `backend/src/main/java/**/.gitkeep` (in empty packages) | 118 | Structural directory place-markers in empty sub-packages (e.g. `mapper`, `specification`, `validator`). | **Repository Architecture:** Preserves package architecture for clean modularity in Git. |
| `frontend/src/**/*.{js,jsx,css,svg,png,json}` | 132 | React 18 frontend source code: feature modules, dashboard, prescription POS, inventory, reports, layouts, routing, API services. | **Runtime & Deployment:** Required for compiling frontend production bundle (`npm run build`). |
| `frontend/package.json`, `package-lock.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `index.html`, `frontend/.env.example` | 8 | Node.js build configuration, dependencies lock, Vite bundling pipeline, Tailwind styling, and HTML entry point. | **Deployment & CI:** Required for multi-stage Docker frontend build stage (`RUN npm ci && npm run build`). |
| `frontend/public/**/*.{ico,png}` | 23 | Static frontend assets served directly (medicine brand artwork, delivery form placeholders, favicon). | **Runtime UI:** Required by UI medicine cards and placeholder fallback rendering. |
| `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore`, `README.md` | 5 | Container orchestrations, multi-stage Dockerfile, Git ignore definitions, environment templates, and project overview. | **Infrastructure & Deployment:** Primary production orchestration via `docker compose up --build`. |
| `postman/MediStock_API_Testing.postman_collection.json` | 1 | Comprehensive Postman test collection (174 KB) covering 11 modules, authentication flows, authorization matrix, and business workflows. | **API Verification & Milestone Evidence:** Official test suite for project submission. |
| `postman/01 Authentication/` through `11 Authorization/` (`summary.json` + `*.png`) | 134 | 11 execution run summaries and 123 Postman HTTP test execution screenshots. | **Project Evaluation Evidence:** Official proof of end-to-end API test suite validation. |
| `frontend/node_modules/` | 14,396 | Local npm dependencies cache. Ignored by Git. | **Development Runtime:** Required for local Vite dev server (`npm run dev`) if running outside Docker. |

*Total KEEP files (excluding `frontend/node_modules`):* **625 files**  
*Total KEEP files (including `frontend/node_modules`):* **15,021 files**

---

## 4. REVIEW

The following files are candidates for review. They are either historical remnants, incomplete duplicates, development scratch scripts, or redundant directory markers. **No action should be taken on these without explicit team approval.**

| Path | File Type | Size | Git Status | Category | Why Suspicious | Code/Config References | Deployment Role | Recommendation | Risk if Removed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `token_supplier.txt` | TXT | 2 B | Tracked | Stale Auth Artifact | Contains 2 corrupted bytes (`\xff\xfe`). Stale residual token file from early supplier testing. | 0 references | None | **REVIEW** (Schedule for Git deletion) | Low. Completely unused. |
| `backend/package-lock.json` | JSON | 92 B | Tracked | Erroneous Config | Empty npm lockfile (`name: "backend"`, empty packages) in a Maven Java backend directory. | 0 references | None | **REVIEW** (Remove from Git tracking) | Low. Backend uses Maven, not npm. |
| `inspect_enums.sql` | SQL | 250 B | Untracked | Debug SQL | Ad-hoc SQL query script used locally to inspect database enum values. | 0 references | None | **REVIEW** (Archive to developer notes or keep local) | Low. Ad-hoc diagnostic tool. |
| `scratch_endpoints.json` | JSON | 136,150 B | Untracked | Generated Swagger Dump | Raw OpenAPI 3.0.1 JSON export from `http://localhost:8080/v3/api-docs`. | 0 references | None | **REVIEW** (Move to docs or remove; live Swagger serves this) | Low. Readily regenerated from live app. |
| `test_all_safe.py` | Python | 8,203 B | Untracked | Local Smoke Script | Ad-hoc Python script testing live endpoints with `urllib`. | 0 references | None | **REVIEW** (Relocate to `scripts/testing/` or keep local) | Medium. Useful developer manual smoke test. |
| `test_multipart.py` | Python | 1,851 B | Untracked | Local Smoke Script | Ad-hoc script testing supplier attachment multipart upload. | 0 references | None | **REVIEW** (Relocate to `scripts/testing/` or keep local) | Low. Unit & Postman tests already cover this. |
| `test_rx_order.py` | Python | 1,887 B | Untracked | Local Smoke Script | Ad-hoc script testing prescription order placement. | 0 references | None | **REVIEW** (Relocate to `scripts/testing/` or keep local) | Low. Unit & Postman tests already cover this. |
| `database/backup/medistock.backup` | Binary | 194,877 B | Tracked | Database Dump | 194 KB binary PostgreSQL dump committed to Git. Bloats repo. | 0 references | None | **REVIEW** (Verify if needed for offline seed; remove from Git) | Medium. Team might rely on it as fallback data. |
| `database/migration/*.sql` (9 files) | SQL | 23,439 B | Tracked | Partial Duplicate Migrations | Contains 9 migration scripts (V1-V6, V9, V10, V23). Flyway actually runs from `backend/.../db/migration/` (V1-V24). | 0 references (Flyway uses classpath) | None | **REVIEW** (Harmonize with backend migrations or remove) | Medium. Outdated duplicate may confuse maintainers. |
| `database/schema/01_schema_init.sql` | SQL | 86 B | Tracked | Obsolete Schema Stub | Contains MySQL syntax (`CREATE DATABASE IF NOT EXISTS medistock; USE medistock;`). App uses PostgreSQL. | 0 references | None | **REVIEW** (Update to PostgreSQL or remove) | Low. Never executed by PostgreSQL. |
| `database/schema/02_indexes_constraints.sql` | SQL | 40 B | Tracked | Empty Placeholder | Placeholder comment `-- Indexes and Constraints Placeholder`. | 0 references | None | **REVIEW** (Remove or populate) | Low. Empty file. |
| `database/seed/01_seed_data.sql` | SQL | 26 B | Tracked | Empty Placeholder | Placeholder comment `-- Seed Data Placeholder`. | 0 references | None | **REVIEW** (Remove or populate) | Low. Empty file. |
| `database/scripts/init-db.sh` | Shell | 46 B | Tracked | Shell Stub | Contains only `echo 'Initializing Database...'`. | 0 references | None | **REVIEW** (Implement or remove) | Low. Stub only. |
| Root screenshots (`Screenshot 2026-07-30 *.png`, 11 files) | PNG | 1,939,641 B | Tracked | Historical UI Proofs | 11 screenshots from July 30 committed to repo root. Not linked in README. | 0 references | None | **REVIEW** (Move to `docs/evidence/milestone-2/` or archive) | Low. Root clutter, but historical submission evidence. |
| `postman/MediStock.postman_collection.json` | JSON | 79 B | Tracked | Redundant Empty Collection | Placeholder collection with empty `item: []`. Superseded by `MediStock_API_Testing.postman_collection.json`. | 0 references | None | **REVIEW** (Replace tracked file with official testing collection) | Low. Empty skeleton. |
| `backend/src/main/java/com/medistock/common/*/README.md` (25 files) | MD | ~650 B | Tracked | Package Header Stubs | 1-line markdown headers (e.g. `# Shared Audit Package`) in 25 common subpackages. | 0 references | None | **REVIEW** (Keep if team likes subpackage docs, or remove) | Low. Informational stubs. |
| Populated `.gitkeep` files in `backend/src/main/java/` (52 files) | Gitkeep | 0 B | Tracked | Redundant Directory Marker | `.gitkeep` files in folders that now contain compiled Java classes. | 0 references | None | **REVIEW** (Remove redundant `.gitkeep` where code exists) | Low. Folders already tracked by Java files. |
| `scripts/{build,deploy,setup}.sh` (3 files) | Shell | 147 B | Tracked | Shell Stubs | Contain only single echo statements (`echo 'Building full stack app...'`). | 0 references | None | **REVIEW** (Flesh out with real commands or remove) | Low. Shell stubs. |
| `docs/*.md` (6 files: `API`, `Architecture`, `Database`, `Deployment`, `DeveloperGuide`, `UserGuide`) | MD | 160 B | Tracked | Documentation Stubs | Contain only 1-line top level markdown headings. | 0 references | None | **REVIEW** (Populate with actual documentation before final release) | Low. Stubs. |
| `.vscode/settings.json` | JSON | 55 B | Tracked | Editor Setting | VS Code setting (`java.compile.nullAnalysis.mode: automatic`). Tracked despite `.gitignore`. | 0 references | None | **REVIEW** (Remove from Git or untrack) | Low. Developer-specific IDE preference. |
| `backend/.mvn/wrapper/maven-wrapper.jar` | JAR | 63,029 B | Untracked | Maven Wrapper Binary | Ignored by `.gitignore` (`*.jar`), but required if executing `./mvnw` on clean systems without Maven. | Referenced by `mvnw` | Build tool | **REVIEW** (Recommend `git add -f` or keep for local builds) | Medium. Without it, `./mvnw` downloads wrapper. |

*Total REVIEW Candidates:* **121 files**

---

## 5. SAFE TO REMOVE

The following files are strictly non-deployment, non-runtime artifacts with clear evidence that they are obsolete scratch, temporary logs, or reproducible generated build outputs. **They are documented here for audit purposes only and have NOT been removed.**

| Path | File Type | Size (Bytes) | Category | Evidence | Why Safe | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend-build.log` | Log | 911 B | Stale Build Output | Root-level log file from Vite build (`built in 8.07s`). Not tracked in Git. Matches `.gitignore` `*.log`. | Local terminal output log; no application, test, or deployment dependency. | None |
| `scratch/__pycache__/builder_core.cpython-314.pyc` | Python Bytecode | 3,496 B | Generated Bytecode | Compiled Python 3.14 bytecode generated by running scratch scripts. | Automatically regenerated when Python runs. | None |
| `scratch/__pycache__/build_complete_v3.cpython-314.pyc` | Python Bytecode | 37,964 B | Generated Bytecode | Compiled Python 3.14 bytecode. | Automatically regenerated when Python runs. | None |
| `scratch/pre_normalization_alias_screenshots/*.png` (44 files) | PNG | 9,800,242 B | Duplicate Screenshots | Exact MD5 byte-for-byte matches of images in `postman/06 Purchases/`, `postman/09 Analytics/`, `postman/10 Reports/`, and `postman/11 Authorization/`. | Pure redundant duplicates of the canonical Postman test evidence in `postman/`. | None |
| `scratch/*.png` (12 root debug snapshots: `admin_login_test.png`, `both_bodies.png`, `pharmacist_test.png`, `postman_after_replace.png`, `postman_live.png`, `postman_tab.png`, `test_current_postman.png`, `test_medicines_debug.png`, `test_med_01.png`, `test_results_view.png`, `test_validate_auth.png`, `test_variables_pane.png`) | PNG | 2,704,917 B | Scratch Debug Captures | Ad-hoc full window captures created during Postman Chrome DevTools Protocol (CDP) script development. | One-off debugging captures; canonical evidence is in `postman/`. | None |
| `scratch/*.py` (37 CDP automation and inspection scripts) | Python | 393,698 B | Local Automation Scripts | Scratch automation scripts (`build_complete_v2.py`, `run_01_authentication.py`, `send_and_capture.py`, `test_cdp.py`, etc.) used to drive Postman via CDP. | Developer utilities used to run requests; collection and screenshots in `postman/` are the deliverables. | None |
| `backend/uploads/supplier-attachments/*.txt` (2 files: `1788799403867_invoice.txt`, `1788799403952_spec.txt`) | TXT | 53 B | Test Upload Artifacts | Sample text files created during endpoint testing of multipart supplier invoice/spec upload. | Test uploads; real deployments start with clean storage volumes. | None |
| `frontend/dist/` (29 files) | Generated Web Assets | 1,170,188 B | Generated Build Output | Compiled HTML, CSS, and JS chunks produced by `vite build`. Ignored by `.gitignore`. | Rebuilt inside Docker during `RUN npm run build`. Safe to clean locally. | Low (Rebuildable via `npm run build`) |
| `backend/target/` (307 files) | Generated Java Artifacts | 27,698,060 B | Generated Build Output | Compiled `.class` files, surefire test reports, and `medistock-backend-0.0.1-SNAPSHOT.jar`. Ignored by `.gitignore`. | Rebuilt inside Docker during `RUN mvn clean package`. Safe to clean locally. | Low (Rebuildable via `mvn clean`) |

*Total SAFE TO REMOVE Candidates:* **434 files**

---

## 6. Duplicate / Redundant Files

The audit performed cryptographic MD5 hash comparison across all files in the repository. The following notable duplicate / redundant groups were identified:

### 1. Scratch vs. Canonical Postman Screenshots (44 Files)
* **Locations:** `scratch/pre_normalization_alias_screenshots/` vs `postman/06 Purchases/`, `postman/09 Analytics/`, `postman/10 Reports/`, and `postman/11 Authorization/`.
* **Nature:** Exact byte-for-byte duplicate PNG files (same file size, same MD5 hash).
* **Explanation:** When Postman test runs were normalized to canonical endpoint naming, a snapshot of 44 screenshots was archived in `scratch/pre_normalization_alias_screenshots/`. The canonical versions in `postman/` are the official submission deliverables. The copies in `scratch/` are 100% redundant.

### 2. Database Migrations (`database/migration/` vs `backend/src/main/resources/db/migration/`) (9 Files)
* **Locations:** `database/migration/V1` through `V23` (9 files) vs `backend/.../db/migration/V1` through `V24` (24 files).
* **Nature:** 8 files are exact byte-for-byte MD5 matches (`V1`, `V2`, `V3`, `V5`, `V6`, `V9`, `V10`, `V23`). 1 file (`V4__seed_medical_inventory_data.sql`) differs slightly (8,093 B vs 8,500 B).
* **Explanation:** The backend Spring Boot application Flyway configuration (`application.yml`) is explicitly set to:
  ```yaml
  spring:
    flyway:
      locations: classpath:db/migration
  ```
  Flyway exclusively reads from `backend/src/main/resources/db/migration/`. The folder `database/migration/` contains only 9 outdated scripts (missing 15 migrations: V7, V8, V11-V22, V24). It is an unmaintained duplicate.

### 3. Redundant `.gitkeep` Files in Populated Directories (52 Files)
* **Locations:** `backend/src/main/java/com/medistock/**/.gitkeep`
* **Nature:** 52 `.gitkeep` files exist in directories that now contain actual Java source code files (e.g., `AnalyticsController.java`, `InventoryController.java`, `StockMovementController.java`).
* **Explanation:** Git requires `.gitkeep` only to retain empty directories. Once source code files exist within those directories, the `.gitkeep` file is redundant.

### 4. Postman Collections (1 Redundant Skeleton)
* **Locations:** `postman/MediStock.postman_collection.json` (79 B, tracked) vs `postman/MediStock_API_Testing.postman_collection.json` (174 KB, untracked).
* **Nature:** `MediStock.postman_collection.json` contains `{"info": {"name": "MediStock API Collection"}, "item": []}`.
* **Explanation:** An empty collection skeleton was initially tracked in Git. The actual full test collection with all requests, test assertions, and environment variables was saved as `MediStock_API_Testing.postman_collection.json`. The tracked skeleton is redundant and misleading.

### 5. Frontend Dist Image Duplicates (22 Files)
* **Locations:** `frontend/dist/images/` vs `frontend/public/images/`
* **Nature:** Exact byte-for-byte duplicate image files.
* **Explanation:** Vite automatically copies static assets from `frontend/public/` to `frontend/dist/` during the build step. This duplication is normal for generated build output.

---

## 7. Generated / Temporary Artifacts

Generated and temporary artifacts are distinguished from genuinely suspicious source files:

| Artifact Group | File Count | Size (Bytes) | Nature | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| `backend/target/` | 307 | 27,698,060 B | Maven compile & surefire test output | Clean with `mvn clean` prior to packaging |
| `frontend/dist/` | 29 | 1,170,188 B | Vite production bundle | Clean with `rmdir /s dist` prior to packaging |
| `scratch/__pycache__/` | 2 | 41,460 B | Python 3.14 compiled bytecode | Safe to delete |
| `frontend-build.log` | 1 | 911 B | Local terminal build log | Safe to delete |
| `backend/uploads/` | 2 | 53 B | Local test upload attachments | Safe to delete |
| `scratch/` (scripts & screenshots) | 93 | 12,898,857 B | Developer test harness & screen proofs | Safe to archive or remove |

---

## 8. Deployment Risk Assessment

### CRITICAL: Must NOT Be Removed Before Deployment

1. **Flyway Migrations (`backend/src/main/resources/db/migration/V1` to `V24`):**
   * Do NOT touch or remove any migration in `backend/.../db/migration/`. Flyway validates migration checksums on application startup; deleting or editing any migration will cause database startup failure.
2. **Postman Deliverables (`postman/MediStock_API_Testing.postman_collection.json` & `postman/01` through `11`):**
   * These files constitute the core API testing and evaluation evidence. Although untracked in Git currently, they must be preserved and committed to version control.
3. **Empty Folder Markers (118 `.gitkeep` files in empty backend packages):**
   * If these `.gitkeep` files are deleted, Git will prune the empty directories, which may break IDE package structures or future expansion branches.
4. **Static UI Assets (`frontend/public/`):**
   * Images in `frontend/public/images/` must NOT be deleted. The UI references them dynamically for medicine categories and default fallbacks.
5. **Multi-Stage Build Dependencies (`Dockerfile`):**
   * In `Dockerfile`, frontend build executes `RUN npm ci`. The files `frontend/package.json` and `frontend/package-lock.json` are mandatory.

### Crucial Deployment Observation: `.dockerignore` Missing
> [!WARNING]
> The repository currently lacks a `.dockerignore` file. In `Dockerfile`, line 12 executes:
> ```dockerfile
> COPY frontend/ ./
> ```
> Without `.dockerignore`, Docker will copy local `frontend/node_modules/` (~171 MB) and `frontend/dist/` into the Docker build context. It is strongly recommended to add a `.dockerignore` excluding `node_modules`, `target`, `dist`, `.git`, and `scratch` before final production build.

---

## 9. Recommended Cleanup Order

When cleanup is authorized, follow this conservative 4-phase sequence:

### Phase 1: Safe Temporary Artifacts (Zero Risk)
* Remove `frontend-build.log` from repo root.
* Remove `scratch/__pycache__/` compiled bytecode.
* Remove dummy test uploads in `backend/uploads/supplier-attachments/`.

### Phase 2: Confirmed Generated Build Artifacts (Zero Deployment Risk)
* Run `mvn clean` in `backend/` to remove `backend/target/`.
* Delete `frontend/dist/` (rebuilt deterministically by Vite).

### Phase 3: Confirmed Duplicates & Scratch Directory (Zero Runtime Risk)
* Delete `scratch/pre_normalization_alias_screenshots/` (44 duplicate screenshots).
* Delete or archive the remaining developer scratch scripts and debug screenshots in `scratch/`.

### Phase 4: Reviewed Tracked Items (Requires Team Approval & Git Commit)
1. **Postman Collection Alignment:** Commit `postman/MediStock_API_Testing.postman_collection.json` and the 11 evidence folders. Remove or replace the empty `postman/MediStock.postman_collection.json`.
2. **Obsolete Database Folder:** Deprecate or remove `database/migration/` (outdated duplicate) and `database/backup/medistock.backup` from Git tracking after confirming no developer needs offline seed.
3. **Redundant Root Files:** Relocate root test scripts (`test_all_safe.py`, `test_multipart.py`, `test_rx_order.py`) to `scripts/testing/` or developer tools; remove `token_supplier.txt` and `backend/package-lock.json`.
4. **Root Screenshots:** Move `Screenshot 2026-07-30 *.png` (11 files) into `docs/evidence/milestone-2/` to declutter the root.
5. **Redundant `.gitkeep`:** Remove the 52 `.gitkeep` files in populated Java directories while keeping the 118 `.gitkeep` files in empty directories.

---

## 10. Final Audit Summary

Exact file counts across all 15,576 inspected repository files:

* **KEEP:** **15,021** (625 project core files + 14,396 local `frontend/node_modules` dependencies)
* **REVIEW:** **121** (Tracked stubs, historical screenshots, obsolete duplicates, root test scripts)
* **SAFE TO REMOVE:** **434** (Target build, dist build, scratch directory, pycache, build log, test uploads)
* **DUPLICATE / REDUNDANT:** **106** (44 scratch duplicates + 9 database migrations + 52 redundant gitkeep + 1 empty postman collection)
* **GENERATED:** **339** (307 backend target + 29 frontend dist + 2 pycache + 1 frontend build log)
* **TEMPORARY:** **98** (95 scratch files + 1 build log + 2 test uploads)

### Verification of Audit Invariants

* **Files actually deleted:** **0** (Verified)
* **Files actually modified:** **0** (Verified)
* **Files actually renamed:** **0** (Verified)

*Report prepared autonomously by Antigravity Final Deployment Audit Engine.*
