$sdkLib = "${env:ProgramFiles(x86)}\Windows Kits\10\Lib\10.0.26100.0\um\x64"
$libExe = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64\lib.exe"
$dumpbin = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64\dumpbin.exe"
$tmp = "$env:TEMP\genlib"
ni "$tmp" -ItemType Directory -Force >$null

$dlls = @{
  "ole32"    = "C:\Windows\System32\ole32.dll"
  "oleaut32" = "C:\Windows\System32\oleaut32.dll"
  "shell32"  = "C:\Windows\System32\shell32.dll"
  "dbghelp"  = "C:\Windows\System32\dbghelp.dll"
  "advapi32" = "C:\Windows\System32\advapi32.dll"
}

foreach ($lib in $dlls.Keys) {
  $dll = $dlls[$lib]
  Write-Output "Generating $lib.lib from $dll ..."
  & $dumpbin /exports $dll /OUT:"$tmp\${lib}_dump.txt" 2>&1 | Out-Null
  $exports = Get-Content "$tmp\${lib}_dump.txt" | Select-String -Pattern "^\s+\d+\s+\d+\s+[0-9A-Fa-f]+\s+" | ForEach-Object {
    $parts = $_ -trim -split "\s+"
    $parts[-1]
  }
  $def = "LIBRARY $lib`r`nEXPORTS`r`n"
  foreach ($e in $exports) {
    $def += "  $e`r`n"
  }
  Set-Content -Path "$tmp\${lib}.def" -Value $def -Encoding Ascii
  & $libExe /def:"$tmp\${lib}.def" /out:"$sdkLib\${lib}.lib" /machine:x64 2>&1 | Out-Null
  Write-Output "  -> $sdkLib\${lib}.lib"
}
Write-Output "Done"
