# Final Deployment Readiness Report

## 1. Executive Summary

This report delivers a rigorous, evidence-based verification of deployment readiness and cleanup safety for the **Medical-Inventory-Platform**, based on the findings documented in `docs/final-deployment-unwanted-files-audit.md`.

* **Audit Mode:** Strictly read-only verification.
* **Integrity Guarantee:** Zero files were deleted, modified, or renamed during this inspection. No application logic, database migrations, configuration files, test scripts, or Postman assets were altered.
* **Key Findings:**
  1. **Docker Build Risk:** No `.dockerignore` file exists in the repository. Because `docker-compose.yml` specifies `context: .`, the entire 210 MB repository—including 171 MB of host `frontend/node_modules/`, 27 MB of `backend/target/`, 12 MB of `scratch/`, logs, and screenshots—is transferred to the Docker daemon. In `Dockerfile`, `COPY frontend/ ./` dangerously copies host node_modules into the container filesystem after `npm ci`. Adding a `.dockerignore` prior to deployment is **REQUIRED**.
  2. **Database Deployment Safety:** The application's Spring Boot configuration explicitly defines `flyway.locations: classpath:db/migration`. Flyway exclusively uses `backend/src/main/resources/db/migration/` (V1 to V24). Neither `docker-compose.yml`, `Dockerfile`, `pom.xml`, nor any application code references the `database/` folder or `database/backup/medistock.backup`. The `database/migration/` folder is an incomplete, obsolete 9-file copy of early migrations.
  3. **Postman & Evidence Verification:** The canonical API test collection is `postman/MediStock_API_Testing.postman_collection.json` (174 KB), containing **120 requests across 11 modules**, evidenced by **11 summary JSONs and 123 execution screenshots**. The tracked `postman/MediStock.postman_collection.json` (79 B) is an empty skeleton with 0 requests. Deleting or replacing this 79-byte placeholder has zero functional risk.
  4. **Scratch & Temporary Artifacts:** All 95 files in `scratch/` (including 44 exact duplicate screenshots in `pre_normalization_alias_screenshots/` and 37 CDP scripts), `frontend-build.log`, and 2 test uploads in `backend/uploads/` are completely unreferenced and safe to remove before packaging.
  5. **Build Reproducibility:** Both `backend/target/` and `frontend/dist/` are compiled from source inside multi-stage Docker builds (`RUN mvn clean package` and `RUN npm run build`). Deployment does not expect or depend on prebuilt local artifacts.

---

## 2. Docker Build Context Risk

### 2.1 Confirmation of `.dockerignore` Absence
* An exhaustive repository search confirms that **no `.dockerignore` file exists** in the repository root or in any subdirectory.

### 2.2 Inspection of `docker-compose.yml` and `Dockerfile`
* In `docker-compose.yml` (lines 17–20):
  ```yaml
  backend:
    build:
      context: .
      dockerfile: Dockerfile
  ```
  The context is set to `.` (the entire workspace root).
* In `Dockerfile` (multi-stage build):
  * **Stage 1 (`backend-build`):**
    ```dockerfile
    COPY backend/pom.xml .
    COPY backend/src ./src
    RUN mvn clean package -DskipTests
    ```
  * **Stage 2 (`frontend-build`):**
    ```dockerfile
    COPY frontend/package*.json ./
    RUN npm ci
    COPY frontend/ ./
    RUN npm run build
    ```
  * **Stage 3 (Runtime):**
    ```dockerfile
    COPY --from=backend-build /app/backend/target/*.jar app.jar
    ```

### 2.3 Exact Files Entering Docker Build Context
Without `.dockerignore`, the Docker CLI tar-archives the **entire working directory** (15,576 files, ~210.21 MB) and sends it over the Docker daemon socket:

| Artifact / Directory | Files Included | Context Overhead | Specific Risk During Build |
| :--- | :--- | :--- | :--- |
| `frontend/node_modules/` | 14,396 files | **171.20 MB** | **HIGH RISK.** In Stage 2, `COPY frontend/ ./` executes *after* `RUN npm ci`. This copies host Windows/macOS node_modules over the Linux Alpine container node_modules, potentially corrupting platform-native binary bindings (e.g. Rollup, esbuild, lightningcss) or causing unexpected build crashes. |
| `backend/target/` | 307 files | **26.41 MB** | **MEDIUM RISK.** Uploads 26 MB of host `.class` files, surefire reports, and local JARs into the daemon context. While Stage 1 runs `mvn clean package`, transferring this data slows down context generation. |
| `scratch/` | 95 files | **12.34 MB** | **LOW RISK.** Developer automation scripts, debug captures, and pre-normalization screenshots are sent to the daemon. Unnecessary context bloat. |
| `postman/` | 136 files | **28.44 MB** | **LOW RISK.** 123 PNG screenshots and collections are sent to the daemon. Bloats context by ~28 MB. |
| Root screenshots (`Screenshot 2026-07-30 *.png`) | 11 files | **1.94 MB** | **LOW RISK.** Historical UI captures bundled into daemon context. |
| `frontend/dist/` | 29 files | **1.12 MB** | **MEDIUM RISK.** In Stage 2, `COPY frontend/ ./` copies stale host build output into the container prior to `npm run build`. |
| `frontend-build.log` & temporary logs | 1 file | 911 B | **LOW RISK.** Terminal log unnecessarily transferred. |

---

## 3. Git Tracking Status

A systematic classification of all cleanup and review candidates:

| Candidate Path / Group | Total Files | Total Size | Git Status | `.gitignore` Rule Match | Deployment Criticality |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend-build.log` | 1 | 911 B | **Untracked** | Matches `*.log` (line 19) | Stale log; not needed. |
| `scratch/__pycache__/` | 2 | 41,460 B | **Untracked** | Implicit Python cache | Generated bytecode; not needed. |
| `scratch/pre_normalization_alias_screenshots/` | 44 | 9,800,242 B | **Untracked** | None | Redundant screenshot copies. |
| `scratch/*.png` (root debug captures) | 12 | 2,704,917 B | **Untracked** | None | One-off CDP debugging snapshots. |
| `scratch/*.py` (CDP automation scripts) | 37 | 393,698 B | **Untracked** | None | Local helper tools. |
| `backend/uploads/supplier-attachments/` | 2 | 53 B | **Untracked** | None | Sample test uploads. |
| `frontend/dist/` | 29 | 1,170,188 B | **Ignored** | Matches `dist/` (line 4) | Rebuilt in container via Vite. |
| `backend/target/` | 307 | 27,698,060 B | **Ignored** | Matches `target/` (line 3) | Rebuilt in container via Maven. |
| `frontend/node_modules/` | 14,396 | 179,516,774 B | **Ignored** | Matches `node_modules/` (line 2) | Rebuilt in container via `npm ci`. |
| `token_supplier.txt` | 1 | 2 B | **Tracked** | None | Corrupted artifact (`\xff\xfe`); tracked in Git. |
| `backend/package-lock.json` | 1 | 92 B | **Tracked** | None | Empty dummy npm lockfile; tracked in Git. |
| `database/backup/medistock.backup` | 1 | 194,877 B | **Tracked** | None | Binary database dump; tracked in Git. |
| `database/migration/*.sql` (9 files) | 9 | 23,439 B | **Tracked** | None | Incomplete duplicate migrations; tracked in Git. |
| `database/schema/`, `seed/`, `scripts/` (4 files) | 4 | 198 B | **Tracked** | None | Early MySQL/echo stubs; tracked in Git. |
| Root screenshots (`Screenshot 2026-07-30 *.png`) | 11 | 1,939,641 B | **Tracked** | None | Historical UI proofs; tracked in Git. |
| `postman/MediStock.postman_collection.json` | 1 | 79 B | **Tracked** | None | Empty placeholder collection; tracked in Git. |
| `backend/src/main/java/com/medistock/common/*/README.md` | 25 | ~650 B | **Tracked** | None | 1-line package header stubs; tracked in Git. |
| Populated `.gitkeep` files in `backend/src/main/java/` | 52 | 0 B | **Tracked** | None | Redundant directory markers; tracked in Git. |
| Empty `.gitkeep` files in `backend/src/main/java/` | 118 | 0 B | **Tracked** | None | **Structural markers; required for empty packages.** |
| `scripts/{build,deploy,setup}.sh` | 3 | 147 B | **Tracked** | None | 2-line echo stubs; tracked in Git. |
| `docs/*.md` (6 skeleton documents) | 6 | 160 B | **Tracked** | None | 1-line markdown titles; tracked in Git. |
| `.vscode/settings.json` | 1 | 55 B | **Tracked** | Matches `.vscode/` (line 12) | Committed IDE settings. |
| `backend/.mvn/wrapper/maven-wrapper.jar` | 1 | 63,029 B | **Ignored** | Matches `*.jar` (line 6) | Maven wrapper binary; needed for `./mvnw`. |
| `inspect_enums.sql` | 1 | 250 B | **Untracked** | None | Local ad-hoc SQL queries. |
| `scratch_endpoints.json` | 1 | 136,150 B | **Untracked** | None | Local OpenAPI JSON dump. |
| Root test scripts (`test_all_safe.py`, `test_multipart.py`, `test_rx_order.py`) | 3 | 11,941 B | **Untracked** | None | Local Python endpoint smoke tests. |
| `postman/MediStock_API_Testing.postman_collection.json` | 1 | 174,326 B | **Untracked** | None | **Official canonical Postman test suite.** |
| `postman/01` to `11` (`summary.json` + `*.png`) | 134 | 29,645,326 B | **Untracked** | None | **Official evaluation test run evidence.** |

---

## 4. Database Deployment Safety

### 4.1 Detailed Verification of Database Directories
A full static scan across all Java source code, application YAML configurations, Dockerfiles, docker-compose configurations, and shell scripts was performed to trace any references to database paths:

| Path | Contents | Referenced by Spring Boot? | Referenced by Docker? | Referenced by Flyway? | Deployment Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/` | 24 Flyway scripts (`V1` to `V24`) | **YES** (`application.yml`) | **YES** (Copied into JAR) | **YES** (`classpath:db/migration`) | **CRITICAL RUNTIME.** Database schema creation, seeds, enums, POS, and supplier workflows. |
| `database/migration/` | 9 Flyway scripts (`V1`–`V6`, `V9`, `V10`, `V23`) | **NO** | **NO** | **NO** | **OBSOLETE CLONE.** Contains only 9 migrations; 8 are identical byte-for-byte to `backend/.../db/migration/`, and `V4` has a minor difference. 15 migrations are completely missing. |
| `database/backup/medistock.backup` | 194.8 KB binary PostgreSQL dump | **NO** | **NO** | **NO** | **STANDALONE DUMP.** Not mounted into PostgreSQL container or referenced anywhere. |
| `database/schema/01_schema_init.sql` | 86 B SQL file | **NO** | **NO** | **NO** | **INCOMPATIBLE STUB.** Uses MySQL commands (`CREATE DATABASE IF NOT EXISTS medistock; USE medistock;`), invalid in PostgreSQL. |
| `database/schema/02_indexes_constraints.sql` | 40 B SQL file | **NO** | **NO** | **NO** | Empty placeholder comment (`-- Indexes and Constraints Placeholder`). |
| `database/seed/01_seed_data.sql` | 26 B SQL file | **NO** | **NO** | **NO** | Empty placeholder comment (`-- Seed Data Placeholder`). |
| `database/scripts/init-db.sh` | 46 B Shell script | **NO** | **NO** | **NO** | Stub echo script (`echo 'Initializing Database...'`). |

### 4.2 Proof of Database Safety
1. **Flyway Runtime Configuration:** `backend/src/main/resources/application.yml` explicitly states:
   ```yaml
   spring:
     flyway:
       enabled: true
       baseline-on-migrate: true
       repair-on-migrate: true
       locations: classpath:db/migration
   ```
   Flyway searches the classpath for `db/migration`. In a Maven build, `backend/src/main/resources/db/migration` is packaged into `BOOT-INF/classes/db/migration/`.
2. **Container Composition:** In `docker-compose.yml`, service `postgresdb` runs official `postgres:17-alpine` with a named volume `postgres_data_v17:/var/lib/postgresql/data`. There is no bind mount to `database/` or `/docker-entrypoint-initdb.d/`.
3. **Conclusion:** Removing or archiving `database/migration/` and other `database/` stubs poses **zero risk to application startup or Docker deployment**. However, because these files are tracked in Git, they should be cleaned via deliberate Git commits rather than uncoordinated filesystem deletion.

---

## 5. Postman / Evidence Safety

### 5.1 Canonical vs. Obsolete Collections
* **Canonical Collection:** `postman/MediStock_API_Testing.postman_collection.json`
  * **Info Name:** `"MediStock API Testing COMPLETE"`
  * **Total Request Count:** **120 requests**
  * **Total Folders:** **11 modules** (`01 Authentication`, `02 Medicines`, `03 Suppliers`, `04 Inventory`, `05 Stock Movements`, `06 Purchases`, `07 Expiry`, `08 Notifications`, `09 Analytics`, `10 Reports`, `11 Authorization`)
  * **Scope:** Covers complete RBAC matrix (Admin, Staff, Pharmacist, Supplier), purchase orders, customer POS, prescription order workflow, CSV exports, analytics, and multipart attachments.
* **Obsolete / Placeholder Collection:** `postman/MediStock.postman_collection.json`
  * **Info Name:** `"MediStock API Collection"`
  * **File Size:** **79 bytes**
  * **Total Request Count:** **0 requests** (`"item": []`)
  * **Git Status:** Tracked in Git.

### 5.2 Test Evidence Linkage
* The 11 subdirectories in `postman/` (`01 Authentication/` through `11 Authorization/`) contain **11 `summary.json` files and 123 PNG screenshot files**.
* These screenshots map 1-to-1 to the 120 requests in `MediStock API Testing COMPLETE`. Each screenshot displays the live HTTP request, URL, headers, 200/201/400/403 status code, and JSON response body matching the test assertions.
* **Impact of Removing the 79-Byte Collection:** Removing or replacing `postman/MediStock.postman_collection.json` will have **zero negative effect** on test runs, evidence validation, or deployment. In fact, replacing it with the canonical collection eliminates developer confusion.

---

## 6. Test / Script Safety

### 6.1 Root Python Test Scripts
* **Files:**
  * `test_all_safe.py` (8,203 B, untracked)
  * `test_multipart.py` (1,851 B, untracked)
  * `test_rx_order.py` (1,887 B, untracked)
* **Codebase References:** 0 references across backend Java, frontend JS, Docker, or CI scripts.
* **Functionality:** These are standalone Python scripts that use Python's standard `urllib.request` library to authenticate (`/api/auth/login`) and perform live HTTP requests against a local backend (`http://localhost:8080`).
* **Verdict:** They are not part of the official JUnit test suite (`mvn test`) or Postman Newman pipelines. They are developer manual smoke test utilities. Removing them will not impact automated CI/CD or Docker deployments, but they are useful developer tools. Recommendation: Preserve them by moving to `scripts/testing/`.

### 6.2 Root Screenshots (`Screenshot 2026-07-30 *.png`)
* **Files:** 11 PNG screenshots (total 1.94 MB) in the repository root.
* **Hash Comparison:** Cryptographic MD5 hash comparison against all 123 screenshots in `postman/` confirmed **0 matches**. They are completely distinct from the Postman API execution screenshots.
* **Visual Content:** They are frontend UI browser captures from July 30, 2026 (login screen, medicine catalog, customer inventory table, user profile).
* **Documentation References:** 0 references in `README.md` or `docs/`.
* **Verdict:** These are Milestone 2 frontend deliverables. They clutter the repository root. Recommendation: Move to `docs/evidence/milestone-2/` rather than deleting.

### 6.3 `token_supplier.txt`
* **File Details:** 2 bytes in repository root. Tracked in Git.
* **Contents & Encoding:** Raw bytes `b'ÿþ'` (UTF-16 Little Endian Byte Order Mark with zero content).
* **Git History:** Committed on August 13, 2026 in commit `d8702dfc` ("Milestone 2 task completion").
* **Codebase References:** 0 references in source code, configuration, tests, or scripts.
* **Verdict:** Stale, corrupted residual artifact. Safe for removal from Git tracking.

### 6.4 `backend/package-lock.json`
* **File Details:** 92 bytes in `backend/package-lock.json`. Tracked in Git.
* **Contents:** `{"name": "backend", "lockfileVersion": 3, "requires": true, "packages": {}}`.
* **Investigation:**
  * `backend/package.json` **does NOT exist**.
  * `backend/pom.xml` contains **NO npm plugins** (`frontend-maven-plugin` is absent).
  * No build scripts invoke `npm` in `backend/`.
* **Git History:** Committed accidentally on July 30, 2026 in commit `9cf61628` ("Added my feature code").
* **Verdict:** Purely erroneous artifact. Safe for removal from Git tracking.

---

## 7. Recommended Cleanup

The cleanup candidates are classified into four strict categories:

### 1. SAFE TO REMOVE BEFORE DEPLOYMENT
*Artifacts with strong evidence of being reproducible build outputs, stale logs, or redundant developer scratch.*

| Item / Path | Evidence | Risk |
| :--- | :--- | :--- |
| `frontend-build.log` (911 B) | Stale terminal output from local Vite build; matches `.gitignore`. | **Zero risk.** No code or process depends on it. |
| `scratch/__pycache__/` (2 files, 41.5 KB) | Compiled Python 3.14 bytecode (`.pyc`). | **Zero risk.** Automatically regenerated by Python. |
| `scratch/pre_normalization_alias_screenshots/` (44 files, 9.8 MB) | Exact MD5 byte-for-byte duplicates of canonical screenshots in `postman/`. | **Zero risk.** Official evidence is preserved in `postman/`. |
| `scratch/*.png` (12 root debug captures, 2.7 MB) | Ad-hoc full-window CDP captures used during script debugging. | **Zero risk.** Canonical API proofs are in `postman/`. |
| `backend/uploads/supplier-attachments/*.txt` (2 files, 53 B) | Sample test upload files from manual testing. | **Zero risk.** Clean deployments begin with empty upload storage. |
| `frontend/dist/` (29 files, 1.17 MB) | Compiled Vite web bundle; ignored by Git. | **Low risk.** Rebuilt deterministically via `npm run build` inside Docker. |
| `backend/target/` (307 files, 27.70 MB) | Compiled Java `.class` files, surefire reports, and local JAR; ignored by Git. | **Low risk.** Rebuilt deterministically via `mvn clean package` inside Docker. |

### 2. KEEP
*Artifacts required for runtime, automated testing, container deployment, or verified project evidence.*

| Item / Path | Evidence | Risk if Removed |
| :--- | :--- | :--- |
| `backend/src/main/java/**/*.java` (159 files) | Core Spring Boot application domain logic, controllers, and services. | **FATAL.** Application cannot compile or run. |
| `backend/src/test/java/**/*.java` (12 files) | Automated unit, controller, and integration tests. | **HIGH.** Breaks automated test verification. |
| `backend/src/main/resources/db/migration/` (24 files) | Flyway migration scripts (`V1` to `V24`). | **FATAL.** Database will fail to initialize or validate checksums. |
| `backend/src/main/resources/application*.yml` (5 files) | Main and profile-specific Spring Boot configuration. | **FATAL.** Database connection, server port, and JWT configuration lost. |
| `backend/pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/wrapper/*` | Maven build descriptor and wrapper toolset. | **FATAL.** Backend container build will fail. |
| `frontend/src/**/*.{js,jsx,css,svg,png,json}` (132 files) | React 18 UI components, features, and API clients. | **FATAL.** Frontend container build will fail. |
| `frontend/public/**/*.{ico,png}` (23 files) | Medicine icons and UI delivery form placeholders. | **HIGH.** Breaks dynamic medicine card images and default fallbacks. |
| `frontend/package.json`, `package-lock.json`, `vite.config.js` | Frontend build configuration and locked dependencies. | **FATAL.** `npm ci` and Vite bundling will fail. |
| `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore`, `README.md` | Core infrastructure and deployment orchestration. | **FATAL.** Dockerized deployment cannot execute. |
| `postman/MediStock_API_Testing.postman_collection.json` (174 KB) | Canonical Postman test collection covering 120 API requests. | **HIGH.** Core submission deliverable lost. |
| `postman/01` to `11` (`summary.json` + `*.png`, 134 files) | Official execution evidence for all 120 requests across 11 modules. | **HIGH.** Official proof of test completion lost. |
| Empty `.gitkeep` files in `backend/src/main/java/` (118 files) | Structural placeholders in empty sub-packages. | **MEDIUM.** Git will prune empty directories, altering package structure. |

### 3. REVIEW BEFORE REMOVAL
*Candidates requiring deliberate team decision, migration, or Git commit rather than deletion.*

| Item / Path | Evidence | Risk | Recommendation |
| :--- | :--- | :--- | :--- |
| `database/backup/medistock.backup` (194.8 KB, tracked) | Binary database dump; 0 references in deployment. | **Low-Medium.** May be desired by developers as an offline fallback database snapshot. | Review with team; if not needed for offline seeding, remove from Git tracking to save repo space. |
| `database/migration/*.sql` (9 files, tracked) | Outdated 9-script subset of backend Flyway migrations. | **Low.** Zero application references, but tracked in Git. | Deprecate and remove from Git tracking to prevent maintainer confusion. |
| `database/schema/`, `seed/`, `scripts/` (4 files, tracked) | Early MySQL syntax stub and empty placeholder comments. | **Low.** Zero application references, but tracked in Git. | Remove or update with actual PostgreSQL initialization scripts. |
| Root screenshots (`Screenshot 2026-07-30 *.png`, 11 files, tracked) | 11 historical UI screenshots; not linked in README. | **Low.** Important Milestone 2 evidence; loose in root. | Move into `docs/evidence/milestone-2/` and link in documentation. |
| `postman/MediStock.postman_collection.json` (79 B, tracked) | Empty placeholder collection with 0 requests. | **Low.** Misleading duplicate of canonical collection. | Replace with canonical `MediStock_API_Testing.postman_collection.json`. |
| `token_supplier.txt` (2 B, tracked) | Corrupted 2-byte file (`\xff\xfe`); 0 references. | **Low.** Unused residual artifact. | Remove via `git rm token_supplier.txt`. |
| `backend/package-lock.json` (92 B, tracked) | Empty npm lockfile in Maven Java backend. | **Low.** Erroneous file. | Remove via `git rm backend/package-lock.json`. |
| Populated `.gitkeep` files in `backend/` (52 files, tracked) | `.gitkeep` files in folders containing `.java` source. | **Zero.** Git tracks the folder via Java code. | Remove via `git rm` during general code cleanup. |
| Root test scripts (`test_all_safe.py`, `test_multipart.py`, `test_rx_order.py`) | Ad-hoc Python smoke scripts; unreferenced. | **Medium.** Useful developer smoke test utilities. | Relocate to `scripts/testing/` rather than deleting. |
| `scratch/*.py` (37 CDP automation scripts, untracked) | Local Python scripts used to automate Postman runs. | **Low.** Helper utilities for regenerating Postman runs. | Archive to external developer archive or clean up. |
| `scratch_endpoints.json` (136.2 KB, untracked) | Raw OpenAPI 3.0.1 JSON export. | **Low.** Live Swagger endpoint dynamically serves this. | Move to `docs/` or discard. |
| `inspect_enums.sql` (250 B, untracked) | Local manual diagnostic SQL queries. | **Low.** Developer scratch queries. | Move to developer notes or discard. |
| `scripts/{build,deploy,setup}.sh` (3 files, tracked) | Placeholder shell scripts containing single echo lines. | **Low.** Tracked stubs. | Flesh out with production commands or remove. |
| `docs/*.md` (6 skeleton documents, tracked) | 1-line markdown titles (`# System Architecture`, etc.). | **Low.** Incomplete documentation. | Populate with actual project architecture and deployment guides. |
| `.vscode/settings.json` (55 B, tracked) | Editor-specific configuration; matches `.gitignore`. | **Low.** Developer IDE setting. | Remove from Git tracking via `git rm --cached`. |
| `backend/.mvn/wrapper/maven-wrapper.jar` (63 KB, ignored) | Ignored by `*.jar` in `.gitignore`, but used by `./mvnw`. | **Medium.** Required if running wrapper without Maven. | Keep locally or force-track via `git add -f`. |

### 4. MUST NOT REMOVE
*Strict safeguard list. Deleting any of these will break runtime execution, build pipelines, or evaluation evidence.*

1. **`backend/src/main/resources/db/migration/V1__*.sql` through `V24__*.sql`:** Deleting or altering any migration script alters Flyway checksums and causes database startup aborts.
2. **`postman/MediStock_API_Testing.postman_collection.json`:** The canonical API test suite.
3. **`postman/01 Authentication/` through `postman/11 Authorization/`:** The 134 verified evaluation evidence files.
4. **`backend/src/main/resources/application*.yml`:** Spring Boot configuration profiles.
5. **`frontend/public/images/`:** Runtime static medicine image assets.
6. **`Dockerfile` & `docker-compose.yml`:** Production container deployment configuration.
7. **The 118 `.gitkeep` files in empty backend package directories:** Prevents Git from pruning modular package trees.

---

## 8. Pre-Deployment Actions

A prioritized action roadmap before production deployment:

### REQUIRED Before Deployment
1. **Create `.dockerignore`:**  
   Add `.dockerignore` in the repository root to prevent `frontend/node_modules/` (~171 MB), `backend/target/` (~27 MB), `frontend/dist/`, `scratch/`, `postman/`, and logs from being sent to the Docker daemon and dangerously copied into the frontend container.  
   *Essential entries:*
   ```text
   node_modules/
   target/
   dist/
   build/
   scratch/
   postman/
   *.log
   *.tmp
   *.png
   .git/
   ```
2. **Commit Canonical Postman Assets:**  
   Add and commit `postman/MediStock_API_Testing.postman_collection.json` and the 11 test evidence folders (`postman/01/` to `11/`) into Git tracking so that mentor/evaluator evidence is permanently stored in the repository.

### RECOMMENDED Before Deployment
1. **Replace Obsolete Postman Skeleton:**  
   Remove the empty 79-byte `postman/MediStock.postman_collection.json` and set `postman/MediStock_API_Testing.postman_collection.json` as the primary collection.
2. **Clean Stale Local Build Artifacts:**  
   Execute `mvn clean` in `backend/` and delete `frontend/dist/` and `frontend-build.log` on the host to ensure a clean local working environment.
3. **Organize Root Screenshots:**  
   Create `docs/evidence/milestone-2/` and move the 11 loose `Screenshot 2026-07-30 *.png` files there to declutter the project root.
4. **Relocate Root Test Scripts:**  
   Move `test_all_safe.py`, `test_multipart.py`, and `test_rx_order.py` into a structured `scripts/testing/` folder.
5. **Untrack Stale Configs & Dumps:**  
   Run `git rm token_supplier.txt backend/package-lock.json` and remove `.vscode/settings.json` from Git tracking.

### OPTIONAL Cleanup (Post-Deployment Maintenance)
1. **Deprecate `database/migration/`:** Remove the redundant 9 migration scripts in `database/migration/` and the binary `medistock.backup` from Git tracking once confirmed by team members.
2. **Prune Redundant `.gitkeep` Files:** Remove the 52 `.gitkeep` files located in Java packages that already contain `.java` classes.
3. **Flesh Out Documentation:** Populate the 6 stub markdown files in `docs/` with comprehensive architectural and API documentation.

---

## 9. Final Verification

A full post-audit integrity verification was conducted against the repository:

* **Files actually deleted:** **0** (Confirmed)
* **Files actually modified:** **0** (Confirmed)
* **Files actually renamed:** **0** (Confirmed)
* **Working tree changes:** Only the newly requested readiness report (`docs/final-deployment-readiness-report.md`) was written to disk.
* **Runtime / Backend / Frontend behavior:** **100% UNCHANGED.**

*Report prepared autonomously by Antigravity Final Deployment Verification Engine.*
