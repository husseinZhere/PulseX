"""
Test script to verify AI service installation and basic functionality
"""

import sys
import subprocess


def check_python_version():
    """Check Python version"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} (OK)")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (Requires 3.8+)")
        return False


def check_dependencies():
    """Check if required packages are installed"""
    print("\nChecking dependencies...")
    required_packages = [
        'fastapi',
        'uvicorn',
        'torch',
        'torchvision',
        'PIL',
        'numpy'
    ]
    
    all_installed = True
    for package in required_packages:
        try:
            if package == 'PIL':
                __import__('PIL')
            else:
                __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} (Not installed)")
            all_installed = False
    
    return all_installed


def test_imports():
    """Test importing service modules"""
    print("\nTesting service imports...")
    try:
        from services.xray_service import XRayService
        print("✅ XRayService")
    except Exception as e:
        print(f"❌ XRayService: {str(e)}")
        return False
    
    try:
        from services.chatbot_service import ChatbotService
        print("✅ ChatbotService")
    except Exception as e:
        print(f"❌ ChatbotService: {str(e)}")
        return False
    
    return True


def main():
    """Main test function"""
    print("="*50)
    print("PulseX AI Service - Installation Test")
    print("="*50)
    
    # Check Python version
    if not check_python_version():
        print("\n⚠️  Please upgrade Python to version 3.8 or higher")
        return False
    
    # Check dependencies
    if not check_dependencies():
        print("\n⚠️  Some dependencies are missing.")
        print("Run: pip install -r requirements.txt")
        return False
    
    # Test imports
    if not test_imports():
        print("\n⚠️  Service import failed. Check error messages above.")
        return False
    
    print("\n" + "="*50)
    print("✅ All checks passed! AI Service is ready to run.")
    print("="*50)
    print("\nTo start the server, run:")
    print("  python main.py")
    print("\nOr:")
    print("  uvicorn main:app --reload")
    print()
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
