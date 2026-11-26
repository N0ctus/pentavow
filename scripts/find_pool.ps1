Add-Type -AssemblyName System.Drawing

$cropPath = "C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\.user_uploaded\media_1795435894264_d773d1ca.png"
$sheetPath = "C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\.user_uploaded\media_1795431218771_19dd166f.jpg"

$crop = New-Object System.Drawing.Bitmap($cropPath)
$sheet = New-Object System.Drawing.Bitmap($sheetPath)

Write-Host "Crop:" $crop.Width "x" $crop.Height
Write-Host "Sheet:" $sheet.Width "x" $sheet.Height

# Sample 5 pixels from crop
$p0 = $crop.GetPixel(20, 20)
$p1 = $crop.GetPixel(70, 50)
$p2 = $crop.GetPixel(100, 20)
$p3 = $crop.GetPixel(20, 80)
$p4 = $crop.GetPixel(100, 80)

$found = $false
for ($y = 0; $y -lt ($sheet.Height - $crop.Height); $y += 2) {
  for ($x = 0; $x -lt ($sheet.Width - $crop.Width); $x += 2) {
    $s0 = $sheet.GetPixel($x + 20, $y + 20)
    if ([Math]::Abs($s0.R - $p0.R) -lt 15 -and [Math]::Abs($s0.G - $p0.G) -lt 15 -and [Math]::Abs($s0.B - $p0.B) -lt 15) {
      $s1 = $sheet.GetPixel($x + 70, $y + 50)
      if ([Math]::Abs($s1.R - $p1.R) -lt 15 -and [Math]::Abs($s1.G - $p1.G) -lt 15 -and [Math]::Abs($s1.B - $p1.B) -lt 15) {
        $s2 = $sheet.GetPixel($x + 100, $y + 20)
        if ([Math]::Abs($s2.R - $p2.R) -lt 15 -and [Math]::Abs($s2.G - $p2.G) -lt 15 -and [Math]::Abs($s2.B - $p2.B) -lt 15) {
          Write-Host "Match found at x=$x y=$y"
          $found = $true
          break
        }
      }
    }
  }
  if ($found) { break }
}

$crop.Dispose()
$sheet.Dispose()
