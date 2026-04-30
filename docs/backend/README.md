# Backend

This directory contains all backend services for the PulseX graduation project.

## Structure

```
backend/
├── dotnet/              # .NET Web API Backend
│   ├── PulseX.API/      # ASP.NET Core Web API
│   ├── PulseX.Core/     # Domain layer (Models, DTOs, Interfaces)
│   ├── PulseX.Data/     # Data layer (DbContext, Repositories, Migrations)
│   ├── PulseX.slnx      # Solution file
│   ├── global.json      # .NET SDK version configuration
│   └── appsettings.example.json  # Example configuration file
│
└── ai-service/          # Python AI/ML Service
    ├── services/        # AI service implementations
    ├── models/          # Trained ML models
    └── main.py          # FastAPI application entry point
```

## Getting Started

### .NET Backend

Navigate to the `dotnet` directory and build the solution:

```bash
cd backend/dotnet/PulseX.API
dotnet restore
dotnet build
dotnet run
```

For more details, see the root level documentation files.

### AI Service

Navigate to the `ai-service` directory:

```bash
cd backend/ai-service
pip install -r requirements.txt
python main.py
```

For more details, see `backend/ai-service/README.md`.

## Notes

- All backend files have been organized into this directory to maintain a clean project structure
- Frontend files (React/Vite) remain in the `src/` directory at the root level
- No code has been modified during this reorganization - only file locations have changed
