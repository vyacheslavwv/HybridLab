#!/usr/bin/env python3
"""
Hybrid Lab - Local Development Server Launcher
Запускает backend и проверяет frontend dependencies
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def print_header(text):
    print("\n" + "=" * 50)
    print(f"  {text}")
    print("=" * 50 + "\n")

def check_python():
    """Check if Python 3.8+ is available"""
    if sys.version_info < (3, 8):
        print("❌ ERROR: Python 3.8+ required")
        sys.exit(1)
    print(f"✓ Python {sys.version.split()[0]} found")

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✓ Node.js {result.stdout.strip()} found")
    except FileNotFoundError:
        print("❌ ERROR: Node.js not found. Install from https://nodejs.org")
        sys.exit(1)

def install_python_deps():
    """Install Python backend dependencies"""
    print_header("Installing Backend Dependencies")
    backend_path = Path(__file__).parent / "metrics-backend"
    requirements = backend_path / "requirements.txt"
    
    if not requirements.exists():
        print("❌ requirements.txt not found")
        sys.exit(1)
    
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-q", "-r", str(requirements)],
            cwd=str(backend_path),
            check=True
        )
        print("✓ Backend dependencies installed\n")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        sys.exit(1)

def install_node_deps():
    """Install Node.js frontend dependencies"""
    print_header("Installing Frontend Dependencies")
    frontend_path = Path(__file__).parent / "hybrid-lab"
    
    try:
        subprocess.run(
            ["npm", "install", "--silent"],
            cwd=str(frontend_path),
            check=True
        )
        print("✓ Frontend dependencies installed\n")
    except subprocess.CalledProcessError:
        print("⚠ Warning: npm install failed (may already be installed)")

def start_backend():
    """Start the backend server"""
    print_header("Starting Backend Server")
    backend_path = Path(__file__).parent / "metrics-backend"
    
    print("Starting uvicorn on http://localhost:8000")
    print("Press Ctrl+C to stop\n")
    
    try:
        subprocess.run(
            [sys.executable, "main.py"],
            cwd=str(backend_path)
        )
    except KeyboardInterrupt:
        print("\n\n✓ Backend stopped")
        sys.exit(0)

if __name__ == "__main__":
    print_header("Hybrid Lab - Local Development Setup")
    
    # Check prerequisites
    check_python()
    check_node()
    
    # Install dependencies
    install_python_deps()
    install_node_deps()
    
    # Start backend
    start_backend()
