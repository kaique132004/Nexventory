# Create TypeScript Component Script
# This script creates a new TypeScript React component with the proper structure

param (
    [Parameter(Mandatory=$true)]
    [string]$ComponentName,
    
    [Parameter(Mandatory=$false)]
    [string]$ComponentType = "functional", # functional or class
    
    [Parameter(Mandatory=$false)]
    [string]$Directory = "components" # components, pages, etc.
)

# Set the root directory of the project
$projectRoot = "C:\PROJETOS\stock.frontend"
$srcDir = Join-Path -Path $projectRoot -ChildPath "src"
$typesDir = Join-Path -Path $srcDir -ChildPath "types"
$propsFile = Join-Path -Path $typesDir -ChildPath "props.ts"

# Create component directory if it doesn't exist
$componentDir = Join-Path -Path $srcDir -ChildPath $Directory
if (-not (Test-Path -Path $componentDir)) {
    New-Item -ItemType Directory -Path $componentDir | Out-Null
    Write-Host "Created directory at $componentDir" -ForegroundColor Green
}

# Create component file path
$componentFile = Join-Path -Path $componentDir -ChildPath "$ComponentName.tsx"

# Check if component already exists
if (Test-Path -Path $componentFile) {
    Write-Host "Component $ComponentName already exists at $componentFile" -ForegroundColor Red
    exit 1
}

# Create component content based on type
$componentContent = ""
if ($ComponentType -eq "functional") {
    $componentContent = @"
import React from 'react';
import { ${ComponentName}Props } from '../types/props';

const $ComponentName: React.FC<${ComponentName}Props> = ({ children }) => {
  return (
    <div className="$ComponentName">
      {children}
    </div>
  );
};

export default $ComponentName;
"@
} elseif ($ComponentType -eq "class") {
    $componentContent = @"
import React, { Component } from 'react';
import { ${ComponentName}Props } from '../types/props';

interface ${ComponentName}State {
  // Define component state here
}

class $ComponentName extends Component<${ComponentName}Props, ${ComponentName}State> {
  constructor(props: ${ComponentName}Props) {
    super(props);
    this.state = {
      // Initialize state here
    };
  }

  render() {
    return (
      <div className="$ComponentName">
        {this.props.children}
      </div>
    );
  }
}

export default $ComponentName;
"@
} else {
    Write-Host "Invalid component type. Use 'functional' or 'class'." -ForegroundColor Red
    exit 1
}

# Write component file
Set-Content -Path $componentFile -Value $componentContent
Write-Host "Created component $ComponentName at $componentFile" -ForegroundColor Green

# Check if props interface exists, if not add it
$propsContent = Get-Content -Path $propsFile -Raw -ErrorAction SilentlyContinue
if (-not ($propsContent -match "export interface ${ComponentName}Props")) {
    # Append props interface to props.ts
    $propsInterface = @"

export interface ${ComponentName}Props {
  children?: React.ReactNode;
  // Add more props here
}
"@
    Add-Content -Path $propsFile -Value $propsInterface
    Write-Host "Added ${ComponentName}Props interface to props.ts" -ForegroundColor Green
}

Write-Host "Component creation complete!" -ForegroundColor Cyan

