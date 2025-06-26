# Convert JSX to TSX Script
# This script helps automate the conversion of React JSX files to TypeScript TSX files

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

# Check if required type definition files exist
$typesDir = Join-Path -Path $srcDir -ChildPath "types"
$propsFile = Join-Path -Path $typesDir -ChildPath "props.ts"

if (-not (Test-Path -Path $propsFile)) {
    Write-Host "Warning: props.ts file not found. Some type definitions may be missing." -ForegroundColor Yellow
}

# Function to convert JSX to TSX
function ConvertJsxToTsx {
    param (
        [System.IO.FileInfo]$file
    )
    
    try {
        $fileName = $file.Name
        $filePath = $file.FullName
        $fileContent = Get-Content -Path $filePath -Raw
        
        # Create backup
        $backupFile = Join-Path -Path $backupDir -ChildPath $fileName
        Copy-Item -Path $filePath -Destination $backupFile
        
        # Create new file name (replace .jsx with .tsx)
        $newFileName = $fileName -replace "\.jsx$", ".tsx"
        $newFilePath = $filePath -replace "\.jsx$", ".tsx"
        
        # Check if React import exists
        if (-not ($fileContent -match "import React")) {
            $fileContent = "import React from 'react';" + [Environment]::NewLine + $fileContent
        }
        
        # Add FC type to component definition
        $fileContent = $fileContent -replace '(const\s+)(\w+)(\s*=\s*\([^)]*\)\s*=>)', '$1$2: React.FC<$2Props>$3'
        $fileContent = $fileContent -replace '(function\s+)(\w+)(\s*\([^)]*\))', '$1$2: React.FC<$2Props>$3'
        
        # Look for component imports and make sure they're properly typed
        $importRegex = 'import\s+(\w+)\s+from\s+[''"](\./|../|@/)([^''"]*)[''"']'
        $importMatches = [regex]::Matches($fileContent, $importRegex)
        
        foreach ($match in $importMatches) {
            $componentName = $match.Groups[1].Value
            $importPath = $match.Groups[2].Value + $match.Groups[3].Value
            
            # Check if this is likely a component (starts with uppercase)
            if ($componentName -cmatch '^[A-Z]') {
                # Find the interface for this component in props.ts
                if (Test-Path -Path $propsFile) {
                    $propsContent = Get-Content -Path $propsFile -Raw -ErrorAction SilentlyContinue
                    if ($propsContent -and -not ($propsContent -match "${componentName}Props")) {
                        Write-Host "Warning: No props interface found for $componentName" -ForegroundColor Yellow
                    }
                }
            }
        }
        
        # Add typescript props interface if not already present
        if (-not ($fileContent -match "interface\s+\w+Props") -and ($fileContent -match "props")) {
            $componentMatch = [regex]::Match($fileContent, "(const|function)\s+(\w+)")
            $componentName = if ($componentMatch.Success) { $componentMatch.Groups[2].Value } else { $null }
            
            if ($componentName) {
                # Add import for props if needed
                $propsImportRegex = 'import.*from\s+[''"]../types/props[''"]'
                if (-not ($fileContent -match $propsImportRegex)) {
                    $fileContent = $fileContent -replace '(import.*?;[\r\n]+)', "`$1import { ${componentName}Props } from '../types/props';$([Environment]::NewLine)"
                }
            }
        }
        
        # Update state declarations with type annotations
        $fileContent = $fileContent -replace '(useState\()(\[\])([\),])', 'useState<any[]>($2$3'
        $fileContent = $fileContent -replace '(useState\()(\{\})([\),])', 'useState<Record<string, any>>($2$3'
        $fileContent = $fileContent -replace '(useState\<)([\w\<\>\[\]\{\}]+)(\>)', '$1$2$3'
        
        # Update import paths to use TypeScript paths if possible
        $fileContent = $fileContent -replace 'from\s+[''"]\./([\w-]+)\.jsx[''"]', "from './$1'"
        $fileContent = $fileContent -replace 'from\s+[''"]\.\./([\w-]+)\.jsx[''"]', "from '../$1'"
        
        # Write to new file
        Set-Content -Path $newFilePath -Value $fileContent
        
        # Remove old file if new file was created successfully
        if (Test-Path -Path $newFilePath) {
            Remove-Item -Path $filePath
            Write-Host "Converted: $fileName -> $newFileName" -ForegroundColor Green
        } else {
            Write-Host "Error creating new file: $newFilePath" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "Error processing file $fileName : $_" -ForegroundColor Red
    }
}

# Process each file
foreach ($file in $jsxFiles) {
    try {
        ConvertJsxToTsx -file $file
    }
    catch {
        Write-Host "Failed to convert $($file.Name): $_" -ForegroundColor Red
    }
}

# Typescript check after conversion
Write-Host "Running TypeScript type check..." -ForegroundColor Cyan
try {
    Set-Location -Path $projectRoot
    $typeCheckResult = npm run typecheck 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "TypeScript errors found. Please fix manually:" -ForegroundColor Red
        Write-Host $typeCheckResult
    } else {
        Write-Host "TypeScript check passed successfully!" -ForegroundColor Green
    }
}
catch {
    Write-Host "Error running TypeScript check: $_" -ForegroundColor Red
}

Write-Host "Conversion complete! Remember to manually review converted files." -ForegroundColor Cyan

