
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/CanadaForm.css";

const initialForm = {
  full_name: "",
  address: "",
  woreda: "",
  kebele: "",
  nationality: "ኢትዮጵያዊ",
  gender: "",
  age: "",
  date_of_birth: "",
  place_of_birth: "",
  occupation: "",
  id_number: "",
  form_date: new Date().toISOString().slice(0, 10),
  weight: "",
  height: "",
  phone: "",
  contact_full_name: "",
  contact_address: "",
  contact_region: "",
  contact_woreda: "",
  contact_kebele: "",
  contact_nationality: "",
  contact_id_number: "",
  contact_phone: "",
};

const applicantFields = [
  { name: "full_name", label: "ሙሉ ስም", type: "text", required: true },
  { name: "address", label: "አድራሻ", type: "text" },
  { name: "woreda", label: "ወረዳ", type: "text" },
  { name: "kebele", label: "ቀበሌ", type: "text" },
  { name: "nationality", label: "ዜግነት", type: "text" },
  { name: "gender", label: "ጾታ", type: "select" },
  { name: "age", label: "እድሜ", type: "number" },
  { name: "date_of_birth", label: "የትውልድ ዘመን", type: "date" },
  { name: "place_of_birth", label: "የትውልድ ቦታ", type: "text" },
  { name: "occupation", label: "የመተዳደሪያ የሥራ ዓይነት", type: "text" },
  { name: "id_number", label: "የመታወቂያ ቁጥር", type: "text" },
  { name: "form_date", label: "ፎርም የተሞላበት ቀን", type: "date" },
  { name: "weight", label: "ክብደት", type: "number" },
  { name: "height", label: "ቁመት", type: "number" },
  { name: "phone", label: "ስልክ ቁጥር", type: "tel" },
];

const contactFields = [
  { name: "contact_full_name", label: "ሙሉ ስም", type: "text" },
  { name: "contact_address", label: "አድራሻ", type: "text" },
  { name: "contact_region", label: "ክልል", type: "text" },
  { name: "contact_woreda", label: "ወረዳ", type: "text" },
  { name: "contact_kebele", label: "ቀበሌ", type: "text" },
  { name: "contact_nationality", label: "ዜግነት", type: "text" },
  { name: "contact_id_number", label: "የመታወቂያ ቁጥር", type: "text" },
  { name: "contact_phone", label: "ስልክ ቁጥር", type: "tel" },
];

function CanadaForm() {
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("እባክዎ የፎቶ ፋይል ብቻ ይምረጡ።");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("የፎቶው መጠን ከ5MB መብለጥ የለበትም።");
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
    setMessage("");
  };

  const handlePreview = () => {
    if (!formData.full_name.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ሙሉ ስም ያስገቡ።");
      return;
    }

    setShowPreview(true);
    setMessage("");

    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const waitForImages = async (element) => {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map((image) => {
        if (image.complete && image.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          image.onload = resolve;
          image.onerror = resolve;
          setTimeout(resolve, 5000);
        });
      })
    );
  };

  const downloadPdf = async () => {
    if (!showPreview || !previewRef.current) {
      setMessage("እባክዎ መጀመሪያ Preview ይጫኑ።");
      return;
    }

    const paper = previewRef.current.querySelector(".canada-paper");
    if (!paper) {
      setMessage("የፎርሙ ቅድመ እይታ አልተገኘም።");
      return;
    }

    await waitForImages(paper);

    const canvas = await html2canvas(paper, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: paper.scrollWidth,
      windowHeight: paper.scrollHeight,
    });

    const imageData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    if (imageHeight <= pageHeight) {
      pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );
    } else {
      // Keep the entire form on one A4 page.
      const scale = pageHeight / imageHeight;
      const fittedWidth = imageWidth * scale;
      const left = (pageWidth - fittedWidth) / 2;

      pdf.addImage(
        imageData,
        "JPEG",
        left,
        0,
        fittedWidth,
        pageHeight,
        undefined,
        "FAST"
      );
    }

    const safeName =
      formData.full_name.trim().replace(/[^\p{L}\p{N}_-]+/gu, "_") ||
      "Canada_Application";

    pdf.save(`Canada_Application_${safeName}.pdf`);
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      throw new Error("እባክዎ የተመዝጋቢውን ፎቶ ይጫኑ።");
    }

    const extension = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("canada-applicant-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });

    if (uploadError) {
      throw new Error(
        `ፎቶውን ወደ Supabase መላክ አልተቻለም፦ ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("canada-applicant-photos")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("የፎቶውን URL ማግኘት አልተቻለም።");
    }

    return data.publicUrl;
  };

  const handleRegisterAndPrint = async () => {
    if (!formData.full_name.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ሙሉ ስም ያስገቡ።");
      return;
    }

    if (!photoFile) {
      setMessage("እባክዎ የተመዝጋቢውን ፎቶ ይጫኑ።");
      return;
    }

    if (!showPreview) {
      setMessage("እባክዎ መጀመሪያ Preview ይጫኑ።");
      return;
    }

    setBusy(true);
    setMessage("መረጃው እየተመዘገበ ነው...");

    try {
      const photoUrl = await uploadPhoto();

      const payload = {
        ...formData,
        age: formData.age === "" ? null : Number(formData.age),
        weight: formData.weight === "" ? null : Number(formData.weight),
        height: formData.height === "" ? null : Number(formData.height),
        date_of_birth: formData.date_of_birth || null,
        form_date: formData.form_date || null,
        profile_photo_url: photoUrl,
      };

      const { error: insertError } = await supabase
        .from("canada_registrations")
        .insert([payload]);

      if (insertError) {
        throw new Error(`ምዝገባው አልተሳካም፦ ${insertError.message}`);
      }

      setMessage("ምዝገባው ተሳክቷል። PDF እየተዘጋጀ ነው...");
      await downloadPdf();
      setMessage("ምዝገባው ተሳክቷል፤ PDF ወርዷል።");
    } catch (error) {
      setMessage(error.message || "ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setBusy(false);
    }
  };

  const displayValue = (value) =>
    value !== undefined && value !== null && String(value).trim()
      ? String(value)
      : "................................";

  const renderInput = (field) => (
    <label className="canada-field" key={field.name}>
      <span>{field.label}{field.required ? " *" : ""}</span>

      {field.type === "select" ? (
        <select
          name={field.name}
          value={formData[field.name]}
          onChange={updateField}
          required={field.required}
        >
          <option value="">ይምረጡ</option>
          <option value="ወንድ">ወንድ</option>
          <option value="ሴት">ሴት</option>
        </select>
      ) : (
        <input
          name={field.name}
          type={field.type}
          value={formData[field.name]}
          onChange={updateField}
          required={field.required}
          min={field.type === "number" ? "0" : undefined}
        />
      )}
    </label>
  );

  const paperField = (label, value, key) => (
    <div className="canada-paper-field" key={key || label}>
      <strong>{label}፦</strong> {displayValue(value)}
    </div>
  );

  return (
    <div className="canada-form-page">
      <div className="canada-site-logo">
        <Logo />
      </div>

      <main className="canada-form-card">
        <h1 className="canada-form-heading">የካናዳ ማመልከቻ ፎርም</h1>

        <div className="canada-photo-upload">
          <div className="canada-photo-box">
            {photoPreview ? (
              <img src={photoPreview} alt="የተመዝጋቢው ፎቶ" />
            ) : (
              <span>የተመዝጋቢው ፎቶ ግራፍ</span>
            )}
          </div>

          <div className="canada-photo-controls">
            <label className="canada-upload-button" htmlFor="canada-photo">
              Upload Profile Photo
            </label>
            <input
              ref={fileInputRef}
              id="canada-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              hidden
            />
            <p>የፎቶ መጠን ከ5MB በታች መሆን አለበት።</p>
          </div>
        </div>

        <section className="canada-form-section">
          <h2>1. የተመዝጋቢው ማንነት</h2>
          <div className="canada-fields-grid">
            {applicantFields.map(renderInput)}
          </div>
        </section>

        <section className="canada-form-section">
          <h2>2. የቅርብ ተጠሪ ወይም ተያዥ</h2>
          <div className="canada-fields-grid">
            {contactFields.map(renderInput)}
          </div>
        </section>

        {message && (
          <p className="canada-form-message" role="status">
            {message}
          </p>
        )}

        <div className="canada-form-actions">
          <button
            type="button"
            className="canada-button canada-preview-button"
            onClick={handlePreview}
            disabled={busy}
          >
            Preview
          </button>
        </div>
      </main>

      {showPreview && (
        <section
          className="canada-preview-section"
          ref={previewRef}
          aria-label="የካናዳ ማመልከቻ ቅድመ እይታ"
        >
          <h2>የማመልከቻው ቅድመ እይታ</h2>

          <article className="canada-paper">
            <img
              className="canada-paper-watermark"
              src="/images/canadafl.jpg"
              alt=""
              aria-hidden="true"
              crossOrigin="anonymous"
            />

            <div className="canada-paper-top">
              <div className="canada-paper-photo">
                {photoPreview ? (
                  <img src={photoPreview} alt="የተመዝጋቢው ፎቶ" />
                ) : (
                  <span>የተመዝጋቢው ፎቶ ግራፍ</span>
                )}
              </div>

              <div className="canada-paper-title">
                
                <p>ቀን፦ {displayValue(formData.form_date)}</p>
              </div>
            </div>

            <div className="canada-paper-intro">
              <p>
                በቅድሚያ የማክበር ሰላምታችንን እያቀረብን የካናዳ መንግስት
                አዲስ ባወጣቸው መግለጫ መሰረት ከፍተኛ የሰው ሀይል
                እንደሚያስፈልጋት እንደገለፀ ይታወቃል፡፡
              </p>

              <p>
                በዚህ መሰረት አቶ/ወሮ{" "}
                {displayValue(formData.full_name)}{" "}
                በዚህ በወጣው መግለጫ መሰረት ተመዝጋቢ ሆኜ ቀርቤአለሁ።
                ስለሆነም በኢትዮጵያዊነቴ በመንግስት እርዳታ ወደ ካናዳ
                ለመሄድ መስማማቴን ከዚህ በታች በሞላሁት ፎርም
                አስቀምጫለሁ፡፡
              </p>
            </div>

            
              <h3>1. የተመዝጋቢው ማንነት</h3>
              <div className="canada-paper-fields">
                {applicantFields.map((field) =>
                  paperField(field.label, formData[field.name], field.name)
                )}
              </div>
            

            
              <h3>2. የቅርብ ተጠሪ ወይም ተያዥ</h3>
              <div className="canada-paper-fields">
                {contactFields.map((field) =>
                  paperField(
                    field.label,
                    formData[field.name],
                    field.name
                  )
                )}
              </div>
           

            

            <div className="canada-paper-stamp">
              <img
                src="/images/canadaseg.jpg"
                alt="Stamp"
                crossOrigin="anonymous"
              />
            </div>

            <div className="canada-paper-motto">
              "ብቁ ሰራተኛ . ብቁ ቀጣሪ . ብቁ ውሳኔ ሰጪ።"
            </div>

            <div className="canada-paper-footer">
              <hr />
              <div className="canada-paper-footer-row">
                <span>ፋክስ፦ +251116671566</span>
                <span>አዲስ አበባ፣ ኢትዮጵያ</span>
              </div>
              <div className="canada-paper-footer-row">
                <span>e-mail: info@elmis.gov.et</span>
                <span>web: www.elmis.gov.et</span>
              </div>
            </div>
          </article>

          <div className="canada-preview-actions">
            <button
              type="button"
              className="canada-button"
              onClick={downloadPdf}
              disabled={busy}
            >
              Print
            </button>

            <button
              type="button"
              className="canada-button canada-register-button"
              onClick={handleRegisterAndPrint}
              disabled={busy}
            >
              {busy ? "Registering..." : "Register and Print"}
            </button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default CanadaForm;
