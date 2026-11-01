import sys, subprocess, time, xml.etree.ElementTree as ET
from pathlib import Path
adb = r'C:\Users\arpit\AppData\Local\Android\Sdk\platform-tools\adb.exe'
root = Path(r'D:\arogio-health-app\.impeccable\review\article-categories')
def run(*args): return subprocess.run([adb, *args], check=True, capture_output=True).stdout
def capture(name):
    time.sleep(1)
    run('shell','uiautomator','dump','/sdcard/jeeva-ui.xml')
    xml=run('shell','cat','/sdcard/jeeva-ui.xml')
    (root/(name+'.xml')).write_bytes(xml)
    (root/(name+'.png')).write_bytes(run('exec-out','screencap','-p'))
    for n in ET.fromstring(xml).iter('node'):
        text=n.get('text') or n.get('content-desc')
        if text: print(text,n.get('bounds'))
if sys.argv[1]=='capture': capture(sys.argv[2])
elif sys.argv[1]=='route':
    run('shell','am','start','-W','-a','android.intent.action.VIEW','-d','arogiohealth://'+sys.argv[2],'com.arogio.health')
    time.sleep(2);capture(sys.argv[3])
elif sys.argv[1]=='tap':
    run('shell','input','tap',sys.argv[2],sys.argv[3]);capture(sys.argv[4])
elif sys.argv[1]=='type': run('shell','input','text',sys.argv[2].replace(' ','%s'))

