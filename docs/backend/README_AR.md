# Backend - الواجهة الخلفية

هذا المجلد يحتوي على جميع خدمات الواجهة الخلفية لمشروع التخرج PulseX.

## الهيكل

```
backend/
├── dotnet/              # .NET Web API الواجهة الخلفية
│   ├── PulseX.API/      # ASP.NET Core Web API
│   ├── PulseX.Core/     # طبقة النطاق (Models, DTOs, Interfaces)
│   ├── PulseX.Data/     # طبقة البيانات (DbContext, Repositories, Migrations)
│   ├── PulseX.slnx      # ملف الحل
│   ├── global.json      # إعدادات إصدار .NET SDK
│   └── appsettings.example.json  # ملف إعدادات مثالي
│
└── ai-service/          # خدمة الذكاء الاصطناعي Python
    ├── services/        # تطبيقات خدمة الذكاء الاصطناعي
    ├── models/          # نماذج التعلم الآلي المدربة
    └── main.py          # نقطة دخول تطبيق FastAPI
```

## البدء

### الواجهة الخلفية .NET

انتقل إلى مجلد `dotnet` وقم ببناء الحل:

```bash
cd backend/dotnet/PulseX.API
dotnet restore
dotnet build
dotnet run
```

لمزيد من التفاصيل، راجع ملفات التوثيق في المستوى الجذر.

### خدمة الذكاء الاصطناعي

انتقل إلى مجلد `ai-service`:

```bash
cd backend/ai-service
pip install -r requirements.txt
python main.py
```

لمزيد من التفاصيل، راجع `backend/ai-service/README.md`.

## ملاحظات

- تم تنظيم جميع ملفات الواجهة الخلفية في هذا المجلد للحفاظ على هيكل مشروع نظيف
- ملفات الواجهة الأمامية (React/Vite) تبقى في مجلد `src/` في المستوى الجذر
- لم يتم تعديل أي كود أثناء إعادة التنظيم - تم تغيير مواقع الملفات فقط
