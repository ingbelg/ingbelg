$root = Split-Path -Parent $PSScriptRoot
$port = 5173

$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'
  '.js'='application/javascript; charset=utf-8'; '.png'='image/png'
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'
  '.svg'='image/svg+xml'; '.mp4'='video/mp4'; '.ico'='image/x-icon'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "serving $root on http://localhost:$port/"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
    $path = Join-Path $root ($rel -replace '/', '\')

    if (Test-Path -LiteralPath $path -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $res.Headers['Cache-Control'] = 'no-store'
      $res.Headers['Accept-Ranges'] = 'none'
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $res.StatusCode = 200
      if ($req.HttpMethod -eq 'HEAD') {
        $res.ContentLength64 = $bytes.Length
      } else {
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } else {
      $res.StatusCode = 404
      $res.ContentType = 'text/plain; charset=utf-8'
      $b = [System.Text.Encoding]::UTF8.GetBytes("404 - $rel")
      $res.ContentLength64 = $b.Length
      if ($req.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($b, 0, $b.Length) }
    }
    $res.OutputStream.Close()
  } catch {
    Write-Output ("request error: " + $_.Exception.Message)
  }
}
