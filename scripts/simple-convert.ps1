# Simple JSX to TSX Conversion Script
# This script performs basic conversion of React JSX files to TypeScript TSX files

# Set the root directory of the project
$projectRoot = "C:\PROJETOS\stock.frontend"
$srcDir = Join-Path -Path $projectRoot -ChildPath "src"

# Create backup directory
$backupDir = Join-Path -Path $projectRoot -ChildPath "backup_jsx_files"
if (-not (Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "Created backup directory at $backupDir" -ForegroundColor Green
}

# Get all JSX files
$jsxFiles = Get-ChildItem -Path $srcDir -Recurse -Filter "*.jsx"
Write-Host "Found $($jsxFiles.Count) JSX files to convert" -ForegroundColor Cyan

foreach ($file in $jsxFiles) {
    try {
        $fileName = $file.Name
        $filePath = $file.FullName
        Write-Host "Processing $fileName..." -ForegroundColor Yellow
        
        # Read file content
        $content = Get-Content -Path $filePath -Raw
        
        # Create backup
        $backupFile = Join-Path -Path $backupDir -ChildPath $fileName
        Copy-Item -Path $filePath -Destination $backupFile
        Write-Host "  Backup created at $backupFile" -ForegroundColor Gray
        
        # 1. Add React import if missing
        if (-not $content.Contains("import React")) {
            $content = "import React from 'react';`n$content"
            Write-Host "  Added React import" -ForegroundColor Gray
        }
        
        # 2. Add simple TypeScript annotations
        # Add React.FC type to functional components
        if ($content -match "const\s+(\w+)\s*=\s*\(") {
            $componentName = $matches[1]
            Write-Host "  Found component: $componentName" -ForegroundColor Gray
            
            # Manually construct the replacement pattern to avoid escaping issues
            $findPattern = "const $componentName = ("
            $replacePattern = "const $componentName`: React.FC = ("
            
            # Do the replacement
            $content = $content.Replace($findPattern, $replacePattern)
            Write-Host "  Added React.FC type to component" -ForegroundColor Gray
            
            # Add props interface import if it looks like props are used
            if ($content -match "props" -and -not $content.Contains("import { ${componentName}Props }")) {
                # Find first import statement to place new import after it
                $firstImport = $content -match "import.*?;"
                if ($firstImport) {
                    $importMatch = $matches[0]
                    $newImport = "$importMatch`nimport { ${componentName}Props } from '../types/props';"
                    $content = $content.Replace($importMatch, $newImport)
                    Write-Host "  Added props interface import" -ForegroundColor Gray
                }
                
                # Update component definition to use props interface
                $reactFcPattern = "React.FC"
                $reactFcWithPropsPattern = "React.FC<${componentName}Props>"
                $content = $content.Replace($reactFcPattern, $reactFcWithPropsPattern)
                Write-Host "  Updated component to use props interface" -ForegroundColor Gray
            }
        }
        
        # 3. Update import paths (remove .jsx extensions)
        $content = $content.Replace(".jsx'", "'")
        $content = $content.Replace('.jsx"', '"')
        Write-Host "  Updated import paths" -ForegroundColor Gray
        
        # 4. Create new TSX file
        $newFilePath = $filePath -replace "\.jsx$", ".tsx"
        Set-Content -Path $newFilePath -Value $content
        Write-Host "  Created new TSX file at $newFilePath" -ForegroundColor Gray
        
        # Remove old JSX file if new file was created successfully
        if (Test-Path -Path $newFilePath) {
            Remove-Item -Path $filePath
            Write-Host "Successfully converted $fileName to $(Split-Path $newFilePath -Leaf)" -ForegroundColor Green
        } else {
            Write-Host "Error: New TSX file was not created" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "Error processing file $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nConversion complete. Remember to check for any TypeScript errors." -ForegroundColor Cyan
Write-Host "Run 'npm run typecheck' to verify the conversion." -ForegroundColor Cyan

