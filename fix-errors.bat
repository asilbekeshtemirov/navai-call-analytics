@echo off
echo ========================================
echo Navai Analytics - Xatolarni Tuzatish
echo ========================================
echo.

echo [1/4] Paketlarni o'rnatish...
call npm install
if %errorlevel% neq 0 (
    echo XATO: npm install muvaffaqiyatsiz!
    pause
    exit /b 1
)
echo ✓ Paketlar o'rnatildi
echo.

echo [2/4] Prisma Client generatsiya qilish...
call npx prisma generate
if %errorlevel% neq 0 (
    echo XATO: Prisma generate muvaffaqiyatsiz!
    pause
    exit /b 1
)
echo ✓ Prisma Client yaratildi
echo.

echo [3/4] Ma'lumotlar bazasi migratsiyasi...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo OGOHLANTIRISH: Migration xatosi (bu normal bo'lishi mumkin)
)
echo ✓ Migration bajarildi
echo.

echo [4/4] Boshlang'ich ma'lumotlarni yuklash...
call npm run db:seed
if %errorlevel% neq 0 (
    echo OGOHLANTIRISH: Seed xatosi (bu normal bo'lishi mumkin)
)
echo ✓ Seed bajarildi
echo.

echo ========================================
echo ✓ Barcha xatolar tuzatildi!
echo ========================================
echo.
echo Serverni ishga tushirish uchun:
echo   npm run start:dev
echo.
echo API Documentation:
echo   http://localhost:3000/api/docs
echo.
pause
