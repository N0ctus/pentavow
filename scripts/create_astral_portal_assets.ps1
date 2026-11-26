Add-Type -AssemblyName System.Drawing

# Process both images:
# 1. astral_altar_pixelated.png (direct pixelation of user upload)
# 2. astral_altar_generated.jpg (subagent pixel art generator)

function Create-CircularMaskedPortal($srcPath, $outPath) {
    $resolvedSrc = (Resolve-Path $srcPath).Path
    $srcImg = [System.Drawing.Bitmap]::FromFile($resolvedSrc)
    $w = $srcImg.Width
    $h = $srcImg.Height
    
    $outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $cx = $w / 2.0
    $cy = $h / 2.0
    $maxR = [Math]::Min($w, $h) * 0.49
    $innerR = $maxR * 0.78
    
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $dx = $x - $cx
            $dy = $y - $cy
            $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
            $origColor = $srcImg.GetPixel($x, $y)
            
            if ($dist -gt $maxR) {
                # Completely transparent outside outer mandala circle
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($dist -gt $innerR) {
                # Smooth cosmic feather fade between innerR and maxR
                $alphaRatio = 1.0 - (($dist - $innerR) / ($maxR - $innerR))
                $alpha = [int]([Math]::Max(0, [Math]::Min(255, $alphaRatio * 255)))
                $newColor = [System.Drawing.Color]::FromArgb($alpha, $origColor.R, $origColor.G, $origColor.B)
                $outBmp.SetPixel($x, $y, $newColor)
            } else {
                $outBmp.SetPixel($x, $y, $origColor)
            }
        }
    }
    
    $dest = (Resolve-Path "public\portals").Path + "\" + $outPath
    $outBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    $srcImg.Dispose()
    Write-Output "Created: $dest"
}

Create-CircularMaskedPortal "public\portals\astral_altar_pixelated.png" "astral_altar_cutout.png"
Create-CircularMaskedPortal "public\portals\astral_altar_generated.jpg" "astral_altar_generated_cutout.png"
