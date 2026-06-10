# Debug-6-9

## 1. 鏈淇缁撹

杩欎釜宸ョ▼宸茬粡鍦?`C:\Users\ASUS\Desktop\hi3863demo` 涓嬪畬鎴愪簡鍙縼绉诲寲澶勭悊锛屽苟涓斿凡缁忎娇鐢ㄨ鐩綍鍐呰嚜甯︾殑宸ュ叿閾惧疄闄呴獙璇侀€氳繃锛?
- `clean` 鎴愬姛
- `buildprog` 鎴愬姛

涔熷氨鏄锛岃繖涓€浠界洰褰曞凡缁忎笉鍐嶄緷璧栧師鏉ョ殑锛?
- `D:\hi3861_hdu_iot_application\hi3861_hdu_iot_application`
- `D:\Huawei\DevEco-Device-Tool`
- `D:\DevTools_Hi3861V100_v1.0`

## 2. 鍘熷鎶ラ敊鍘熷洜

### 2.1 `clean` 闃舵澶辫触

鍘熷鎶ラ敊閲屽厛鍑虹幇浜嗭細

- `ERROR Not a build directory.`
- `FileNotFoundError: [WinError 3] 绯荤粺鎵句笉鍒版寚瀹氱殑璺緞`

鏍瑰洜鏈変袱灞傦細

1. 鍘熸潵鐨?`gn clean` 閫昏緫榛樿杈撳嚭鐩綍涓€瀹氭槸瀹屾暣鐨?GN 鏋勫缓鐩綍銆?2. 浣嗗綋 `src/out/...` 宸茬粡娈嬬己銆佽閮ㄥ垎鍒犻櫎銆佹垨鑰呬笂涓€娆℃瀯寤轰腑鏂悗锛岀洰褰曢噷鍙兘宸茬粡娌℃湁瀹屾暣鐨?`build.ninja`锛岃繖鏃剁户缁墽琛?`gn clean` 浼氱洿鎺ュけ璐ャ€?3. 澶辫触鍚庡張缁х画鍒犻櫎涓€涓眰绾у緢娣辩殑 Windows 璺緞锛宍shutil.rmtree()` 鍦ㄨ繖绉嶅満鏅笅瀹规槗鍑虹幇鈥滄枃浠跺垰濂戒笉瀛樺湪 / 璺緞杩囨繁 / 鍙鏂囦欢鈥濆鑷寸殑 `FileNotFoundError`銆?
### 2.2 Windows 娣辫矾寰勫鑷寸殑鏋勫缓涓嶇ǔ瀹?
宸ョ▼鐨?OpenHarmony LiteOS 璺緞灞傜骇鏈韩寰堟繁锛屽儚涓嬮潰杩欑被瀵硅薄鏂囦欢璺緞浼氶潪甯搁暱锛?
- `src/out/hispark_pegasus/wifiiot_hispark_pegasus/obj/.../libdeviceauth.account_related_group_manager_mock.o`

鍦?Windows 涓婏紝杩欎細瀵艰嚧涓や釜闂锛?
1. 娓呯悊鍜屽垹闄ょ洰褰曟椂瀹规槗鍑洪敊銆?2. 鏋勫缓杩囩▼涓鏋滀粛浣跨敤杩囬暱鐨勬牴鐩綍锛屽伐鍏烽摼鍜屾瀯寤鸿剼鏈璺緞闀垮害鐨勫蹇嶅害浼氭槑鏄句笅闄嶃€?
鍘熷伐绋嬪唴閮ㄨ櫧鐒舵湁缂╃煭璺緞鐨勬€濊矾锛屼絾瀹炵幇涓嶇ǔ瀹氾紝瀵艰嚧鐭矾寰勫埆鍚嶆病鏈夎鍙潬寤虹珛锛屽悗缁粛鍙兘鍥炲埌闀胯矾寰勩€?
### 2.3 缂栬瘧鏃ュ織瑙ｇ爜宕╂簝

鍚庣画绗簩涓叧閿姤閿欐槸锛?
- `UnicodeDecodeError: 'utf-8' codec can't decode byte 0xb2`

鏍瑰洜鏄瀯寤鸿剼鏈鍙?`ninja/gcc` 杈撳嚭鏃讹紝寮哄埗鎸?`utf-8` 瑙ｇ爜銆備絾浣犵殑 Windows 鐜鏄腑鏂囨湰鍦扮紪鐮侊紝缂栬瘧鍣ㄨ緭鍑洪噷鍑虹幇浜嗘湰鍦扮紪鐮佸瓧鑺傦紝Python 鐢?`utf-8` 瑙ｇ爜灏辩洿鎺ュ穿浜嗐€備篃灏辨槸璇达紝杩欎笉鏄?C 浠ｇ爜缂栬瘧閿欒锛岃€屾槸鈥滄瀯寤烘棩蹇楄鍙栦唬鐮佽嚜宸卞穿浜嗏€濄€?
## 3. 鎴戝仛鐨勪慨澶?
### 3.1 淇 `clean` 閫昏緫

淇敼鏂囦欢锛?
- `src/build/lite/hb/build/build_process.py`
- `src/build/lite/hb/common/utils.py`

澶勭悊鏂瑰紡锛?
1. `gn_clean()` 鍏堟鏌ヨ緭鍑虹洰褰曢噷鏄惁瀛樺湪 `build.ninja`銆?2. 濡傛灉鐩綍宸茬粡涓嶆槸瀹屾暣鐨?GN 鏋勫缓鐩綍锛屽氨涓嶅啀寮鸿鎵ц `gn clean`锛岃€屾槸鐩存帴鍒犻櫎璇ョ洰褰曘€?3. `remove_path()` 澧炲己涓烘洿閫傚悎 Windows锛?   - 蹇界暐涓嶅瓨鍦ㄨ矾寰?   - 澶勭悊鍙鏂囦欢
   - 鍏煎娣卞眰鐩綍鍒犻櫎
   - 閬囧埌鐬椂鍒犻櫎澶辫触鏃跺鍔犲閿?
杩欐牱鍙互閬垮厤鈥滅洰褰曞凡缁忓潖浜嗭紝杩樼‖璺?`gn clean`鈥濆鑷寸殑杩炵画鎶ラ敊銆?
### 3.2 淇 Windows 娣辫矾寰勯棶棰?
淇敼鏂囦欢锛?
- `src/build/lite/hb/common/config.py`

澶勭悊鏂瑰紡锛?
1. 鏋勫缓鏃朵紭鍏堜负宸ョ▼鏍圭洰褰曞垱寤烘洿鐭殑 Windows 鐩綍鑱旀帴璺緞銆?2. 濡傛灉鐭矾寰勮仈鎺ュ彲鐢紝GN/Ninja/SCons 浼氫紭鍏堣蛋鐭矾寰勩€?3. 鍐欏洖閰嶇疆鏂囦欢鏃朵繚鐣欑湡瀹炶矾寰勶紝涓嶆妸涓存椂鐭矾寰勫埆鍚嶆寔涔呭寲鍒伴厤缃腑銆?4. 淇浜嗗師鍏堢煭璺緞鍒涘缓閫昏緫閲屽湪 Windows 涓婁笉绋冲畾鐨勯棶棰樸€?
杩欐牱鍋氱殑鐩殑锛屾槸闄嶄綆 OpenHarmony 娣卞眰杈撳嚭鐩綍鍦?Windows 涓婅Е鍙戣矾寰勯暱搴﹂棶棰樼殑姒傜巼銆?
### 3.3 淇鏃ュ織瑙ｇ爜闂

淇敼鏂囦欢锛?
- `src/build/lite/hb/common/utils.py`

澶勭悊鏂瑰紡锛?
1. `exec_command()` 鍜?`check_output()` 涓嶅啀寮哄埗浣跨敤 `utf-8`銆?2. 鍦?Windows 涓嬫敼涓轰娇鐢ㄧ郴缁熼閫夌紪鐮併€?3. 瀵瑰紓甯稿瓧绗﹀鍔犳浛浠ｅ閿欙紝閬垮厤鍥犱负涓€琛屾棩蹇楅噷鏈夋湰鍦扮紪鐮佸瓧绗﹀氨璁╂暣涓瀯寤鸿剼鏈穿婧冦€?
杩欐牱鍗充娇缂栬瘧鍣ㄨ緭鍑轰腑鏂囨垨鏈湴缂栫爜瀛楃锛屾瀯寤烘祦绋嬩篃鑳界户缁€?
## 4. 鎵撳寘鐩綍閲屽凡缁忓仛杩囩殑鍙縼绉诲寲澶勭悊

涓轰簡璁╄繖浠藉伐绋嬫惉鍒板彟涓€鍙版満鍣ㄥ悗杩樿兘鐩存帴鎵撳紑鍜岀紪璇戯紝鎴戝凡缁忔敼浜嗕笅闈㈣繖浜涢厤缃細

### 4.1 DevEco 宸ョ▼閰嶇疆宸叉敼涓虹浉瀵硅矾寰?
鏂囦欢锛?
- `.deveco/deveco.ini`

宸插鐞嗗唴瀹癸細

- `compiler_bin_path` 宸叉敼涓虹浉瀵硅矾寰勶細`tools\DevTools_Hi3861V100_v1.0`
- `upload_port` 宸叉竻绌?- `monitor_port` 宸叉竻绌?
璇存槑锛?
`upload_port` 鍜?`monitor_port` 涓嶈兘鍐欐涓?`COM3`锛屽洜涓烘崲涓€鍙扮數鑴戝悗涓插彛鍙烽€氬父浼氬彉鍖栥€傞娆＄儳褰曞墠锛岄渶瑕佹寜鐩爣鏈哄櫒瀹為檯涓插彛濉啓銆?
### 4.2 VS Code / DevEco 浠诲姟宸叉敼涓虹浉瀵硅矾寰?
鏂囦欢锛?
- `.vscode/tasks.json`
- `.vscode/launch.json`

宸插鐞嗗唴瀹癸細

1. 鏋勫缓銆佹竻鐞嗐€佺儳褰曘€佷覆鍙ｇ洃瑙嗕换鍔★紝鍏ㄩ儴鏀逛负浣跨敤褰撳墠鐩綍涓嬬殑鏈湴宸ュ叿锛?   - `tools\DevEco-Device-Tool\core\deveco-venv\Scripts\hos.exe`
2. `--project-dir` 宸叉敼涓?`${workspaceFolder}`
3. 璋冭瘯 `target.elf` 宸叉敼涓虹浉瀵瑰伐绋嬬洰褰?4. 鍒犻櫎浜嗕竴涓棤鍏充笖澶辨晥鐨?`C/C++ Runner` 璋冭瘯閰嶇疆锛岄伩鍏嶈鐐?
### 4.3 鏍圭洰褰曞鍔犱簡蹇嵎鑴氭湰

宸叉柊澧烇細

- `build.bat`
- `rebuild.bat`
- `upload.bat`
- `monitor.bat`

杩欎簺鑴氭湰閮借皟鐢ㄥ綋鍓嶇洰褰曡嚜甯﹀伐鍏烽摼锛屼笉渚濊禆澶栭儴瀹夎璺緞銆?
## 5. 涓轰粈涔堟渶缁堝寘閲屾病鏈変繚鐣欐煇浜涚紦瀛樻枃浠?
涓轰簡淇濊瘉鍙縼绉伙紝鎴戜細鍒绘剰涓嶄繚鐣欎笅闈㈣繖浜涒€滃甫鏈満缁濆璺緞鈥濈殑鏋勫缓缂撳瓨锛屾垨鑰呭缓璁湪鎷峰埌鏂版満鍣ㄥ墠娓呯悊锛?
- `src/ohos_config.json`
- `src/out/`
- `.deveco/build/`

鍘熷洜寰堢畝鍗曪細

1. 杩欎簺鏂囦欢浼氳褰曞綋鍓嶆満鍣ㄤ笂鐨勭粷瀵硅矾寰勩€?2. 鎷峰埌鍙︿竴鍙版満鍣ㄥ悗锛岃繖浜涚粷瀵硅矾寰勯€氬父澶辨晥銆?3. 鍒犻櫎鍚庣涓€娆℃瀯寤轰細鑷姩閲嶆柊鐢熸垚锛屾洿瀹夊叏銆?
杩欏睘浜庢甯哥幇璞★紝涓嶆槸缂烘枃浠躲€?
## 6. 鍙︿竴鍙?Windows 鐢佃剳涓婄殑浣跨敤鏂瑰紡

## 6.1 鎺ㄨ崘鏂瑰紡锛氱敤 DevEco Device Tool 鎵撳紑

1. 鎶婃暣涓?`hi3863demo` 鏂囦欢澶瑰鍒跺埌鍙︿竴鍙扮數鑴戙€?2. 鎵撳紑 DevEco Device Tool 鎴栨敮鎸佽宸ョ▼鐨?VS Code 宸ヤ綔鍖恒€?3. 鐩存帴鎵撳紑璇ユ枃浠跺す鏍圭洰褰曘€?4. 棣栨鎵撳紑鍚庯紝妫€鏌?`.deveco/deveco.ini` 鎴栧浘褰㈢晫闈腑鐨勫伐绋嬮厤缃€?
閲嶇偣纭锛?
- `compiler_bin_path = tools\DevTools_Hi3861V100_v1.0`
- `upload_port = 鐩爣寮€鍙戞澘瀹為檯涓插彛`
- `monitor_port = 鐩爣寮€鍙戞澘瀹為檯涓插彛`

## 6.2 鐩存帴鍛戒护琛屾瀯寤?
鍦ㄥ伐绋嬫牴鐩綍鎵ц锛?
```bat
rebuild.bat
```

鎴栬€呭垎鍒墽琛岋細

```bat
build.bat
upload.bat
monitor.bat
```

## 7. 缂栬瘧涓庣儳褰曟楠?
### 7.1 棣栨缂栬瘧

鐩存帴鎵ц锛?
```bat
rebuild.bat
```

棣栨鏋勫缓鏃讹紝绯荤粺浼氳嚜鍔ㄩ噸鏂扮敓鎴愶細

- `src/ohos_config.json`
- `src/out/...`
- `.deveco/build/...`

杩欐槸姝ｅ父鐨勩€?
### 7.2 鐑у綍鍓嶅噯澶?
1. 杩炴帴 Hi3861 寮€鍙戞澘銆?2. 濡傛灉鐩爣鐢佃剳娌¤涓插彛椹卞姩锛屽厛瀹夎锛?
```text
tools\DevTools_Hi3861V100_v1.0\usb_serial_driver\CH341SER.EXE
```

3. 閰嶇疆瀹為檯涓插彛鍙凤細
   - `upload_port`
   - `monitor_port`

### 7.3 鐑у綍

閰嶇疆濂戒覆鍙ｅ悗鎵ц锛?
```bat
upload.bat
```

濡傛灉宸ュ叿鎻愮ず绛夊緟澶嶄綅锛岃鎸夊紑鍙戞澘瑕佹眰澶嶄綅涓€娆°€?
### 7.4 鏌ョ湅涓插彛鏃ュ織

```bat
monitor.bat
```

濡傛灉鐑у綍鏃朵覆鍙ｈ鍗犵敤锛屽厛鍏抽棴涓插彛鐩戣绐楀彛锛屽啀閲嶆柊鐑у綍銆?
## 8. 宸查獙璇佺粨鏋?
鎴戝凡缁忓湪鏈満鐩存帴浣跨敤杩欎釜鎵撳寘鐩綍閲岀殑鏈湴宸ュ叿鎵ц杩囷細

```text
tools\DevEco-Device-Tool\core\deveco-venv\Scripts\hos.exe run --target clean --target buildprog --project-dir C:\Users\ASUS\Desktop\hi3863demo --environment hi3861
```

楠岃瘉缁撴灉锛?
- `clean SUCCESS`
- `buildprog SUCCESS`

璇存槑杩欎唤 `hi3863demo` 鐩綍鏈韩鏄兘鐙珛缂栬瘧鐨勶紝涓嶄緷璧栧師濮嬪伐绋嬬洰褰曘€?
## 9. 闇€瑕佷綘鍦ㄦ柊鏈哄櫒涓婃墜宸ョ‘璁ょ殑椤圭洰

浠ヤ笅鍐呭鏃犳硶鍦ㄦ墦鍖呮椂瀹屽叏鑷姩鍖栵紝鍥犱负瀹冧滑鍙栧喅浜庣洰鏍囨満鍣ㄥ拰纭欢杩炴帴鐘舵€侊細

1. 涓插彛鍙?   - `upload_port`
   - `monitor_port`
2. USB 涓插彛椹卞姩鏄惁宸插畨瑁?3. J-Link 璋冭瘯鍣ㄦ槸鍚﹀凡瀹夎銆佸凡杩炴帴
4. 鏉垮崱鏄惁闇€瑕佹墜鍔ㄥ浣嶈繘鍏ョ儳褰曠姸鎬?
## 10. 鍏抽敭淇鏂囦欢

鏈鐪熸淇鏋勫缓闂鐨勬簮鐮佹枃浠舵槸锛?
- `src/build/lite/hb/common/utils.py`
- `src/build/lite/hb/common/config.py`
- `src/build/lite/hb/build/build_process.py`

鎵撳寘鍓湰閲屼负浜嗗彲杩佺Щ棰濆鏀硅繃鐨勬枃浠舵槸锛?
- `.deveco/deveco.ini`
- `.vscode/tasks.json`
- `.vscode/launch.json`

濡傛灉鍚庣画浣犺繕瑕佺户缁垎鍙戣繖浠藉伐绋嬶紝寤鸿鐩存帴鍩轰簬褰撳墠 `hi3863demo` 鐩綍澶嶅埗锛屼笉瑕佸啀鐢ㄥ師鏉ラ偅浠藉甫缁濆璺緞閰嶇疆鐨勭洰褰曞仛浜屾鎵撳寘銆?