(function () {
  "use strict";

  // سنة الفوتر
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // قائمة الموبايل (Accessible)
  const toggleBtn = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (toggleBtn && nav) {
    const closeNav = () => {
      nav.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    };

    const openNav = () => {
      nav.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
    };

    toggleBtn.addEventListener("click", () => {
      const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      expanded ? closeNav() : openNav();
    });

    // إغلاق القائمة عند الضغط خارجها
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("is-open")) return;
      const target = e.target;
      if (target instanceof Element) {
        const clickedInside = nav.contains(target) || toggleBtn.contains(target);
        if (!clickedInside) closeNav();
      }
    });

    // إغلاق عند الضغط على Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // Accordion (FAQ)
  const accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    const triggers = accordion.querySelectorAll(".accordion-trigger");
    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".accordion-item");
        const panel = item ? item.querySelector(".accordion-panel") : null;
        if (!panel) return;

        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
      });
    });
  }

  // Packages page logic (if present)
  const pricingRoot = document.querySelector("[data-pricing]");
  const packagesRoot = document.querySelector("[data-packages]");
  const compareRoot = document.querySelector("[data-compare]");

  // أسعار أساسية تقريبية للكلاب (HKD) - قابلة للتعديل حسب السيناريو
  // ملاحظة: الأسعار هنا لأغراض واجهة وتجربة مستخدم، وليست التزامًا فعليًا.
  const basePrices = {
    boarding: {
      premium: { small: 550, medium: 620, large: 700 },
      classic: { small: 400, medium: 470, large: 540 },
      day:     { small: 280, medium: 320, large: 360 }
    },
    daycare: {
      premium: { small: 350, medium: 390, large: 430 }, // رعاية نهارية "متميزة"
      classic: { small: 280, medium: 320, large: 360 }, // Day Care عادي
      day:     { small: 280, medium: 320, large: 360 }
    }
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function formatAmount(value) {
    const v = Math.round(value);
    return new Intl.NumberFormat("en-HK").format(v);
  }

  function getPlanDisplayName(planKey) {
    switch (planKey) {
      case "premium": return "Premium";
      case "classic": return "Classic";
      case "day": return "Day Care";
      default: return "—";
    }
  }

  function updateBasePricesUI() {
    if (!packagesRoot) return;

    const premiumEl = packagesRoot.querySelector('[data-price="premium"]');
    const classicEl = packagesRoot.querySelector('[data-price="classic"]');
    const dayEl = packagesRoot.querySelector('[data-price="day"]');

    // افتراضي: boarding + small للعرض "ابتداءً من"
    const p = basePrices.boarding.premium.small;
    const c = basePrices.boarding.classic.small;
    const d = basePrices.daycare.day.small;

    if (premiumEl) premiumEl.textContent = formatAmount(p);
    if (classicEl) classicEl.textContent = formatAmount(c);
    if (dayEl) dayEl.textContent = formatAmount(d);
  }

  function computeEstimate(stayType, duration, dogSize) {
    const d = clamp(duration, 1, 60);
    const type = stayType === "daycare" ? "daycare" : "boarding";

    // التقدير هنا يعتمد على Classic كنقطة افتراضية
    const perUnit = basePrices[type].classic[dogSize] ?? basePrices[type].classic.small;
    return perUnit * d;
  }

  function updateEstimateUI() {
    if (!pricingRoot) return;

    const stayTypeEl = document.getElementById("stayType");
    const durationEl = document.getElementById("duration");
    const dogSizeEl = document.getElementById("dogSize");
    const outEl = document.getElementById("estimateAmount");

    if (!stayTypeEl || !durationEl || !dogSizeEl || !outEl) return;

    const stayType = stayTypeEl.value;
    const duration = Number(durationEl.value || "1");
    const dogSize = dogSizeEl.value;

    const estimate = computeEstimate(stayType, duration, dogSize);
    outEl.textContent = formatAmount(estimate);
  }

  // Comparison logic
  const compareState = {
    selected: [], // up to 2: ["premium","classic"]
    features: {
      premium: { 
        room: "غرفة مميزة فاخرة", 
        play: "نعم (جلسات إضافية)", 
        updates: "تحديثات يومية (صورة/ملاحظة)", 
        grooming: "أولوية في التجميل", 
        daycare: "متاح عند الطلب" 
      },
      classic: { 
        room: "غرفة مكيّفة/مدفّأة", 
        play: "نعم (جلسات يومية)", 
        updates: "عند الطلب", 
        grooming: "اختياري (رسوم إضافية)", 
        daycare: "غير مخصص" 
      },
      day: { 
        room: "منطقة راحة داخلية", 
        play: "نعم (أنشطة نهارية)", 
        updates: "تقرير نهاية اليوم", 
        grooming: "غير متضمن", 
        daycare: "رعاية نهارية كاملة" 
      }
    }
  };

  function updateCompareTable() {
    if (!compareRoot) return;

    const colA = document.getElementById("colA");
    const colB = document.getElementById("colB");
    const selectedEl = document.getElementById("compareSelected");

    const [a, b] = compareState.selected;
    if (colA) colA.textContent = a ? getPlanDisplayName(a) : "—";
    if (colB) colB.textContent = b ? getPlanDisplayName(b) : "—";

    if (selectedEl) {
      selectedEl.textContent = compareState.selected.length
        ? compareState.selected.map(getPlanDisplayName).join("، ")
        : "لا شيء";
    }

    const cells = compareRoot.querySelectorAll("[data-feature][data-col]");
    cells.forEach((cell) => {
      const feature = cell.getAttribute("data-feature");
      const col = cell.getAttribute("data-col");
      const planKey = col === "a" ? a : b;

      if (!feature) return;

      if (!planKey) {
        cell.textContent = "—";
        return;
      }

      const value = compareState.features[planKey]?.[feature] ?? "—";
      cell.textContent = value;
    });
  }

  function toggleCompare(planKey) {
    const exists = compareState.selected.includes(planKey);
    if (exists) {
      compareState.selected = compareState.selected.filter((p) => p !== planKey);
    } else {
      if (compareState.selected.length >= 2) {
        // سياسة واضحة: لا نسمح بأكثر من حزمتين للمقارنة للحفاظ على قابلية القراءة
        compareState.selected.shift();
      }
      compareState.selected.push(planKey);
    }
    updateCompareTable();
    updateCompareButtonsUI();
  }

  function updateCompareButtonsUI() {
    if (!packagesRoot) return;
    const buttons = packagesRoot.querySelectorAll("[data-compare]");
    buttons.forEach((btn) => {
      const key = btn.getAttribute("data-compare");
      if (!key) return;
      const active = compareState.selected.includes(key);
      btn.classList.toggle("is-selected", active);
      btn.textContent = active ? "مضاف للمقارنة ✓" : "أضف للمقارنة";
    });
  }

  // Apply logic if on packages page
  if (packagesRoot) {
    updateBasePricesUI();
  }

  if (pricingRoot) {
    updateEstimateUI();
    pricingRoot.addEventListener("input", updateEstimateUI);
    pricingRoot.addEventListener("change", updateEstimateUI);
  }

  if (packagesRoot && compareRoot) {
    updateCompareTable();
    updateCompareButtonsUI();

    packagesRoot.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const btn = target.closest("[data-compare]");
      if (!btn) return;

      const key = btn.getAttribute("data-compare");
      if (!key) return;

      toggleCompare(key);
    });

    const clearBtn = compareRoot.querySelector("[data-compare-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        compareState.selected = [];
        updateCompareTable();
        updateCompareButtonsUI();
      });
    }
  }

})();