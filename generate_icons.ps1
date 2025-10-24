# Créer une image PNG simple avec un fond coloré et du texte
$width = 1024
$height = 1024
$backgroundColor = "#2196F3"  # Bleu
$text = "Ankiba"
$textColor = "#FFFFFF"
$fontSize = 200

# Créer un objet Bitmap
Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Remplir le fond
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(33, 150, 243))  # #2196F3 en RGB
$graphics.FillRectangle($brush, 0, 0, $width, $height)

# Ajouter du texte
$font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$stringFormat = New-Object System.Drawing.StringFormat
$stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
$stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

$rect = New-Object System.Drawing.RectangleF(0, 0, $width, $height)
$graphics.DrawString($text, $font, $brush, $rect, $stringFormat)

# Sauvegarder l'image
$outputPath = "$PSScriptRoot\resources\android\icon\icon.png"
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Libérer les ressources
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Icône générée : $outputPath"
