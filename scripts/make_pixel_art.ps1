Add-Type -AssemblyName System.Drawing

$srcPath = "public\portals\astral_altar_source.jpg"
$resolvedSrc = (Resolve-Path $srcPath).Path
$img = [System.Drawing.Image]::FromFile($resolvedSrc)

# 1. Downscale to 128x128 for authentic retro 16-bit pixel art
$smallW = 128
$smallH = 128
$smallBmp = New-Object System.Drawing.Bitmap($smallW, $smallH)
$gSmall = [System.Drawing.Graphics]::FromImage($smallBmp)
$gSmall.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::Bicubic
$gSmall.DrawImage($img, 0, 0, $smallW, $smallH)
$gSmall.Dispose()

# 2. Upscale back to 512x512 with NearestNeighbor so each pixel is a crisp retro square
$targetW = 512
$targetH = 512
$pixelArtBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
$gTarget = [System.Drawing.Graphics]::FromImage($pixelArtBmp)
$gTarget.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gTarget.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$gTarget.DrawImage($smallBmp, 0, 0, $targetW, $targetH)
$gTarget.Dispose()

$destPath = (Resolve-Path "public\portals").Path + "\astral_altar_pixelated.png"
$pixelArtBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

$pixelArtBmp.Dispose()
$smallBmp.Dispose()
$img.Dispose()

Write-Output "Successfully generated: $destPath"
