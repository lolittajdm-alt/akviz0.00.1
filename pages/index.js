import { useState, useEffect } from "react";

// Системный шрифт iOS
const systemFont = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif`;

export default function Home() {
  // ——— Состояние формы ———
  const [form, setForm] = useState({
    sector: "",
    subdivision: "",
    position: "",
    location: "",
    time: "",
    selectedGoals: [],
    side: null,
    targetNumber: "",
    noIssue: false,
    name: null,
    quantity: 1,
    azimuth: "",
    course: "",
    distance: "",
    height: "",
    detectionMethods: [],
    result: null,
    description: "",
    additionalInfo: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [showTopFields, setShowTopFields] = useState(true);
  const [locks, setLocks] = useState({
    sector: false,
    subdivision: false,
    position: false,
    location: false,
  });
  const [errors, setErrors] = useState({
  distance: false,
  height: false,
  });
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [ammoList, setAmmoList] = useState([]);
  const [ammoQuantities, setAmmoQuantities] = useState({});

  const goalsList = [ "БПЛА", "Постріли(ЗУ,кулемет)", "Виходи(ПЗРК,ЗРК)", "Вибух", "КР", "Гелікоптер", "Літак малий", "Літак великий", "Квадрокоптер", "Зонд", "Інше (деталі в описі)" ];
  const namesList = ["Shahed-136", "Гербера", "Невстановлений"];
  const updateTime = () => {
    const now = new Date();
    setForm(f => ({ ...f, time: now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }) }));
  };

  // ——— Эффекты ———
  useEffect(updateTime, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("show_top_fields");
      if (saved !== null) setShowTopFields(saved === "true");
      const l = localStorage.getItem("report_locks");
      if (l) setLocks(JSON.parse(l));
      ["sector","subdivision","position","location"].forEach(key => {
        const v = localStorage.getItem(`report_${key}`);
        if (v !== null) setForm(f => ({ ...f, [key]: v }));
      });
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("show_top_fields", showTopFields);
    localStorage.setItem("report_locks", JSON.stringify(locks));
  }, [showTopFields, locks]);

  // ——— Хендлеры ———
  // ——— Встановлення поточного часу ———
const setTimeNow = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  setForm(f => ({ ...f, time: `${hours}:${minutes}` }));
};
  const handleChange = e => {
    const { name, value } = e.target;
    if (locks[name]) return;
    setForm(f => ({ ...f, [name]: value }));
    if (["sector","subdivision","position","location"].includes(name)) {
      localStorage.setItem(`report_${name}`, value);
    }
  };
  const toggleLock = field => setLocks(l => ({ ...l, [field]: !l[field] }));
  const toggleGoal = g => setForm(f => ({
    ...f,
    selectedGoals: f.selectedGoals.includes(g)
      ? f.selectedGoals.filter(x => x !== g)
      : [...f.selectedGoals, g]
  }));
  const selectSide = s => setForm(f => ({ ...f, side: f.side === s ? null : s }));
  const selectName = n => setForm(f => ({ ...f, name: n }));
  const changeQuantity = d => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity + d) }));
  const validateNumeric = (v, max=null) => /^\d+$/.test(v) && (max===null || +v <= max);
  // ——— Універсальний хендлер числових полів ———
const onFieldNumeric = (fieldName, maxLength = 3) => (e) => {
  const raw = e.target.value;
  const digits = raw.replace(/\D/g, "").slice(0, maxLength);
  setForm((prev) => ({ ...prev, [fieldName]: digits }));

  if (fieldName === "distance") {
    setErrors((prev) => ({ ...prev, distance: !validateDistance(digits) }));
  }
  if (fieldName === "height") {
    setErrors((prev) => ({ ...prev, height: !validateHeight(digits) }));
  }
};
  const toggleDetection = m => setForm(f => ({
    ...f,
    detectionMethods: f.detectionMethods.includes(m)
      ? f.detectionMethods.filter(x => x !== m)
      : [...f.detectionMethods, m]
  }));
  const copyReport = () => {
    const text = generateReportText().replace(/\n/g, "\r\n");
    navigator.clipboard.writeText(text);
    alert("Скопійовано!");
  };
  const openWhatsApp = () => {
    window.location.href = `whatsapp://send?text=${encodeURIComponent(generateReportText())}`;
  };

  // ——— Валидации ———
const validateCourse = (v) => /^\d{1,3}$/.test(v) && +v >= 0 && +v <= 359;
const validateAzimuth = (v) => /^\d{1,3}$/.test(v) && +v >= 0 && +v <= 359;
const validateDistance = (v) => /^\d+$/.test(v) && +v > 0;
const validateHeight = (v) => /^\d+$/.test(v) && +v > 0;

const onCourseChange = (e) => {
const value = e.target.value.replace(/\D/g, "").slice(0, 3);
setForm((f) => ({ ...f, course: value }));
setErrors((f) => ({ ...f, course: !validateCourse(value) }));
};

const onAzimuthChange = (e) => {
const value = e.target.value.replace(/\D/g, "").slice(0, 3);
setForm((f) => ({ ...f, azimuth: value }));
setErrors((f) => ({ ...f, azimuth: !validateAzimuth(value) }));
};

const onDistanceChange = (e) => {
  const value = e.target.value.replace(/\D/g, "").slice(0, 5);
  setForm((f) => ({ ...f, distance: value }));
  setErrors((err) => ({ ...err, distance: !validateDistance(value) }));
};

const onHeightChange = (e) => {
  const value = e.target.value.replace(/\D/g, "").slice(0, 5);
  setForm((f) => ({ ...f, height: value }));
  setErrors((err) => ({ ...err, height: !validateHeight(value) }));
};

const changeDistance = (delta) => {
  let x = +form.distance || 0;
  x += delta;
  if (x < 0) x = 0;
  const updated = String(x);
  setForm((f) => ({ ...f, distance: updated }));
  setErrors((err) => ({ ...err, distance: !validateDistance(updated) }));
};

const changeHeight = (delta) => {
  let h = +form.height || 0;
  h += delta;
  if (h < 0) h = 0;
  const updated = String(h);
  setForm((f) => ({ ...f, height: updated }));
  setErrors((err) => ({ ...err, height: !validateHeight(updated) }));
};
  
  // ——— Генерация текста ———
  const generateReportText = () => [
    form.sector || form.subdivision || form.position
      ? `П: ${[form.sector,form.subdivision,form.position].filter(Boolean).join(", ")}`
      : null,
    `Ціль: ${[
      ...form.selectedGoals,
      form.side,
      form.noIssue ? "Без видачі" : `по цілі ${form.targetNumber || ""}`
    ].filter(Boolean).join(", ")}`,
    form.height ? `Висота: ${form.height} м` : null,
    form.distance ? `Відстань: ${form.distance} м` : null,
    form.quantity ? `Кількість: ${form.quantity} од.` : null,
    form.azimuth ? `А: ${form.azimuth}°` : null,
    form.course ? `К: ${form.course}°` : null,
    form.location ? `НП: ${form.location}` : null,
    form.time ? `Ч: ${form.time}` : null,
    form.detectionMethods.length ? `Вияв: ${form.detectionMethods.join(", ")}` : null,
    form.result ? `ПП: ${form.result}` : null,
    form.description ? `Опис: ${form.description}` : null
  ].filter(Boolean).join("\n");

  // ——— Стили iOS ———
  const iosContainer = {
    fontFamily: systemFont,
    backgroundColor: "#F2F2F7",
    minHeight: "100vh",
    padding: "1rem",
    boxSizing: "border-box",
  };
  const iosCard = {
    backgroundColor: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  };
  const iosLabel = { fontSize: "0.9rem", marginBottom: "0.3rem", color: "#1C1C1E" };
  const iosInput = {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#ECECEC",
    fontSize: "1rem",
    color: "#1C1C1E",
    marginBottom: "0.6rem",
  };
  const iosButton = {
    flex: 1,
    padding: "0.6rem",
    borderRadius: "12px",
    border: "none",
    fontSize: "1rem",
    color: "#fff",
    background: "#0A84FF",
    margin: "0.3rem",
    cursor: "pointer",
  };

  return (
    <div style={iosContainer}>
      {/* Заголовок */}
      <div style={{ ...iosCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#1C1C1E" }}>АкВіз 2.0</h1>
        <button onClick={() => window.location.reload()} style={{ ...iosButton, background: "#8E8E93" }}>
          Оновити
        </button>
      </div>

{/* ——— Кнопка скрыть/показать поля ——— */}
<div style={{ ...iosCard, display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
  <button
    onClick={() => setShowTopFields(prev => !prev)}
    style={{ ...iosButton, background: "#8E8E93" }}
  >
    {showTopFields ? "Приховати поля" : "Показати поля"}
  </button>
</div>

{/* ——— Первые 4 поля ——— */}
{showTopFields && (
  <div style={iosCard}>
    {/* Сектор */}
    <label style={iosLabel}>Сектор</label>
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <input
        name="sector"
        value={form.sector}
        onChange={handleChange}
        style={iosInput}
        placeholder="Сектор Центр"
      />
      <button onClick={() => toggleLock("sector")} style={iosButton}>
        {locks.sector ? "🔒" : "✏️"}
      </button>
    </div>
    {/* Підрозділ */}
    <label style={iosLabel}>Підрозділ</label>
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <input
        name="subdivision"
        value={form.subdivision}
        onChange={handleChange}
        style={iosInput}
        placeholder="напр. ____ зрап, зрадн ___ омбр"
      />
      <button onClick={() => toggleLock("subdivision")} style={iosButton}>
        {locks.subdivision ? "🔒" : "✏️"}
      </button>
    </div>
    {/* Позиція */}
    <label style={iosLabel}>Позиція</label>
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <input
        name="position"
        value={form.position}
        onChange={handleChange}
        style={iosInput}
        placeholder="Наприклад МВГ Халк"
      />
      <button onClick={() => toggleLock("position")} style={iosButton}>
        {locks.position ? "🔒" : "✏️"}
      </button>
    </div>
    {/* Населений пункт */}
    <label style={iosLabel}>Населений пункт</label>
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        style={iosInput}
        placeholder="Наприклад м.Кривий Ріг,Дніпропетровська обл."
      />
      <button onClick={() => toggleLock("location")} style={iosButton}>
        {locks.location ? "🔒" : "✏️"}
      </button>
    </div>
  </div>
)}

      
          
      {/* Тип цілі */}
<div style={iosCard}>
  <label style={iosLabel}>Ціль</label>
  <div style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "0.3rem", // менший відступ між кнопками
  }}>
    {goalsList.map(goal => (
      <button
        key={goal}
        onClick={() => toggleGoal(goal)}
        style={{
          ...iosButton,
          padding: "0.3rem 0.6rem", // менший padding
          fontSize: "0.8rem", // менший шрифт
          borderRadius: "8px", // трохи менший радіус
          background: form.selectedGoals.includes(goal) ? "#32D74B" : "#EBEBF5",
          color: form.selectedGoals.includes(goal) ? "#fff" : "#1C1C1E",
        }}
      >
        {goal}
      </button>
    ))}
  </div>
</div>

      {/* Сторона */}
      <div style={iosCard}>
        <label style={iosLabel}>Сторона</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["Ворожий","Свій","Нейтральний"].map(s => (
            <button
              key={s}
              onClick={() => selectSide(s)}
              style={{
                ...iosButton,
                background: form.side === s ? "#32D74B" : "#EBEBF5",
                color: form.side === s ? "#fff" : "#1C1C1E",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

     {/* ——— Номер цілі ——— */}
<div style={iosCard}>
  <label style={iosLabel}>Номер цілі</label>

  {form.noIssue ? (
    // Кнопка "Видати номер" на всю ширину
    <button
      onClick={() =>
        setForm((f) => ({
          ...f,
          noIssue: false,
          targetNumber: "",
        }))
      }
      style={{
        width: "100%",
        height: "44px",
        borderRadius: "12px",
        border: "none",
        fontSize: "1rem",
        backgroundColor: "#FF375F",
        color: "#fff",
      }}
    >
      Видати номер
    </button>
  ) : (
    // Поле вводу + кнопка "Без видачі" в один ряд
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input
        name="targetNumber"
        value={form.targetNumber}
        onChange={onFieldNumeric("targetNumber", 9999 )}
        placeholder="по цілі"
        inputMode="numeric"
        pattern="\d*"
        style={{
          flex: 1,
          height: "44px",
          borderRadius: "12px",
          backgroundColor: "#E5E5EA",
          border:
            form.targetNumber.trim() === "" ? "1px solid #FF3B30" : "none",
          padding: "0 1rem",
          fontSize: "1rem",
          color: "#1C1C1E",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={() =>
          setForm((f) => ({
            ...f,
            noIssue: true,
            targetNumber: "",
          }))
        }
        style={{
          height: "44px",
          padding: "0 1rem",
          borderRadius: "12px",
          border: "none",
          fontSize: "1rem",
          backgroundColor: "#E5E5F0",
          color: "#1C1C1E",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Без видачі
      </button>
    </div>
  )}

  {/* Повідомлення про помилку */}
  {!form.noIssue && form.targetNumber.trim() === "" && (
    <div style={{ color: "#FF3B30", fontSize: "0.75rem", marginTop: "0.25rem" }}>
      Поле має бути заповненим!
    </div>
  )}
</div>
              
{/* Назва (БПЛА) */}
      {form.selectedGoals.includes("БПЛА") && (
        <div style={iosCard}>
          <label style={iosLabel}>Назва</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {namesList.map(n => (
              <button
                key={n}
                onClick={() => selectName(n)}
                style={{
                  ...iosButton,
                  background: form.name === n ? "#0A84FF" : "#EBEBF5",
                  color: form.name === n ? "#fff" : "#1C1C1E",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Остальные поля (количество, азимут, курс, расстояние, высота) */}
      <div style={iosCard}>
  <label style={iosLabel}>Кількість</label>
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
    <input
      type="number"
      value={form.quantity}
      onChange={(e) =>
        setForm((f) => ({
          ...f,
          quantity: Math.max(1, +e.target.value),
        }))
      }
      style={{ ...iosInput, textAlign: "center", flex: 1 }}
    />
    <button
      onClick={() => changeQuantity(-1)}
      style={{
        ...iosButton,
        padding: "0.5rem 0.9rem",
        backgroundColor: "#FF375F",
        color: "#fff",
      }}
    >
      –
    </button>
    <button
      onClick={() => changeQuantity(1)}
      style={{
        ...iosButton,
        padding: "0.5rem 0.9rem",
        backgroundColor: "#32D74B",
        color: "#fff",
      }}
    >
      +
    </button>
  </div>
</div>
     
        <div style={iosCard}>
  {/* Азимут */}
  <label style={iosLabel}>Азимут (°)</label>
  <input
    type="text"
    inputMode="numeric"
    pattern="\d*"
    name="azimuth"
    value={form.azimuth}
    onChange={onAzimuthChange}
    placeholder="Вкажіть азимут"
    style={{
      ...iosInput,
      border:
        form.azimuth.trim() === "" || !validateAzimuth(form.azimuth)
          ? "1px solid #FF3B30"
          : "none",
      marginBottom: "0.5rem",
    }}
  />
  {(form.azimuth.trim() === "" || !validateAzimuth(form.azimuth)) && (
    <div style={{ color: "#FF3B30", fontSize: "0.75rem", marginBottom: "0.8rem" }}>
      Поле має бути заповненим!
    </div>
  )}

  {/* Курс */}
  <label style={iosLabel}>Курс (°)</label>
  <input
    type="text"
    inputMode="numeric"
    pattern="\d*"
    name="course"
    value={form.course}
    onChange={onCourseChange}
    placeholder="Вкажіть курс"
    style={{
      ...iosInput,
      border:
        form.course.trim() === "" || !validateCourse(form.course)
          ? "1px solid #FF3B30"
          : "none",
    }}
  />
  {(form.course.trim() === "" || !validateCourse(form.course)) && (
    <div style={{ color: "#FF3B30", fontSize: "0.75rem", marginTop: "0.3rem" }}>
      Поле має бути заповненим!
    </div>
  )}
</div>

{/* ——— Відстань і Висота ——— */}
<div style={{
  border: "1px solid #ccc",
  borderRadius: "16px",
  padding: "1rem",
  marginBottom: "1.5rem",
  backgroundColor: "#fff",
}}>
  {/* Відстань */}
  <div style={{ marginBottom: "1rem" }}>
    <label style={iosLabel}>Відстань, м*</label>
    <input
      type="text"
      inputMode="numeric"
      value={form.distance}
      onChange={onDistanceChange}
      onFocus={() => setFocusedField("distance")}
      onBlur={() => setFocusedField(null)}
      placeholder="Відстань до цілі"
      style={{
        ...iosInput,
        border: errors.distance ? "1px solid #FF3B30" : "1px solid transparent",
      }}
    />
    {errors.distance && (
      <div style={{ color: "#FF3B30", fontSize: "0.75rem", marginTop: "0.25rem" }}>
        Поле має бути заповненим!
      </div>
    )}
    {focusedField === "distance" && (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
        {["+100", "+1000", "+5000", "-100", "-1000", "-5000"].map((label) => {
          const isNegative = label.startsWith("-");
          return (
            <button
              key={label}
              onClick={() => changeDistance(Number(label))}
              style={{
                ...iosButton,
                backgroundColor: isNegative ? "#FF3B30" : "#34C759",
                color: "#fff",
                padding: "0.5rem 0.3rem",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    )}
  </div>

  {/* Висота */}
  <div>
    <label style={iosLabel}>Висота, м*</label>
    <input
      type="text"
      inputMode="numeric"
      value={form.height}
      onChange={onHeightChange}
      onFocus={() => setFocusedField("height")}
      onBlur={() => setFocusedField(null)}
      placeholder="Висота над рівнем"
      style={{
        ...iosInput,
        border: errors.height ? "1px solid #FF3B30" : "1px solid transparent",
      }}
    />
    {errors.height && (
      <div style={{ color: "#FF3B30", fontSize: "0.75rem", marginTop: "0.25rem" }}>
        Поле має бути заповненим!
      </div>
    )}
    {focusedField === "height" && (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
        {["+100", "+500", "-100", "-500"].map((label) => {
          const isNegative = label.startsWith("-");
          return (
            <button
              key={label}
              onClick={() => changeHeight(Number(label))}
              style={{
                ...iosButton,
                backgroundColor: isNegative ? "#FF3B30" : "#34C759",
                color: "#fff",
                padding: "0.5rem 0.3rem",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    )}
  </div>
</div>

      {/* Час */}
<div style={iosCard}>
  <label style={iosLabel}>Час</label>
  <input
    type="text"
    name="time"
    value={form.time}
    readOnly
    style={{ ...iosInput, marginBottom: "0.5rem" }}
  />
  <div style={{ display: "flex", gap: "0.5rem" }}>
    <button onClick={setTimeNow} style={{ ...iosButton, backgroundColor: "#34C759", color: "#fff", flex: 1 }}>
      Щойно
    </button>
    <button onClick={() => changeTimeByMinutes(1)} style={{ ...iosButton, backgroundColor: "#34C759", color: "#fff", flex: 1 }}>
      +1 хв
    </button>
    <button onClick={() => changeTimeByMinutes(-1)} style={{ ...iosButton, backgroundColor: "#FF3B30", color: "#fff", flex: 1 }}>
      –1 хв
    </button>
  </div>
</div>
      {/* ——— Вияв ——— */}
<div style={iosCard}>
  <label style={iosLabel}>Вияв</label>

  {/* Перший рядок: дві кнопки */}
  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
    {["Акустично", "Візуально"].map((method) => (
      <button
        key={method}
        onClick={() => toggleDetection(method)}
        style={{
          ...iosButton,
          flex: 1,
          background: form.detectionMethods.includes(method) ? "#32D74B" : "#EBEBF5",
          color: form.detectionMethods.includes(method) ? "#fff" : "#1C1C1E",
        }}
      >
        {method}
      </button>
    ))}
  </div>

  {/* Другий рядок: одна велика кнопка */}
  <button
    onClick={() => toggleDetection("Із застосуванням приладів спостереження")}
    style={{
      ...iosButton,
      width: "100%",
      background: form.detectionMethods.includes("Із застосуванням приладів спостереження")
        ? "#32D74B"
        : "#EBEBF5",
      color: form.detectionMethods.includes("Із застосуванням приладів спостереження")
        ? "#fff"
        : "#1C1C1E",
    }}
  >
    Із застосуванням приладів спостереження
  </button>
</div>

      {/* ——— Результат ——— */}
<div
  style={{
    border: "1px solid #ccc",
    borderRadius: "16px",
    padding: "1rem",
    marginBottom: "1.5rem",
    backgroundColor: "#fff",
  }}
>
  <label style={iosLabel}>Результат</label>

  {/* Перший ряд — 2 кнопки */}
  <div
    style={{
      display: "flex",
      gap: "0.5rem",
      marginBottom: "0.5rem",
    }}
  >
    {["Виявлено", "Обстріляно"].map((result) => (
      <button
        key={result}
        onClick={() => setForm((f) => ({ ...f, result }))}
        style={{
          ...iosButton,
          flex: 1,
          padding: "0.4rem 0.6rem",
          fontSize: "0.85rem",
          backgroundColor: form.result === result ? "#32D74B" : "#EBEBF5",
          color: form.result === result ? "#fff" : "#1C1C1E",
          borderRadius: "10px",
        }}
      >
        {result}
      </button>
    ))}
  </div>

  {/* Другий ряд — одна кнопка на всю ширину */}
  <button
    onClick={() => setForm((f) => ({ ...f, result: "Уражено" }))}
    style={{
      ...iosButton,
      width: "100%",
      padding: "0.6rem",
      fontSize: "0.9rem",
      backgroundColor: form.result === "Уражено" ? "#32D74B" : "#EBEBF5",
      color: form.result === "Уражено" ? "#fff" : "#1C1C1E",
      borderRadius: "10px",
    }}
  >
    Уражено
  </button>
</div>

      {/* Інша інформація */}
      <div style={iosCard}>
        <label style={iosLabel}>Опис</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Додаткова інформація"
          rows={3}
          style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#ECECEC",
            fontSize: "1rem",
            color: "#1C1C1E",
            resize: "none",
          }}
        />
      </div>

      {/* Кнопки копировать и WhatsApp */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <button onClick={copyReport} style={iosButton}>Копіювати</button>
        <button onClick={openWhatsApp} style={{ ...iosButton, background: "#34C759" }}>WhatsApp</button>
      </div>

      {/* Отображение отчёта */}
      <div style={iosCard}>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "#1C1C1E" }}>
          {generateReportText()}
        </pre>
      </div>
    </div>
  );
}
