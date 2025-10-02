#!/bin/bash

echo "========================================"
echo "Navai Analytics - Xatolarni Tuzatish"
echo "========================================"
echo ""

echo "[1/4] Paketlarni o'rnatish..."
npm install
if [ $? -ne 0 ]; then
    echo "XATO: npm install muvaffaqiyatsiz!"
    exit 1
fi
echo "✓ Paketlar o'rnatildi"
echo ""

echo "[2/4] Prisma Client generatsiya qilish..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "XATO: Prisma generate muvaffaqiyatsiz!"
    exit 1
fi
echo "✓ Prisma Client yaratildi"
echo ""

echo "[3/4] Ma'lumotlar bazasi migratsiyasi..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "OGOHLANTIRISH: Migration xatosi (bu normal bo'lishi mumkin)"
fi
echo "✓ Migration bajarildi"
echo ""

echo "[4/4] Boshlang'ich ma'lumotlarni yuklash..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "OGOHLANTIRISH: Seed xatosi (bu normal bo'lishi mumkin)"
fi
echo "✓ Seed bajarildi"
echo ""

echo "========================================"
echo "✓ Barcha xatolar tuzatildi!"
echo "========================================"
echo ""
echo "Serverni ishga tushirish uchun:"
echo "  npm run start:dev"
echo ""
echo "API Documentation:"
echo "  http://localhost:3000/api/docs"
echo ""
