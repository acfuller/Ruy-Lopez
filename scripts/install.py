"""Per-user installation and a real Windows Desktop .lnk, using Windows APIs."""
import json,shutil
from pathlib import Path
import win32com.client
from win32com.shell import shell,shellcon
ROOT=Path(__file__).resolve().parents[1]
desktop=Path(shell.SHGetFolderPath(0,shellcon.CSIDL_DESKTOPDIRECTORY,None,0))
local=Path(shell.SHGetFolderPath(0,shellcon.CSIDL_LOCAL_APPDATA,None,0))
name='Ruy López Chess Trainer'
install=local/'Programs'/'RuyLopezChessTrainer'
source=ROOT/'release'/'win-unpacked'
assert (source/(name+'.exe')).is_file(),'Package first'
shutil.copytree(source,install,dirs_exist_ok=True)
shutil.copy2(ROOT/'electron'/'icon.ico',install/'trainer.ico')
exe=install/(name+'.exe')
link=desktop/(name+'.lnk')
wsh=win32com.client.Dispatch('WScript.Shell')
shortcut=wsh.CreateShortcut(str(link))
shortcut.TargetPath=str(exe)
shortcut.WorkingDirectory=str(install)
shortcut.Arguments=''
shortcut.Description='Offline chess opening lessons, model games and guided practice'
shortcut.IconLocation=str(install/'trainer.ico')+',0'
shortcut.Save()
readback=wsh.CreateShortcut(str(link))
assert Path(readback.TargetPath)==exe and exe.is_file()
result={'executable':str(exe),'shortcut':str(link),'target':readback.TargetPath,'workingDirectory':readback.WorkingDirectory,'data':str(local/'RuyLopezTrainerData')}
(ROOT/'tests'/'installation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
