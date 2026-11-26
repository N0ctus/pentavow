Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\.user_uploaded\media_1795431218771_19dd166f.jpg"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

# 1. Top left lava block (170, 92) to (298, 140)
# Let's crop a 48x48 or 64x64 lava core
# In top-left, molten lava with bubbling orange/yellow is around x=176, y=96 to x=224, y=144
$cropLava = New-Object System.Drawing.Bitmap(48, 48)
$gLava = [System.Drawing.Graphics]::FromImage($cropLava)
$gLava.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gLava.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$gLava.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, 48, 48)), (New-Object System.Drawing.Rectangle(176, 96, 48, 48)), [System.Drawing.GraphicsUnit]::Pixel)
$gLava.Dispose()

# Create a seamless 48x48 repeating lava tile
$cropLava.Save("public\map\pixel_lava_tile_raw.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropLava.Dispose()

# 2. Volcanic ground (cracked charred earth / dark basalt)
# Around x=416, y=288 to x=464, y=336 or top-right x=928, y=416
$cropBasalt = New-Object System.Drawing.Bitmap(48, 48)
$gBasalt = [System.Drawing.Graphics]::FromImage($cropBasalt)
$gBasalt.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gBasalt.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$gBasalt.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, 48, 48)), (New-Object System.Drawing.Rectangle(416, 288, 48, 48)), [System.Drawing.GraphicsUnit]::Pixel)
$gBasalt.Dispose()
$cropBasalt.Save("public\map\pixel_volcano_ground.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropBasalt.Dispose()

$bmp.Dispose()
Write-Host "Extracted raw lava and volcano ground successfully."
