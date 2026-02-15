@echo off
cd /d "%~dp0"
echo Git gonderme islemi basliyor...

REM Tum degisiklikleri ekle
git add -A

REM Commit yap
set /p message="Commit mesaji (bos birakabilirsin): "
if "%message%"=="" set message=Otomatik commit

git commit -m "%message%"

REM Hangi branch'taysak onu push et
for /f "tokens=*" %%a in ('git branch --show-current') do set BRANCH=%%a
echo Aktif branch: %BRANCH%

git push origin %BRANCH%:main
if errorlevel 1 (
    echo Push basarisiz, force push deneniyor...
    git push -f origin %BRANCH%:main
)

echo Islem tamamlandi!
pause
