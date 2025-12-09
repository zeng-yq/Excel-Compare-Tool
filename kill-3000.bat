@echo off
echo 正在查找占用3000-3006端口的进程...

setlocal enabledelayedexpansion

for /l %%p in (3000,1,3006) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p') do (
        set PID=%%a
        echo 找到占用%%p端口的进程 PID: !PID!
        echo 正在终止进程...
        taskkill /F /PID !PID!
        
        if !errorlevel! == 0 (
            echo 成功终止进程 !PID!
        ) else (
            echo 终止进程 !PID! 失败，请手动检查
        )
        echo.
    )
)

echo 操作完成
pause