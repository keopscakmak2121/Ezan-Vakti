@echo off
cd /d "%~dp0"
echo Git gonderme islemi basliyor...

REM Tum degisiklikleri ekle
git add -A

REM Commit yap
set /p message="Commit mesaji (bos birakabilirsin): "
if "%message%"=="" set message=Otomatik commit

git commit -m "%message%"

REM Push yap
git push origin master:main
if errorlevel 1 (
    echo Push basarisiz, force push deneniyor...
    git push -f origin master:main
)

echo Islem tamamlandi!
pause
