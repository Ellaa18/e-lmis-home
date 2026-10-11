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
pdfBucket: "dubai-registration-pdfs",
image: "/images/dubiefl.jpg",
},
{
id: "kuwait",
name: "Kuwait",
amharic: "ኩዌት",
subtitle: "State of Kuwait",
amharicSubtitle: "የኩዌት መንግሥት",
table: "kuwait_registrations",
pdfBucket: "kuwait-registration-pdfs",
image: "/images/qwitfl.jpg",
},
{
id: "canada",
name: "Canada",
amharic: "ካናዳ",
subtitle: "Canada",
amharicSubtitle: "ካናዳ",
table: "canada_registrations",
pdfBucket: "canada-registration-pdfs",
image: "/images/canadafl.jpg",
},
];
const LAST_VISITED_KEY = "elmis_admin_country_last_visited_v1";
const FIELD_LABELS = {
full_name: ["Full name", "ሙሉ ስም"],
name: ["Full name", "ሙሉ ስም"],
applicant_name: ["Applicant name", "የአመልካች ስም"],
phone: ["Phone number", "ስልክ ቁጥር"],
phone_number: ["Phone number", "ስልክ ቁጥር"],
contact_phone: ["Contact phone", "የተጠሪ ስልክ"],
email: ["Email address", "ኢሜይል"],
passport_number: ["Passport number", "የፓስፖርት ቁጥር"],
elmis_id: ["E-LMIS ID", "የE-LMIS መለያ"],
code: ["Registration code", "የምዝገባ ኮድ"],
};
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
return person.phone || person.phone_number || person.contact_phone || "—";
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
if (Number.isNaN(date.getTime())) return String(value);
return date.toLocaleDateString(undefined, {
year: "numeric",
month: "short",
day: "numeric",
});
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
function getPdfPath(person) {
return person.pdf_path || person.registration_pdf_path || "";
}
function getPdfUrl(person) {
return person.pdf_url || person.registration_pdf_url || "";
}
function getFieldLabel(key, language) {
const known = FIELD_LABELS[key];
if (known) {
if (language === "en") return known[0];
if (language === "am") return known[1];
return `${known[0]} / ${known[1]}`;
}
const readable = key
.replace(/_/g, " ")
.replace(/\b\w/g, (letter) => letter.toUpperCase());
return readable;
}
function getNewCount(people, lastVisited) {
const cutoff = lastVisited
? new Date(lastVisited).getTime()
: Date.now() - 24 * 60 * 60 * 1000;
return people.filter((person) => {
const date = getApplicantDate(person);
if (!date) return false;
const timestamp = new Date(date).getTime();
return !Number.isNaN(timestamp) && timestamp > cutoff;
}).length;
}
function AdminPage() {
const [registrations, setRegistrations] = useState({
dubai: [],
kuwait: [],
canada: [],
});
const [selectedCountry, setSelectedCountry] = useState(null);
const [search, setSearch] = useState("");
const [visitTimes, setVisitTimes] = useState(readVisitTimes);
const [language, setLanguage] = useState("both");
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [errors, setErrors] = useState({});
const [lastUpdated, setLastUpdated] = useState(null);
const [rowBusy, setRowBusy] = useState("");
const [notice, setNotice] = useState(null);
const t = (english, amharic) => {
if (language === "en") return english;
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
try {
await Promise.all(
COUNTRIES.map(async (country) => {
let result = await supabase
.from(country.table)
.select("*")
.order("created_at", { ascending: false });
// Retry without ordering if this table has no created_at column.
if (result.error) {
result = await supabase.from(country.table).select("*");
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
} catch (error) {
setNotice({
type: "error",
text: error.message || "Could not load registrations.",
});
} finally {
setLoading(false);
setRefreshing(false);
}
}, []);
useEffect(() => {
loadRegistrations();
const interval = window.setInterval(() => {
loadRegistrations(true);
}, 60000);
return () => window.clearInterval(interval);
}, [loadRegistrations]);
const totalApplicants = useMemo(
() =>
Object.values(registrations).reduce(
(total, people) => total + people.length,
0
),
[registrations]
);
const selectedApplicants = selectedCountry
? registrations[selectedCountry.id] || []
: [];
const filteredApplicants = useMemo(() => {
if (!selectedCountry) return [];
const query = search.trim().toLowerCase();
return [...(registrations[selectedCountry.id] || [])]
.filter((person) => {
if (!query) return true;
const values = [
getApplicantName(person),
getApplicantPhone(person),
person.email,
person.passport_number,
person.elmis_id,
person.code,
person.id,
];
return values
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
const openCountry = (country) => {
const now = new Date().toISOString();
const updated = {
...visitTimes,
[country.id]: now,
};
setSelectedCountry(country);
setSearch("");
setNotice(null);
setVisitTimes(updated);
try {
localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(updated));
} catch {
// The dashboard can still work if localStorage is unavailable.
}
};
const goHome = () => {
setSelectedCountry(null);
setSearch("");
setNotice(null);
};
const downloadApplicantPdf = async (person, country) => {
const pdfPath = getPdfPath(person);
const pdfUrl = getPdfUrl(person);
if (!pdfPath && !pdfUrl) {
setNotice({
type: "error",
text: "No saved PDF was found for this registration. Check the pdf_path column in Supabase.",
});
return;
}
const busyKey = `pdf-${country.id}-${person.id}`;
setRowBusy(busyKey);
setNotice(null);
try {
let downloadUrl = pdfUrl;
// Storage paths must be converted to a URL.
// Signed URLs also work with a private Supabase bucket.
if (pdfPath) {
if (/^https?:\/\//i.test(pdfPath)) {
downloadUrl = pdfPath;
} else {
const { data, error } = await supabase.storage
.from(country.pdfBucket)
.createSignedUrl(pdfPath, 60 * 10);
if (error) throw error;
downloadUrl = data.signedUrl;
}
}
if (!downloadUrl) {
throw new Error("A PDF download URL could not be created.");
}
const response = await fetch(downloadUrl);
if (!response.ok) {
throw new Error("The saved PDF could not be downloaded.");
}
const blob = await response.blob();
if (!blob.size) {
throw new Error("The saved PDF file is empty.");
}
const objectUrl = URL.createObjectURL(blob);
const anchor = document.createElement("a");
const safeName = getApplicantName(person)
.replace(/[^\w\\-]+/g, "_")
.replace(/^_+|_+$/g, "");
anchor.href = objectUrl;
anchor.download = `${country.id}-${safeName || "registration"}.pdf`;
document.body.appendChild(anchor);
anchor.click();
anchor.remove();
window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
setNotice({
type: "success",
text: `PDF download started for ${getApplicantName(person)}.`,
});
} catch (error) {
setNotice({
type: "error",
text:
error.message ||
"Could not download this PDF. Check the storage bucket and permissions.",
});
} finally {
setRowBusy("");
}
};
const deleteApplicant = async (person, country) => {
const applicantName = getApplicantName(person);
if (!person.id) {
setNotice({
type: "error",
text: "This registration has no database ID. It cannot safely be deleted.",
});
return;
}
const confirmed = window.confirm(
`Delete the registration for "${applicantName}" from ${country.name}?\n\nThis removes the registration record from the database. This action cannot be undone.`
);
if (!confirmed) return;
const busyKey = `delete-${country.id}-${person.id}`;
setRowBusy(busyKey);
setNotice(null);
try {
const { data, error } = await supabase
.from(country.table)
.delete()
.eq("id", person.id)
.select("id");
if (error) throw error;
if (!data || data.length === 0) {
throw new Error(
"No row was deleted. Check the Supabase delete policy and database permissions."
);
}
// Remove the row from the UI immediately.
setRegistrations((current) => ({
...current,
[country.id]: current[country.id].filter(
(item) => String(item.id) !== String(person.id)
),
}));
// Best-effort cleanup of the stored PDF after deleting the DB row.
// A storage cleanup failure does not restore the deleted registration.
const pdfPath = getPdfPath(person);
if (pdfPath && !/^https?:\/\//i.test(pdfPath)) {
try {
await supabase.storage
.from(country.pdfBucket)
.remove([pdfPath]);
} catch {
// The database row has already been deleted.
}
}
setNotice({
type: "success",
text: `Registration for ${applicantName} was deleted.`,
});
} catch (error) {
setNotice({
type: "error",
text: error.message || "Could not delete this registration.",
});
} finally {
setRowBusy("");
}
};
const renderNewStatus = (person) => {
if (!selectedCountry) return null;
const lastVisited = visitTimes[selectedCountry.id];
const cutoff = lastVisited
? new Date(lastVisited).getTime()
: Date.now() - 24 * 60 * 60 * 1000;
const date = getApplicantDate(person);
const timestamp = date ? new Date(date).getTime() : NaN;
const isNew = !Number.isNaN(timestamp) && timestamp > cutoff;
return isNew ? (
<span className="admin-status admin-status-new">
<span className="admin-status-dot" />
{t("New", "አዲስ")}
</span>
) : (
<span className="admin-status admin-status-seen">
{t("Registered", "ተመዝግቧል")}
</span>
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
className="admin-button admin-button-light"
type="button"
onClick={() => loadRegistrations(true)}
disabled={refreshing}
>
<span className={refreshing ? "admin-spin-icon" : ""}>↻</span>
{refreshing
? t("Refreshing", "በማደስ ላይ")
: t("Refresh", "አድስ")}
</button>
</div>
</div>
</header>
<main className="admin-content">
{!selectedCountry ? (
<>
<section className="admin-welcome-card">
<div className="admin-welcome-copy">
<span className="admin-eyebrow">
{t("ADMINISTRATION", "አስተዳደር")}
</span>
<h2>
{t(
"Registration management",
"የምዝገባ አስተዳደር"
)}
</h2>
<p>
{t(
"Choose a country to download registration PDFs or manage submitted records.",
"የምዝገባ ፒዲኤፎችን ለማውረድ ወይም የተላኩ መዝገቦችን ለማስተዳደር አገር ይምረጡ።"
)}
</p>
</div>
<div className="admin-total-card">
<span>{t("Total registrations", "ጠቅላላ ምዝገባዎች")}</span>
<strong>{loading ? "—" : totalApplicants}</strong>
<small>{t("Across all countries", "ከሁሉም አገሮች")}</small>
</div>
</section>
<div className="admin-section-heading">
<div>
<h2>{t("Country registrations", "የአገር ምዝገባዎች")}</h2>
<p>
{t(
"Select a country to manage its applicants.",
"አመልካቾችን ለማስተዳደር አገር ይምረጡ።"
)}
</p>
</div>
{lastUpdated && (
<span className="admin-updated-time">
{t("Last updated", "ለመጨረሻ ጊዜ የተዘመነው")}{" "}
{lastUpdated.toLocaleTimeString()}
</span>
)}
</div>
{Object.keys(errors).length > 0 && (
<div className="admin-alert admin-alert-error">
<strong>
{t(
"Some tables could not be loaded.",
"አንዳንድ ሰንጠረዦችን መጫን አልተቻለም።"
)}
</strong>
<p>
{t(
"Open the affected country to view its error.",
"ስህተቱን ለማየት ችግር ያለበትን አገር ይክፈቱ።"
)}
</p>
</div>
)}
<section className="admin-country-grid">
{COUNTRIES.map((country) => {
const count = registrations[country.id].length;
const newCount = getNewCount(
registrations[country.id],
visitTimes[country.id]
);
return (
<button
className="admin-country-card"
type="button"
key={country.id}
onClick={() => openCountry(country)}
>
<div className="admin-country-card-top">
<div className="admin-country-flag-wrap">
<img
src={country.image}
alt={`${country.name} flag`}
className="admin-country-image"
/>
</div>
{newCount > 0 && (
<span className="admin-notification-badge">
{newCount > 99 ? "99+" : newCount}
</span>
)}
</div>
<div className="admin-country-card-content">
<div>
<h3>
{country.name}
<span className="admin-amharic-country">
{country.amharic}
</span>
</h3>
{newCount > 0 && (
<p
className="admin-new-applicants-notice"
style={{
display: "inline-flex",
alignItems: "center",
gap: "7px",
margin: "8px 0 10px",
padding: "7px 11px",
borderRadius: "8px",
background: "#fff0f0",
border: "1px solid #ffb3b3",
color: "#c1121f",
fontWeight: 800,
fontSize: "0.9rem",
lineHeight: 1.35,
boxShadow: "0 2px 8px rgba(193, 18, 31, 0.10)",
}}
role="status"
aria-live="polite"
>
<span aria-hidden="true" style={{ fontSize: "1.15em" }}>🔔</span>
<strong>
{t(
newCount === 1
? "There is 1 new applicant"
: `There are ${newCount} new applicants`,
newCount === 1
? "1 አዲስ አመልካች አለ"
: `${newCount} አዲስ አመልካቾች አሉ`
)}
</strong>
</p>
)}
<p className="admin-country-subtitle">
{country.subtitle}
</p>
<p className="admin-country-subtitle">
{country.amharicSubtitle}
</p>
</div>
<div className="admin-country-card-bottom">
<div>
<strong>{loading ? "—" : count}</strong>
<span>
{t("Registrations", "ምዝገባዎች")}
</span>
</div>
<span className="admin-country-arrow">→</span>
</div>
{errors[country.id] && (
<p className="admin-country-error-text">
{t("Table access error", "የሰንጠረዥ ስህተት")}
</p>
)}
<span className="admin-country-card-link">
{t("Manage registrations", "ምዝገባዎችን ያስተዳድሩ")}
<span>↗</span>
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
"Registration data refreshes automatically every minute.",
"የምዝገባ መረጃ በየደቂቃው በራስ-ሰር ይዘምናል።"
)}
</p>
</>
) : (
<>
<div className="admin-page-toolbar">
<button
className="admin-button admin-button-light"
type="button"
onClick={goHome}
>
← {t("All countries", "ሁሉም አገሮች")}
</button>
<button
className="admin-button admin-button-light"
type="button"
onClick={() => loadRegistrations(true)}
disabled={refreshing}
>
↻ {t("Refresh", "አድስ")}
</button>
</div>
<section className="admin-country-overview">
<div className="admin-country-overview-identity">
<div className="admin-selected-flag-wrap">
<img
src={selectedCountry.image}
alt={`${selectedCountry.name} flag`}
className="admin-selected-country-image"
/>
</div>
<div className="admin-country-overview-copy">
<span className="admin-eyebrow">
{t("COUNTRY WORKSPACE", "የአገር የሥራ ቦታ")}
</span>
<h2>
{selectedCountry.name}{" "}
<span>{selectedCountry.amharic}</span>
</h2>
<p>{selectedCountry.subtitle}</p>
<p>{selectedCountry.amharicSubtitle}</p>
</div>
</div>
<div className="admin-country-stats">
<div>
<span>{t("Total registrations", "ጠቅላላ ምዝገባዎች")}</span>
<strong>{selectedApplicants.length}</strong>
</div>
<div>
<span>{t("Matching results", "የተገኙ ውጤቶች")}</span>
<strong>{filteredApplicants.length}</strong>
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
`Check the Supabase table "${selectedCountry.table}" and its read permissions.`,
`የSupabase "${selectedCountry.table}" ሰንጠረዥንና የማንበብ ፈቃዱን ያረጋግጡ።`
)}
</p>
</div>
)}
{notice && (
<div
className={`admin-alert ${
notice.type === "error"
? "admin-alert-error"
: "admin-alert-success"
}`}
role="status"
>
<span>{notice.text}</span>
<button
type="button"
className="admin-notice-close"
onClick={() => setNotice(null)}
aria-label="Dismiss notification"
>
×
</button>
</div>
)}
<section className="admin-list-card">
<div className="admin-list-heading">
<div>
<span className="admin-eyebrow">
{t("REGISTRATION RECORDS", "የምዝገባ መዝገቦች")}
</span>
<h2>
{t("Registered applicants", "የተመዘገቡ አመልካቾች")}
</h2>
<p>
{t(
"Download the saved PDF or delete a registration.",
"የተቀመጠውን ፒዲኤፍ ያውርዱ ወይም ምዝገባን ይሰርዙ።"
)}
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
{search && (
<button
type="button"
className="admin-search-clear"
onClick={() => setSearch("")}
aria-label="Clear search"
>
×
</button>
)}
</label>
</div>
{loading ? (
<div className="admin-empty-state">
<div className="admin-loader" />
<p>{t("Loading registrations…", "ምዝገባዎች በመጫን ላይ ናቸው…")}</p>
</div>
) : filteredApplicants.length === 0 ? (
<div className="admin-empty-state">
<span className="admin-empty-icon">▤</span>
<h3>{t("No applicants found", "አመልካቾች አልተገኙም")}</h3>
<p>
{search
? t("Try another search term.", "ሌላ የፍለጋ ቃል ይሞክሩ።")
: t(
"There are no registrations in this country yet.",
"በዚህ አገር እስካሁን ምዝገባ የለም።"
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
<th>{t("Status", "ሁኔታ")}</th>
<th>{t("Actions", "ድርጊቶች")}</th>
</tr>
</thead>
<tbody>
{filteredApplicants.map((person) => {
const photo = getApplicantPhoto(person);
const hasPdf = Boolean(
getPdfPath(person) || getPdfUrl(person)
);
const pdfBusy =
rowBusy === `pdf-${selectedCountry.id}-${person.id}`;
const deleteBusy =
rowBusy === `delete-${selectedCountry.id}-${person.id}`;
return (
<tr key={person.id}>
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
<div className="admin-applicant-info">
<strong>{getApplicantName(person)}</strong>
<small>
{person.email ||
person.passport_number ||
person.elmis_id ||
t("Applicant", "አመልካች")}
</small>
</div>
</div>
</td>
<td className="admin-phone-cell">
{getApplicantPhone(person)}
</td>
<td>{formatDate(getApplicantDate(person))}</td>
<td>{renderNewStatus(person)}</td>
<td>
<div className="admin-row-actions">
<button
type="button"
className="admin-button admin-button-download"
disabled={Boolean(rowBusy) || !hasPdf}
onClick={() =>
downloadApplicantPdf(person, selectedCountry)
}
title={
hasPdf
? t("Download saved PDF", "የተቀመጠውን ፒዲኤፍ አውርድ")
: t("No PDF saved", "የተቀመጠ ፒዲኤፍ የለም")
}
>
{pdfBusy ? (
<>
<span className="admin-button-spinner" />
{t("Preparing…", "በማዘጋጀት ላይ…")}
</>
) : (
<>
<span aria-hidden="true">↓</span>
{t("Download PDF", "ፒዲኤፍ አውርድ")}
</>
)}
</button>
<button
type="button"
className="admin-button admin-button-delete"
disabled={Boolean(rowBusy)}
onClick={() =>
deleteApplicant(person, selectedCountry)
}
>
{deleteBusy ? (
<>
<span className="admin-button-spinner" />
{t("Deleting…", "በመሰረዝ ላይ…")}
</>
) : (
<>
<span aria-hidden="true">⌫</span>
{t("Delete", "ሰርዝ")}
</>
)}
</button>
</div>
{!hasPdf && (
<small className="admin-no-pdf-note">
{t("PDF not saved", "ፒዲኤፍ አልተቀመጠም")}
</small>
)}
</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</section>
<p className="admin-footer-note">
{refreshing
? t("Updating registrations…", "ምዝገባዎች በመዘመን ላይ ናቸው…")
: t(
"Records refresh automatically every minute.",
"መዝገቦች በየደቂቃው በራስ-ሰር ይዘምናሉ።"
)}
</p>
</>
)}
</main>
</div>
);
}
export default AdminPage;
