@echo off
cd /d "%~dp0"
echo Git cekme islemi basliyor...

REM Uzak degisiklikleri al
git fetch origin

REM Local degisiklikleri sifirla ve guncel hali al
git reset --hard origin/main

REM Temizlik
git clean -fd

echo Islem tamamlandi!
pause
