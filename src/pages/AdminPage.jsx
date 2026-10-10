
import { useCallback, useEffect, useMemo, useState } from "react";
import supabase from "../supabase";
import "../styles/admin.css";

const COUNTRIES = [
  {
    id: "dubai",
    name: "Dubai",
    amharic: "ዱባይ",
    subtitle: "United Arab Emirates",
    amharicSubtitle: "የተባበሩት የአረብ ኢሚሬቶች",
    table: "dubai_registrations",
    image: "/images/dubiefl.jpg",
  },
  {
    id: "kuwait",
    name: "Kuwait",
    amharic: "ኩዌት",
    subtitle: "State of Kuwait",
    amharicSubtitle: "የኩዌት መንግሥት",
    table: "kuwait_registrations",
    image: "/images/qwitfl.jpg",
  },
  {
    id: "canada",
    name: "Canada",
    amharic: "ካናዳ",
    subtitle: "Canada",
    amharicSubtitle: "ካናዳ",
    table: "canada_registrations",
    image: "/images/canadafl.jpg",
  },
];

const LAST_VISITED_KEY = "elmis_admin_country_last_visited_v1";

const FIELD_LABELS = {
  full_name: ["Full name", "ሙሉ ስም"],
  name: ["Full name", "ሙሉ ስም"],
  applicant_name: ["Applicant name", "የአመልካች ስም"],
  gender: ["Gender", "ጾታ"],
  age: ["Age", "ዕድሜ"],
  height: ["Height", "ቁመት"],
  weight: ["Weight", "ክብደት"],
  phone: ["Phone number", "ስልክ ቁጥር"],
  phone_number: ["Phone number", "ስልክ ቁጥር"],
  email: ["Email address", "ኢሜይል"],
  education_level: ["Education level", "የትምህርት ደረጃ"],
  address: ["Address", "አድራሻ"],
  woreda: ["Woreda", "ወረዳ"],
  kebele: ["Kebele", "ቀበሌ"],
  nationality: ["Nationality", "ዜግነት"],
  date_of_birth: ["Date of birth", "የትውልድ ቀን"],
  place_of_birth: ["Place of birth", "የትውልድ ቦታ"],
  form_date: ["Application date", "የማመልከቻ ቀን"],
  registration_date: ["Registration date", "የምዝገባ ቀን"],
  created_at: ["Submitted at", "የተላከበት ጊዜ"],
  contact_full_name: ["Emergency contact name", "የአደጋ ጊዜ ተጠሪ ስም"],
  contact_gender: ["Contact gender", "የተጠሪ ጾታ"],
  contact_age: ["Contact age", "የተጠሪ ዕድሜ"],
  contact_occupation: ["Contact occupation", "የተጠሪ ሥራ"],
  contact_phone: ["Contact phone", "የተጠሪ ስልክ"],
  passport_number: ["Passport number", "የፓስፖርት ቁጥር"],
  elmis_id: ["E-LMIS ID", "የE-LMIS መለያ"],
  code: ["Registration code", "የምዝገባ ኮድ"],
  status: ["Application status", "የማመልከቻ ሁኔታ"],
  country_started: ["Destination country", "የመዳረሻ አገር"],
  nationality_country: ["Country", "አገር"],
};

const HIDDEN_DETAIL_KEYS = [
  "id",
  "profile_photo_url",
  "photo",
  "photo_url",
  "image_url",
  "documents",
  "vizaimage",
  "visa_image",
  "passport_image",
];

function readVisitTimes() {
  try {
    return JSON.parse(localStorage.getItem(LAST_VISITED_KEY) || "{}");
  } catch {
    return {};
  }
}

function getApplicantName(person) {
  return (
    person.full_name ||
    person.name ||
    person.applicant_name ||
    "Unnamed applicant"
  );
}

function getApplicantPhone(person) {
  return (
    person.phone ||
    person.phone_number ||
    person.contact_phone ||
    "—"
  );
}

function getApplicantDate(person) {
  return (
    person.created_at ||
    person.registration_date ||
    person.form_date ||
    person.created_on ||
    null
  );
}

function formatDate(value) {
  if (!value) return "Not provided / አልተገለጸም";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function getApplicantPhoto(person) {
  return (
    person.profile_photo_url ||
    person.photo ||
    person.photo_url ||
    person.image_url ||
    ""
  );
}

function formatLabel(key) {
  if (FIELD_LABELS[key]) {
    return FIELD_LABELS[key];
  }

  const readable = key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return [readable, readable];
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided / አልተገለጸም";
  }

  if (typeof value === "boolean") {
    return value ? "Yes / አዎ" : "No / አይ";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function AdminPage() {
  const [registrations, setRegistrations] = useState({
    dubai: [],
    kuwait: [],
    canada: [],
  });

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [search, setSearch] = useState("");
  const [visitTimes, setVisitTimes] = useState(readVisitTimes);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [language, setLanguage] = useState("both");

  const bilingual = language === "both";
  const englishOnly = language === "en";

  const t = (english, amharic) => {
    if (englishOnly) return english;
    if (language === "am") return amharic;
    return `${english} / ${amharic}`;
  };

  const loadRegistrations = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const nextRegistrations = {
      dubai: [],
      kuwait: [],
      canada: [],
    };

    const nextErrors = {};

    await Promise.all(
      COUNTRIES.map(async (country) => {
        let result = await supabase
          .from(country.table)
          .select("*")
          .order("created_at", { ascending: false });

        // Some tables may not have a created_at column.
        if (result.error) {
          result = await supabase
            .from(country.table)
            .select("*");
        }

        if (result.error) {
          nextErrors[country.id] = result.error.message;
          return;
        }

        nextRegistrations[country.id] = result.data || [];
      })
    );

    setRegistrations(nextRegistrations);
    setErrors(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadRegistrations();

    const interval = window.setInterval(() => {
      loadRegistrations(true);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [loadRegistrations]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedApplicant(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const totalApplicants = useMemo(
    () =>
      Object.values(registrations).reduce(
        (total, people) => total + people.length,
        0
      ),
    [registrations]
  );

  const getNewCount = (country) => {
    const lastVisited = visitTimes[country.id];

    const cutoff = lastVisited
      ? new Date(lastVisited).getTime()
      : Date.now() - 24 * 60 * 60 * 1000;

    return registrations[country.id].filter((person) => {
      const date = getApplicantDate(person);
      if (!date) return false;

      const timestamp = new Date(date).getTime();

      return !Number.isNaN(timestamp) && timestamp > cutoff;
    }).length;
  };

  const isNewApplicant = (person) => {
    if (!selectedCountry) return false;

    const date = getApplicantDate(person);
    if (!date) return false;

    const cutoff = visitTimes[selectedCountry.id]
      ? new Date(visitTimes[selectedCountry.id]).getTime()
      : Date.now() - 24 * 60 * 60 * 1000;

    const timestamp = new Date(date).getTime();

    return !Number.isNaN(timestamp) && timestamp > cutoff;
  };

  const openCountry = (country) => {
    // Save the previous visit time before updating it, so the
    // notification counts do not disappear before this view opens.
    const now = new Date().toISOString();

    setSelectedCountry(country);
    setSelectedApplicant(null);
    setSearch("");

    const updated = {
      ...visitTimes,
      [country.id]: now,
    };

    setVisitTimes(updated);

    try {
      localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(updated));
    } catch {
      // The dashboard remains usable if localStorage is unavailable.
    }
  };

  const goHome = () => {
    setSelectedCountry(null);
    setSelectedApplicant(null);
    setSearch("");
  };

  const filteredApplicants = useMemo(() => {
    if (!selectedCountry) return [];

    const query = search.trim().toLowerCase();

    return registrations[selectedCountry.id]
      .filter((person) => {
        if (!query) return true;

        return [
          getApplicantName(person),
          getApplicantPhone(person),
          person.email,
          person.passport_number,
          person.elmis_id,
          person.code,
          person.id,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );
      })
      .sort((a, b) => {
        const dateA = new Date(getApplicantDate(a) || 0).getTime();
        const dateB = new Date(getApplicantDate(b) || 0).getTime();
        return dateB - dateA;
      });
  }, [registrations, selectedCountry, search]);

  const renderApplicantFields = (person) => {
    return Object.entries(person)
      .filter(
        ([key, value]) =>
          !HIDDEN_DETAIL_KEYS.includes(key) &&
          value !== null &&
          value !== ""
      )
      .map(([key, value]) => {
        const [english, amharic] = formatLabel(key);

        return (
          <div className="admin-preview-field" key={key}>
            <span className="admin-preview-label">
              {t(english, amharic)}
            </span>

            <strong className="admin-preview-value">
              {formatValue(value)}
            </strong>
          </div>
        );
      });
  };

  const renderDocuments = (person) => {
    const documents = Array.isArray(person.documents)
      ? person.documents
      : [];

    const visaImage = person.vizaimage || person.visa_image;

    if (!documents.length && !visaImage) return null;

    return (
      <section className="admin-preview-section">
        <h3>
          {t("Attached documents", "የተያያዙ ሰነዶች")}
        </h3>

        {documents.length > 0 && (
          <div className="admin-document-list">
            {documents.map((document, index) => {
              const url =
                typeof document === "string"
                  ? document
                  : document?.url || document?.publicUrl || "";

              const name =
                typeof document === "object"
                  ? document?.name || document?.filename
                  : "";

              if (!url) {
                return (
                  <div
                    className="admin-document-item"
                    key={`document-${index}`}
                  >
                    {name || `${t("Document", "ሰነድ")} ${index + 1}`}
                  </div>
                );
              }

              return (
                <a
                  className="admin-document-item"
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  key={`${url}-${index}`}
                >
                  <span>
                    {name || `${t("Document", "ሰነድ")} ${index + 1}`}
                  </span>
                  <span>↗</span>
                </a>
              );
            })}
          </div>
        )}

        {visaImage && (
          <div className="admin-preview-visa">
            <h4>{t("Registered visa", "የተመዘገበ ቪዛ")}</h4>
            <a href={visaImage} target="_blank" rel="noreferrer">
              <img src={visaImage} alt="Registered visa" />
            </a>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <a href="/" className="admin-brand" aria-label="E-LMIS home">
            <img
              src="/images/logo.jpg"
              alt="E-LMIS"
              className="admin-logo"
            />

            <div className="admin-title">
              <h1>E-LMIS Admin</h1>
              <p>
                {t(
                  "Expatriate Work Permit System",
                  "የውጭ አገር ሠራተኞች የሥራ ፈቃድ ሥርዓት"
                )}
              </p>
            </div>
          </a>

          <div className="admin-header-actions">
            <label className="admin-language-control">
              <span>{t("Language", "ቋንቋ")}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label="Choose language"
              >
                <option value="both">English + አማርኛ</option>
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
              </select>
            </label>

            <button
              className="admin-refresh-button"
              type="button"
              onClick={() => loadRegistrations(true)}
              disabled={refreshing}
            >
              {refreshing ? "…" : "↻"}{" "}
              {t("Refresh", "አድስ")}
            </button>
          </div>
        </div>
      </header>

      <main className="admin-content">
        {!selectedCountry ? (
          <>
            <section className="admin-welcome-card admin-dashboard-welcome">
              <div className="admin-welcome-copy">
                <span className="admin-eyebrow">
                  {t("ADMINISTRATION", "አስተዳደር")}
                </span>

                <h2>
                  {t("Welcome to Admin", "ወደ አስተዳደር ገጽ እንኳን በደህና መጡ")}
                </h2>

                <p>
                  {t(
                    "Manage applications from one place. Select a country to see its registered applicants and submitted forms.",
                    "ማመልከቻዎችን ከአንድ ቦታ ያስተዳድሩ። የተመዘገቡ አመልካቾችንና የሞሉትን ቅጾች ለማየት አገር ይምረጡ።"
                  )}
                </p>
              </div>

              <div className="admin-total-card">
                <span>
                  {t("Total registrations", "ጠቅላላ ምዝገባዎች")}
                </span>
                <strong>{loading ? "—" : totalApplicants}</strong>
                <small>
                  {t("Across all countries", "ከሁሉም አገሮች")}
                </small>
              </div>
            </section>

            <div className="admin-section-heading">
              <div>
                <h2>
                  {t("Choose a country", "አገር ይምረጡ")}
                </h2>
                <p>
                  {t(
                    "Click a country card to view registrations.",
                    "ምዝገባዎችን ለማየት የአገሩን ካርድ ይጫኑ።"
                  )}
                </p>
              </div>

              {lastUpdated && (
                <span className="admin-updated-time">
                  {t("Updated", "የተዘመነው")}:{" "}
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="admin-alert admin-alert-warning">
                <strong>
                  {t(
                    "Some registration tables could not be loaded.",
                    "አንዳንድ የምዝገባ ሰንጠረዦች መጫን አልቻሉም።"
                  )}
                </strong>
                <p>
                  {t(
                    "Open the affected country card to see the error.",
                    "ስህተቱን ለማየት ችግር ያለበትን የአገር ካርድ ይክፈቱ።"
                  )}
                </p>
              </div>
            )}

            <section className="admin-country-grid">
              {COUNTRIES.map((country) => {
                const count = registrations[country.id].length;
                const newCount = getNewCount(country);
                const countryError = errors[country.id];

                return (
                  <button
                    className="admin-country-card"
                    type="button"
                    key={country.id}
                    onClick={() => openCountry(country)}
                  >
                    <div className="admin-country-image-wrap">
                      <img
                        src={country.image}
                        alt={`${country.name} flag`}
                        className="admin-country-image"
                      />

                      {newCount > 0 && (
                        <span className="admin-notification-badge">
                          {newCount > 99 ? "99+" : newCount}
                        </span>
                      )}
                    </div>

                    <div className="admin-country-card-content">
                      <h3>
                        {country.name}
                        <span className="admin-amharic-country">
                          {country.amharic}
                        </span>
                      </h3>

                      <p className="admin-country-subtitle">
                        {country.subtitle}
                      </p>

                      <p className="admin-country-subtitle admin-country-subtitle-am">
                        {country.amharicSubtitle}
                      </p>

                      <div className="admin-country-card-bottom">
                        <div>
                          <strong>{loading ? "—" : count}</strong>
                          <span>
                            {t("Total applicants", "ጠቅላላ አመልካቾች")}
                          </span>
                        </div>

                        <span className="admin-country-arrow">↗</span>
                      </div>

                      {newCount > 0 && (
                        <p className="admin-country-new-text">
                          <span className="admin-new-dot" />
                          {newCount}{" "}
                          {t("new registration(s)", "አዲስ ምዝገባ(ዎች)")}
                        </p>
                      )}

                      {countryError && (
                        <p className="admin-country-error-text">
                          {t("Table access error", "የሰንጠረዥ መዳረሻ ስህተት")}
                        </p>
                      )}

                      <span className="admin-country-card-link">
                        {t("View registrations", "ምዝገባዎችን ይመልከቱ")} →
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>

            <p className="admin-footer-note">
              {refreshing
                ? t("Updating data…", "መረጃው በመዘመን ላይ ነው…")
                : t(
                    "Data refreshes automatically every minute.",
                    "መረጃው በየደቂቃው በራስ-ሰር ይዘምናል።"
                  )}
            </p>
          </>
        ) : (
          <>
            <div className="admin-page-toolbar">
              <button
                className="admin-back-button"
                type="button"
                onClick={goHome}
              >
                ← {t("All countries", "ሁሉም አገሮች")}
              </button>

              <button
                className="admin-refresh-button"
                type="button"
                onClick={() => loadRegistrations(true)}
                disabled={refreshing}
              >
                ↻ {t("Refresh", "አድስ")}
              </button>
            </div>

            <section className="admin-welcome-card admin-country-overview">
              <img
                src={selectedCountry.image}
                alt={`${selectedCountry.name} flag`}
                className="admin-selected-country-image"
              />

              <div className="admin-country-overview-copy">
                <h2>
                  {selectedCountry.name}{" "}
                  <span>{selectedCountry.amharic}</span>
                </h2>

                <p>{selectedCountry.subtitle}</p>
                <p>{selectedCountry.amharicSubtitle}</p>
              </div>

              <div className="admin-country-stats">
                <div>
                  <strong>
                    {registrations[selectedCountry.id].length}
                  </strong>
                  <span>{t("Total applicants", "ጠቅላላ አመልካቾች")}</span>
                </div>

                <div>
                  <strong>{getNewCount(selectedCountry)}</strong>
                  <span>{t("New applicants", "አዲስ አመልካቾች")}</span>
                </div>
              </div>
            </section>

            {errors[selectedCountry.id] && (
              <div className="admin-alert admin-alert-error">
                <strong>
                  {t(
                    "Could not load registrations.",
                    "ምዝገባዎችን መጫን አልተቻለም።"
                  )}
                </strong>
                <p>{errors[selectedCountry.id]}</p>
                <p>
                  {t(
                    `Check that the Supabase table "${selectedCountry.table}" exists and allows reading.`,
                    `የSupabase "${selectedCountry.table}" ሰንጠረዥ መኖሩንና ለማንበብ ፈቃድ መኖሩን ያረጋግጡ።`
                  )}
                </p>
              </div>
            )}

            <section className="admin-list-card">
              <div className="admin-list-heading">
                <div>
                  <h2>
                    {t("Registered applicants", "የተመዘገቡ አመልካቾች")}
                  </h2>
                  <p>
                    {filteredApplicants.length}{" "}
                    {t("applicant(s) found", "አመልካች(ዎች) ተገኝተዋል")}
                  </p>
                </div>

                <label className="admin-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t(
                      "Search name, phone, passport…",
                      "ስም፣ ስልክ፣ ፓስፖርት ይፈልጉ…"
                    )}
                    aria-label="Search applicants"
                  />
                </label>
              </div>

              {loading ? (
                <div className="admin-empty-state">
                  <div className="admin-loader" />
                  <p>
                    {t(
                      "Loading registrations…",
                      "ምዝገባዎች በመጫን ላይ ናቸው…"
                    )}
                  </p>
                </div>
              ) : filteredApplicants.length === 0 ? (
                <div className="admin-empty-state">
                  <span className="admin-empty-icon">▤</span>
                  <h3>
                    {t("No applicants found", "አመልካቾች አልተገኙም")}
                  </h3>
                  <p>
                    {search
                      ? t(
                          "Try another search term.",
                          "ሌላ የፍለጋ ቃል ይሞክሩ።"
                        )
                      : t(
                          "No registrations are available yet.",
                          "እስካሁን ምዝገባ አልተገኘም።"
                        )}
                  </p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-applicants-table">
                    <thead>
                      <tr>
                        <th>{t("Applicant", "አመልካች")}</th>
                        <th>{t("Phone", "ስልክ")}</th>
                        <th>{t("Registration date", "የምዝገባ ቀን")}</th>
                        <th>{t("Notice", "ማሳወቂያ")}</th>
                        <th>{t("Details", "ዝርዝር")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredApplicants.map((person, index) => {
                        const photo = getApplicantPhoto(person);
                        const isNew = isNewApplicant(person);

                        return (
                          <tr
                            key={
                              person.id ??
                              `${getApplicantName(person)}-${index}`
                            }
                          >
                            <td>
                              <div className="admin-applicant-cell">
                                {photo ? (
                                  <img
                                    src={photo}
                                    alt=""
                                    className="admin-applicant-avatar"
                                  />
                                ) : (
                                  <div className="admin-applicant-avatar admin-avatar-placeholder">
                                    {getApplicantName(person)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}

                                <div>
                                  <strong>{getApplicantName(person)}</strong>
                                  <small>
                                    {person.email ||
                                      person.passport_number ||
                                      t("Applicant", "አመልካች")}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>{getApplicantPhone(person)}</td>
                            <td>{formatDate(getApplicantDate(person))}</td>

                            <td>
                              {isNew ? (
                                <span className="admin-new-badge">
                                  {t("NEW", "አዲስ")}
                                </span>
                              ) : (
                                <span className="admin-seen-label">
                                  {t("Registered", "ተመዝግቧል")}
                                </span>
                              )}
                            </td>

                            <td>
                              <button
                                className="admin-view-button"
                                type="button"
                                onClick={() => setSelectedApplicant(person)}
                              >
                                {t("View details", "ዝርዝር ይመልከቱ")} →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {selectedApplicant && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedApplicant(null);
            }
          }}
        >
          <section
            className="admin-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-preview-title"
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-eyebrow">
                  {selectedCountry?.name} · {selectedCountry?.amharic}
                </span>

                <h2 id="admin-preview-title">
                  {t("Application form preview", "የማመልከቻ ቅጽ ቅድመ እይታ")}
                </h2>

                <p>
                  {t(
                    "Review the information submitted by this applicant.",
                    "ይህ አመልካች ያስገባውን መረጃ ይመልከቱ።"
                  )}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedApplicant(null)}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <div className="admin-preview-document">
              <div className="admin-preview-document-heading">
                <img src="/images/logo.jpg" alt="E-LMIS" />

                <div>
                  <h3>E-LMIS</h3>
                  <p>
                    {t(
                      "Expatriate Work Permit System",
                      "የውጭ አገር ሠራተኞች የሥራ ፈቃድ ሥርዓት"
                    )}
                  </p>
                  <p>
                    {t("Application form", "የማመልከቻ ቅጽ")} ·{" "}
                    {selectedCountry?.name} / {selectedCountry?.amharic}
                  </p>
                </div>
              </div>

              <div className="admin-preview-section">
                <h3>
                  {t("Applicant information", "የአመልካች መረጃ")}
                </h3>

                <div className="admin-preview-person">
                  {getApplicantPhoto(selectedApplicant) ? (
                    <img
                      src={getApplicantPhoto(selectedApplicant)}
                      alt={getApplicantName(selectedApplicant)}
                    />
                  ) : (
                    <div className="admin-preview-no-photo">
                      {t("No photo", "ፎቶ የለም")}
                    </div>
                  )}

                  <div>
                    <span>
                      {t("Applicant name", "የአመልካች ስም")}
                    </span>
                    <strong>{getApplicantName(selectedApplicant)}</strong>
                    <small>
                      {t("Phone", "ስልክ")}:{" "}
                      {getApplicantPhone(selectedApplicant)}
                    </small>
                  </div>
                </div>
              </div>

              <div className="admin-preview-section">
                <h3>
                  {t("Submitted form details", "የተሞላው ቅጽ ዝርዝር")}
                </h3>

                <div className="admin-preview-fields">
                  {renderApplicantFields(selectedApplicant)}
                </div>
              </div>

              {renderDocuments(selectedApplicant)}

              <div className="admin-preview-footer">
                <span>
                  {t("Application preview", "የማመልከቻ ቅድመ እይታ")}
                </span>
                <span>
                  {t("Registration date", "የምዝገባ ቀን")}:{" "}
                  {formatDate(getApplicantDate(selectedApplicant))}
                </span>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-back-button"
                type="button"
                onClick={() => setSelectedApplicant(null)}
              >
                {t("Close preview", "ቅድመ እይታውን ዝጋ")}
              </button>

              <button
                className="admin-view-button"
                type="button"
                onClick={() => window.print()}
              >
                {t("Print form", "ቅጹን አትም")} ⎙
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
