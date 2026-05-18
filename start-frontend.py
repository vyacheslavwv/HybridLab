#!/usr/bin/env python3
"""
Start Frontend Development Server
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    frontend_path = Path(__file__).parent / "hybrid-lab"
    
    print("=" * 50)
    print("  Starting Frontend - Hybrid Lab")
    print("=" * 50)
    print()
    print("Frontend: http://localhost:3000")
    print("Press Ctrl+C to stop")
    print()
    
    try:
        subprocess.run(
            ["npm", "run", "dev"],
            cwd=str(frontend_path)
        )
    except KeyboardInterrupt:
        print("\n\nFrontend stopped")
        sys.exit(0)
    except FileNotFoundError:
        print("❌ ERROR: npm not found")
        sys.exit(1)

if __name__ == "__main__":
    main()
