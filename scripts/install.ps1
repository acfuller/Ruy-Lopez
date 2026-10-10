$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$desktop = [Environment]::GetFolderPath('Desktop')
$local = [Environment]::GetFolderPath('LocalApplicationData')
$name = 'Ruy L' + [char]0xF3 + 'pez Chess Trainer'
$install = Join-Path $local 'Programs\RuyLopezChessTrainer'
$source = Join-Path $project 'release\win-unpacked'
$exe = Join-Path $install ($name + '.exe')
if (!(Test-Path (Join-Path $source ($name + '.exe')))) { throw 'Build the desktop package before installing.' }
if (Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $exe }) { throw 'Close Ruy Lopez Chess Trainer before updating.' }
New-Item -ItemType Directory -Path $install -Force | Out-Null
Copy-Item -Path (Join-Path $source '*') -Destination $install -Recurse -Force
Copy-Item (Join-Path $project 'electron\icon.ico') (Join-Path $install 'trainer.ico') -Force
$link = Join-Path $desktop ($name + '.lnk')
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($link)
$shortcut.TargetPath = $exe
$shortcut.WorkingDirectory = $install
$shortcut.Arguments = ''
$shortcut.Description = 'Offline Ruy Lopez chess opening lessons, games and practice'
$shortcut.IconLocation = (Join-Path $install 'trainer.ico') + ',0'
$shortcut.Save()
$readback = $shell.CreateShortcut($link)
if ($readback.TargetPath -ne $exe -or !(Test-Path $exe)) { throw 'Shortcut target verification failed.' }
@{ executable=$exe; shortcut=$link; target=$readback.TargetPath; workingDirectory=$readback.WorkingDirectory; user=[Environment]::UserName; data=(Join-Path $local 'RuyLopezTrainerData') } | ConvertTo-Json | Tee-Object -FilePath (Join-Path $project 'tests\installation.json')
