Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\.user_uploaded\media_1795431218771_19dd166f.jpg"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

# Dark charred volcanic basalt rock
# In top-right tileset (x: 880 to 928, y: 288 to 336) is dark basalt stone / rough lava rock
$cropBasalt = New-Object System.Drawing.Bitmap(48, 48)
$g = [System.Drawing.Graphics]::FromImage($cropBasalt)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

# Let's crop x=896, y=288 (48x48)
$g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, 48, 48)), (New-Object System.Drawing.Rectangle(896, 288, 48, 48)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$cropBasalt.Save("public\map\pixel_volcano_ground.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropBasalt.Dispose()

$bmp.Dispose()
Write-Host "Re-extracted dark volcanic basalt ground successfully."
