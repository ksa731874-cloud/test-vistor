# Deployment Guide - BeCare Visitor Site

هذا المشروع جاهز للنشر على عدة منصات استضافة. اتبع التعليمات أدناه لكل منصة.

## المتغيرات المطلوبة (Environment Variables)

جميع المنصات تحتاج إلى المتغيرات التالية:

```
VITE_FIREBASE_API_KEY=AIzaSyB75ueQ7Vzh8IwKKfj6Ei2gVwh8Fk2oPx8
VITE_FIREBASE_APP_ID=1:199219468876:web:a05009face78c0e34ef2e9
VITE_FIREBASE_AUTH_DOMAIN=bcare-app---dashboard.firebaseapp.com
VITE_FIREBASE_MESSAGING_SENDER_ID=199219468876
VITE_FIREBASE_PROJECT_ID=bcare-app---dashboard
VITE_FIREBASE_STORAGE_BUCKET=bcare-app---dashboard.firebasestorage.app
```

---

## Vercel

### الخطوات:
1. اذهب إلى [vercel.com](https://vercel.com)
2. اختر "Import Project"
3. أدخل رابط المستودع: `https://github.com/ksa731874-cloud/test-vistor`
4. في الإعدادات، أضف المتغيرات أعلاه
5. انقر "Deploy"

### الملف المستخدم:
- `vercel.json` - يتم قراءته تلقائياً

---

## Netlify

### الخطوات:
1. اذهب إلى [netlify.com](https://netlify.com)
2. اختر "New site from Git"
3. اختر GitHub وأدخل المستودع
4. في Build settings، تأكد من:
   - Build command: `pnpm run build`
   - Publish directory: `dist/public`
5. أضف المتغيرات في "Site settings → Build & deploy → Environment"
6. انقر "Deploy site"

### الملف المستخدم:
- `netlify.toml` - يتم قراءته تلقائياً

---

## Render

### الخطوات:
1. اذهب إلى [render.com](https://render.com)
2. اختر "New +" ثم "Web Service"
3. اختر "Build and deploy from a Git repository"
4. اختر GitHub وأدخل المستودع
5. في الإعدادات:
   - **Name**: becare-visitor-site
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm run start`
6. أضف المتغيرات في "Environment"
7. انقر "Create Web Service"

### الملف المستخدم:
- `render.yaml` - يتم قراءته تلقائياً

---

## OnRender

### الخطوات:
1. اذهب إلى [onrender.com](https://onrender.com)
2. اختر "New Service"
3. اختر "Web Service"
4. اختر GitHub وأدخل المستودع
5. في الإعدادات:
   - **Name**: becare-visitor-site
   - **Runtime**: Node 22
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm run start`
   - **Publish Directory**: `dist/public`
6. أضف المتغيرات
7. انقر "Create"

### الملف المستخدم:
- `.onrender` - ملف البناء المخصص

---

## ملاحظات مهمة

### 1. Node.js Version
تأكد من أن جميع المنصات تستخدم **Node.js 22** أو أحدث.

### 2. pnpm
جميع المنصات تحتاج إلى **pnpm 10.4.1** أو أحدث.

### 3. Firebase Configuration
تأكد من أن جميع متغيرات Firebase محددة بشكل صحيح على كل منصة.

### 4. Build Output
المشروع ينتج:
- **Frontend**: `dist/public/` (ملفات React المبنية)
- **Server**: `dist/index.js` (خادم Express)

### 5. Troubleshooting

#### الموقع يعرض كود الخادم بدلاً من التطبيق
- تأكد من أن متغيرات Firebase موجودة
- تأكد من أن `outputDirectory` صحيح

#### خطأ في البناء
- تأكد من أن `pnpm-lock.yaml` محدث
- جرّب حذف `node_modules` وإعادة التثبيت محلياً

#### الموقع بطيء
- استخدم خطة مدفوعة بدلاً من الخطة المجانية
- قد تحتاج إلى تحسين الأداء

---

## اختبار محلي

قبل النشر، اختبر محلياً:

```bash
pnpm install
pnpm run build
pnpm run start
```

ثم افتح `http://localhost:3000`

---

## الدعم

إذا واجهت مشاكل:
1. تحقق من سجلات البناء على المنصة
2. تأكد من أن جميع المتغيرات محددة
3. تأكد من أن المستودع عام (Public) أو أن لديك الصلاحيات الكافية
