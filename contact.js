(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  // قراءة بارامتر الخطة من الرابط (مثال: contact.html?plan=premium)
  const planSelect = document.getElementById("plan");
  const params = new URLSearchParams(window.location.search);
  const planFromUrl = params.get("plan");
  if (planSelect && planFromUrl) {
    const allowed = ["premium", "classic", "day", "custom"];
    if (allowed.includes(planFromUrl)) planSelect.value = planFromUrl;
  }

  const statusEl = document.getElementById("formStatus");

  // تعريف الحقول مع دوال التحقق الخاصة بها
  const fields = {
    ownerName: {
      input: document.getElementById("ownerName"),
      error: document.getElementById("errOwnerName"),
      validate(value) {
        if (!value || value.trim().length < 3) return "يرجى إدخال اسم المالك (3 أحرف على الأقل).";
        return "";
      }
    },
    dogName: {
      input: document.getElementById("dogName"),
      error: document.getElementById("errDogName"),
      validate(value) {
        if (!value || value.trim().length < 1) return "يرجى إدخال اسم الكلب.";
        return "";
      }
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("errEmail"),
      validate(value) {
        const v = (value || "").trim();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
        if (!ok) return "يرجى إدخال بريد إلكتروني صحيح.";
        return "";
      }
    },
    phone: {
      input: document.getElementById("phone"),
      error: document.getElementById("errPhone"),
      validate(value) {
        const v = (value || "").trim();
        // مرونة للأرقام الدولية مع + واختياري مسافات/شرطات
        const ok = /^\+?\d[\d\s-]{7,}$/i.test(v);
        if (!ok) return "يرجى إدخال رقم هاتف صحيح (مثال: +85212345678).";
        return "";
      }
    },
    dates: {
      input: document.getElementById("dates"),
      error: document.getElementById("errDates"),
      validate(value) {
        if (!value || value.trim().length < 3) return "يرجى إدخال المدة أو التواريخ بشكل واضح.";
        return "";
      }
    }
  };

  // دالة لعرض رسالة الحالة (نجاح/خطأ)
  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.add("is-visible");
    statusEl.classList.remove("is-success", "is-error");

    if (type === "success") statusEl.classList.add("is-success");
    if (type === "error") statusEl.classList.add("is-error");
  }

  // دالة لمسح رسالة الحالة
  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.classList.remove("is-visible", "is-success", "is-error");
  }

  // دالة لعرض الخطأ لحقل معين
  function setError(fieldKey, message) {
    const f = fields[fieldKey];
    if (!f || !f.error || !f.input) return;

    f.error.textContent = message;
    f.input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  // دالة للتحقق من جميع الحقول
  function validateAll() {
    let firstInvalid = null;

    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      const value = f.input ? f.input.value : "";
      const msg = f.validate(value);
      setError(key, msg);
      if (msg && !firstInvalid) firstInvalid = f.input;
    });

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  // تحقق لحظي عند الخروج من الحقل (blur)
  Object.keys(fields).forEach((key) => {
    const f = fields[key];
    if (!f.input) return;

    f.input.addEventListener("blur", () => {
      const msg = f.validate(f.input.value);
      setError(key, msg);
    });

    f.input.addEventListener("input", () => {
      // إزالة الخطأ تدريجيًا عندما يبدأ المستخدم بالتصحيح
      if (f.input.getAttribute("aria-invalid") === "true") {
        const msg = f.validate(f.input.value);
        setError(key, msg);
      }
      clearStatus();
    });
  });

  // عند إعادة تعيين النموذج (Reset)
  form.addEventListener("reset", () => {
    clearStatus();
    Object.keys(fields).forEach((key) => setError(key, ""));
    // إعادة aria-invalid
    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      if (f.input) f.input.setAttribute("aria-invalid", "false");
    });
  });

  // عند محاولة إرسال النموذج
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearStatus();

    const ok = validateAll();
    if (!ok) {
      setStatus("يرجى تصحيح الحقول المعلّمة قبل الإرسال.", "error");
      return;
    }

    // لا يوجد Backend ضمن المشروع، لذا نستخدم محاكاة إرسال UX-friendly
    setStatus("تم استلام طلب حجز كلبك بنجاح. سنرد عليك بأقرب وقت لتأكيد التوفر.", "success");

    // حفظ مختصر محليًا لتقديم دليل "تحسين UX" (اختياري)
    try {
      const payload = {
        ownerName: fields.ownerName.input.value.trim(),
        dogName: fields.dogName.input.value.trim(),
        dogSize: document.getElementById("dogSize")?.value || "medium",
        email: fields.email.input.value.trim(),
        phone: fields.phone.input.value.trim(),
        plan: planSelect?.value || "classic",
        dates: fields.dates.input.value.trim(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("pawtel_lastInquiry", JSON.stringify(payload));
      console.log("تم حفظ الاستفسار محليًا:", payload);
    } catch (_) {
      // تجاهل أخطاء التخزين (مثلاً إذا كان التخزين المحلي غير متاح)
      console.warn("تعذر حفظ الاستفسار في التخزين المحلي");
    }

    // اختياري: إعادة تعيين النموذج بعد الإرسال الناجح
    form.reset();
  });

})();