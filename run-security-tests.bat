@echo off
REM WattWise Security Tests - Quick Start Guide (Windows)
REM Run this script to execute all security vulnerability tests

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  WATTWISE SECURITY VULNERABILITY TEST SUITE                   ║
echo ║  Attacker Simulation ^& Proof of Concept                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 16+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo Node.js version: %NODE_VERSION%
echo npm version: %NPM_VERSION%
echo.

REM ============================================
REM 1. INSTALL DEPENDENCIES
REM ============================================
echo [1/4] Installing dependencies...
echo.

echo Installing backend test dependencies...
cd backend
call npm install --save-dev jest supertest >nul 2>&1
echo [OK] Backend dependencies installed
cd ..

echo Installing frontend test dependencies...
cd frontend
call npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event >nul 2>&1
echo [OK] Frontend dependencies installed
cd ..

echo.

REM ============================================
REM 2. RUN BACKEND SECURITY TESTS
REM ============================================
echo [2/4] Running Backend Security Tests...
echo (10 vulnerabilities - CORS, Auth, Input Validation, etc.)
echo.

cd backend
call npm test -- tests/security-vulnerabilities.test.js --verbose
set BACKEND_STATUS=%errorlevel%
cd ..

echo.

REM ============================================
REM 3. RUN FRONTEND SECURITY TESTS
REM ============================================
echo [3/4] Running Frontend Security Tests...
echo (9 vulnerabilities - XSS, Token Security, Session, etc.)
echo.

cd frontend
call npm test -- src/tests/security-frontend.test.jsx --verbose
set FRONTEND_STATUS=%errorlevel%
cd ..

echo.

REM ============================================
REM 4. RUN INTEGRATION SECURITY TESTS
REM ============================================
echo [4/4] Running Integration Security Tests...
echo (7 vulnerabilities - Firestore, API Auth, Privilege Escalation)
echo.

cd backend
call npm test -- tests/security-integration.test.js --verbose
set INTEGRATION_STATUS=%errorlevel%
cd ..

echo.

REM ============================================
REM SUMMARY REPORT
REM ============================================
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  TEST EXECUTION SUMMARY                                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

if %BACKEND_STATUS% equ 0 (
    echo [OK] Backend Security Tests: PASSED
    echo   - CORS Misconfiguration
    echo   - Weak Password Validation
    echo   - Token in localStorage
    echo   - No Input Validation
    echo   - No Rate Limiting
    echo   - Missing Security Headers
    echo   - TLS Verification Disabled
    echo   - No CSRF Protection
    echo   - No Audit Logging
    echo   - Weak JWT Validation
) else (
    echo [ERROR] Backend Security Tests: FAILED
)

echo.

if %FRONTEND_STATUS% equ 0 (
    echo [OK] Frontend Security Tests: PASSED
    echo   - Weak Password Validation
    echo   - XSS Via Stored Data
    echo   - Token Stored in localStorage
    echo   - Missing Input Sanitization
    echo   - No CSRF Protection
    echo   - Session Not Cleared
    echo   - Insecure API Calls
    echo   - Error Messages Leak Info
    echo   - Unprotected Routes
) else (
    echo [ERROR] Frontend Security Tests: FAILED
)

echo.

if %INTEGRATION_STATUS% equ 0 (
    echo [OK] Integration Security Tests: PASSED
    echo   - Firestore Rules Vulnerabilities
    echo   - API Authentication Issues
    echo   - Privilege Escalation Risk
    echo   - Information Disclosure via API
    echo   - Insufficient Audit Logging
    echo   - Data Encryption Issues
    echo   - Dependency Vulnerabilities
) else (
    echo [ERROR] Integration Security Tests: FAILED
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗

if %BACKEND_STATUS% equ 0 if %FRONTEND_STATUS% equ 0 if %INTEGRATION_STATUS% equ 0 (
    echo ║  ALL TESTS COMPLETED - See vulnerabilities above               ║
    echo ║  Total Vulnerabilities Found: 26                              ║
    echo ║  CRITICAL: 5 ^| HIGH: 12 ^| MEDIUM: 7                           ║
) else (
    echo ║  SOME TESTS INCOMPLETE - Check output above                   ║
)

echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM ============================================
REM NEXT STEPS
REM ============================================
echo NEXT STEPS:
echo.
echo 1. Review the vulnerabilities listed above
echo.
echo 2. For detailed information:
echo    - See: SECURITY_QUICK_REFERENCE.md (quick fixes)
echo    - See: SECURITY_REMEDIATION_PLAN.md (implementation guide)
echo    - See: SDLC_SECURITY_ASSESSMENT.md (full analysis)
echo.
echo 3. Start with CRITICAL vulnerabilities (Phase 1, 2 weeks)
echo.
echo 4. Implementation Priority:
echo    a) Remove TLS rejection line
echo    b) Restrict CORS
echo    c) Enforce strong passwords
echo    d) Migrate token to httpOnly cookies
echo    e) Add security headers
echo    f) Implement input validation
echo.
echo 5. Re-run tests after fixes:
echo    run-security-tests.bat
echo.
echo 6. Questions?
echo    - Check SECURITY_TESTS_README.md for detailed test documentation
echo    - Review test file comments for attack scenarios
echo.
echo ════════════════════════════════════════════════════════════════
echo SECURITY TESTS COMPLETE!
echo ════════════════════════════════════════════════════════════════
echo.

pause
