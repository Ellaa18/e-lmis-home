
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/DubaiForm.css";

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
  contact_id_number: "",
  contact_date_of_birth: "",
  contact_place_of_birth: "",
  contact_phone: "",
  applicant_signature: "",
};

const applicantFields = [
  { name: "full_name", label: "ሙሉ ስም እስከ አያት",  required: true },
 
  { name: "woreda", label: "ወረዳ" },
  { name: "kebele", label: "ቀበሌ"},
  { name: "nationality", label: "ዜግነት" },
  {
    name: "gender",
    label: "ጾታ",
    
    type: "select",
    options: [
      { value: "ወንድ", label: "ወንድ / Male" },
      { value: "ሴት", label: "ሴት / Female" },
    ],
  },
  { name: "age", label: "እድሜ", type: "number" },
 
  { name: "id_number", label: "የፓስፖርት ቁጥር" },
  { name: "form_date", label: "ፎርም የተሞላበት ቀን", en: "Form Date", type: "date" },
  
  { name: "phone", label: "ስልክ ቁጥር", en: "Phone Number", type: "tel" },
];

const contactFields = [
  { name: "contact_full_name", label: "ሙሉ ስም እስከ አያት" },
 

  { name: "contact_woreda", label: "ወረዳ" },
  { name: "contact_kebele", label: "ቀበሌ" },

  { name: "contact_phone", label: "ስልክ ቁጥር", en: "Phone Number" },
];

const PHOTO_BUCKET = "dubai-photos";
const PDF_BUCKET = "dubai-registration-pdfs";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const SUCCESS_MESSAGE =
  "ፎርሙን በትክክል ሞልተው ጨርሰዋል ። የሞሉትን ፎርም ስልክዎ ላይ ያገኙታል።";

const makeUniqueName = () => {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // Use the fallback below.
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

// Verify that the selected file is an image the browser can actually decode.
const verifyImageFile = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(objectUrl);
    };

    image.onload = () => {
      const valid = image.naturalWidth > 0 && image.naturalHeight > 0;
      cleanup();

      if (valid) {
        resolve(true);
      } else {
        reject(new Error("The selected image cannot be decoded."));
      }
    };

    image.onerror = () => {
      cleanup();
      reject(new Error("The selected image is damaged or unsupported."));
    };

    image.src = objectUrl;
  });

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No image was selected."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the selected image."));
      }
    };

    reader.onerror = () =>
      reject(new Error("Could not read the selected image."));

    reader.readAsDataURL(file);
  });

function DubaiForm() {
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const previewRef = useRef(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  useEffect(() => {
    if (!showPreview) return undefined;

    const timer = window.setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [showPreview]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setRegistrationSuccess(false);
  };

  const handlePhoto = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    if (!SUPPORTED_IMAGE_TYPES[file.type]) {
      setPhotoFile(null);
      setPhotoDataUrl("");
      setMessage(
        "Please choose a JPEG, PNG, or WebP image. Other image formats are not accepted."
      );
      setRegistrationSuccess(false);
      input.value = "";
      return;
    }

    if (file.size === 0 || file.size > MAX_PHOTO_SIZE) {
      setPhotoFile(null);
      setPhotoDataUrl("");
      setMessage("Photo must be greater than 0 bytes and no larger than 5 MB.");
      setRegistrationSuccess(false);
      input.value = "";
      return;
    }

    try {
      await verifyImageFile(file);
      const dataUrl = await fileToDataUrl(file);

      setPhotoFile(file);
      setPhotoDataUrl(dataUrl);
      setShowPreview(false);
      setMessage("");
      setRegistrationSuccess(false);
    } catch (error) {
      console.error("Dubai photo validation error:", error);
      setPhotoFile(null);
      setPhotoDataUrl("");
      setMessage(
        "This image could not be opened. Please choose another JPEG, PNG, or WebP image."
      );
      setRegistrationSuccess(false);
      input.value = "";
    }
  };

  const displayValue = (name) => {
    const value = formData[name];
    return value && String(value).trim() ? value : "";
  };

  const renderFields = (fields) =>
    fields.map((field) => (
      <label className="dubai-field" key={field.name}>
        <span className="dubai-field-label">
          <strong>{field.label}</strong>
          <span className="dubai-field-english">{field.en}</span>
          {field.required && <b className="required-mark"> *</b>}
        </span>

        {field.type === "select" ? (
          <select
            name={field.name}
            value={formData[field.name]}
            onChange={updateField}
            required={field.required}
          >
            <option value="">ይምረጡ / Select</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={field.name}
            type={field.type || "text"}
            value={formData[field.name]}
            onChange={updateField}
            required={field.required}
            dir="auto"
          />
        )}
      </label>
    ));

  const uploadPhoto = async (file) => {
    if (!file) return null;

    const extension = SUPPORTED_IMAGE_TYPES[file.type];

    if (!extension || file.size === 0 || file.size > MAX_PHOTO_SIZE) {
      throw new Error("The photo is not a supported image or exceeds 5 MB.");
    }

    const filePath = `${makeUniqueName()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Could not get the uploaded photo URL.");
    }

    return data.publicUrl;
  };

  const uploadRegistrationPdf = async (pdfBlob, filename) => {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `registrations/${Date.now()}-${makeUniqueName()}-${safeFilename}`;

    const { error } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filePath, pdfBlob, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) throw error;

    return filePath;
  };

  const downloadBlob = (blob, filename) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
  };

  const waitForImages = async (element) => {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            let finished = false;

            const finish = () => {
              if (finished) return;
              finished = true;
              img.removeEventListener("load", finish);
              img.removeEventListener("error", finish);
              window.clearTimeout(timeoutId);
              resolve();
            };

            const timeoutId = window.setTimeout(finish, 10000);

            if (img.complete) {
              finish();
            } else {
              img.addEventListener("load", finish, { once: true });
              img.addEventListener("error", finish, { once: true });
            }
          })
      )
    );
  };

  // PDF creation is optional for registration, but success is shown only
  // after PDF generation completes successfully.
  const createPdf = async () => {
    const paper = document.querySelector("#dubai-print-area .dubai-paper");

    if (!paper) {
      throw new Error("Form preview is not ready. Please open Preview first.");
    }

    let exportHost = null;

    try {
      await waitForImages(paper);

      exportHost = document.createElement("div");
      exportHost.className = "dubai-pdf-export-host";

      Object.assign(exportHost.style, {
        position: "fixed",
        left: "-20000px",
        top: "0",
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
        background: "#ffffff",
        pointerEvents: "none",
        zIndex: "-1",
      });

      const exportPaper = paper.cloneNode(true);
      exportPaper.classList.add("dubai-paper-export");

      const copiedPhoto = exportPaper.querySelector(".dubai-paper-photo img");

      if (copiedPhoto && photoDataUrl) {
        copiedPhoto.src = photoDataUrl;
        copiedPhoto.removeAttribute("crossorigin");
      }

      Object.assign(exportPaper.style, {
        display: "block",
        position: "relative",
        boxSizing: "border-box",
        width: "210mm",
        minWidth: "210mm",
        maxWidth: "none",
        height: "297mm",
        minHeight: "297mm",
        maxHeight: "297mm",
        margin: "0",
        padding: "15mm 16mm 18mm",
        overflow: "hidden",
        border: "none",
        borderRadius: "0",
        boxShadow: "none",
        transform: "none",
        background: "#eff0f0",
        color: "#111111",
        fontFamily:
          '"Noto Sans Ethiopic", "Nyala", "Abyssinica SIL", Arial, sans-serif',
        fontSize: "12pt",
        fontWeight: "900",
        lineHeight: "1.8",
      });

      exportHost.appendChild(exportPaper);
      document.body.appendChild(exportHost);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForImages(exportPaper);

      await new Promise((resolve) => {
        if (typeof window.requestAnimationFrame !== "function") {
          window.setTimeout(resolve, 100);
          return;
        }

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(resolve);
        });
      });

      const canvas = await html2canvas(exportPaper, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#eff0f0",
        logging: false,
        imageTimeout: 15000,
        width: exportPaper.scrollWidth,
        height: exportPaper.scrollHeight,
        windowWidth: 1200,
        windowHeight: 1600,
        scrollX: 0,
        scrollY: 0,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("The form could not be rendered. Please try again.");
      }

      const safeName =
        (formData.full_name || "Dubai-Registration")
          .trim()
          .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 70) || "Dubai-Registration";

      const filename = `${safeName}-Dubai-Registration.pdf`;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.98);

      pdf.addImage(imageData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

      return {
        pdfBlob: pdf.output("blob"),
        filename,
      };
    } finally {
      if (exportHost?.parentNode) {
        exportHost.parentNode.removeChild(exportHost);
      }
    }
  };

  const downloadPdf = async () => {
    setDownloading(true);

    try {
      const result = await createPdf();
      downloadBlob(result.pdfBlob, result.filename);
      return result;
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = () => {
    setMessage("");
    setRegistrationSuccess(false);
    setShowPreview(true);
  };

  const handleSavePdf = async () => {
    if (!showPreview) {
      setShowPreview(true);
      setMessage("Please open the preview, then click Download as PDF again.");
      setRegistrationSuccess(false);
      return;
    }

    setMessage("");
    setRegistrationSuccess(false);

    try {
      await downloadPdf();
      setMessage("PDF downloaded successfully.");
    } catch (error) {
      console.error("Dubai PDF download error:", error);
      setMessage(
        `PDF download failed: ${error?.message || "Please try again."}`
      );
    }
  };

  const handleRegisterAndPrint = async (event) => {
    event?.preventDefault();

    if (saving || downloading) return;

    if (!formData.full_name.trim()) {
      setRegistrationSuccess(false);
      setMessage("እባክዎ ሙሉ ስም ያስገቡ። / Please enter the applicant's full name.");
      return;
    }

    setSaving(true);
    setRegistrationSuccess(false);
    setMessage("ምዝገባው እየተካሄደ ነው... / Saving registration...");

    const warnings = [];
    let registrationId = null;
    let registrationSaved = false;
    let pdfGenerated = false;

    try {
      // STEP 1: Save the registration FIRST.
      // Photo and PDF are optional and are not prerequisites for this insert.
      const registrationData = {
        ...formData,
        age: formData.age === "" ? null : Number(formData.age),
        weight: formData.weight === "" ? null : Number(formData.weight),
        height: formData.height === "" ? null : Number(formData.height),
        date_of_birth: formData.date_of_birth || null,
        form_date: formData.form_date || null,
        contact_date_of_birth: formData.contact_date_of_birth || null,
        profile_photo_url: null,
        pdf_path: null,
        pdf_url: null,
      };

      const { data: insertedRow, error: insertError } = await supabase
        .from("dubai_registrations")
        .insert([registrationData])
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`Registration failed: ${insertError.message}`);
      }

      registrationSaved = true;
      registrationId = insertedRow?.id ?? null;

      // STEP 2: Attempt photo upload. Failure does not undo registration.
      if (photoFile && photoDataUrl) {
        try {
          const photoUrl = await uploadPhoto(photoFile);

          if (registrationId) {
            const { error: photoUpdateError } = await supabase
              .from("dubai_registrations")
              .update({ profile_photo_url: photoUrl })
              .eq("id", registrationId);

            if (photoUpdateError) {
              console.error(
                "Dubai photo URL database update error:",
                photoUpdateError
              );
              warnings.push("Photo uploaded but could not be linked to registration");
            }
          } else {
            warnings.push("Photo uploaded but could not be linked to registration");
          }
        } catch (photoError) {
          console.error("Dubai photo upload error:", photoError);
          warnings.push("Photo was not saved; registration is safe");
        }
      } else {
        warnings.push("No profile photo was attached");
      }

      // STEP 3: Generate the PDF before showing the success message.
      try {
        if (!showPreview) {
          setShowPreview(true);
          await new Promise((resolve) => window.setTimeout(resolve, 300));
        }

        const pdfResult = await createPdf();

        // PDF generation has completed successfully.
        pdfGenerated = true;

        let pdfPath = null;

        try {
          pdfPath = await uploadRegistrationPdf(
            pdfResult.pdfBlob,
            pdfResult.filename
          );
        } catch (pdfUploadError) {
          console.error("Dubai PDF upload error:", pdfUploadError);
          warnings.push("PDF could not be uploaded to Supabase");
        }

        if (pdfPath && registrationId) {
          const { error: pdfUpdateError } = await supabase
            .from("dubai_registrations")
            .update({ pdf_path: pdfPath, pdf_url: null })
            .eq("id", registrationId);

          if (pdfUpdateError) {
            console.error(
              "Dubai PDF path database update error:",
              pdfUpdateError
            );
            warnings.push("PDF uploaded but its path could not be linked");
          }
        } else if (pdfPath) {
          warnings.push("PDF uploaded but could not be linked to registration");
        }

        // Download failure does not change the PDF generation result.
        try {
          downloadBlob(pdfResult.pdfBlob, pdfResult.filename);
        } catch (downloadError) {
          console.error("Dubai PDF download error:", downloadError);
          warnings.push("PDF could not be downloaded automatically");
        }
      } catch (pdfError) {
        console.error("Dubai PDF generation error:", pdfError);
        warnings.push("PDF could not be generated");
      }

      if (warnings.length) {
        console.warn("Dubai registration optional-file warnings:", warnings);
      }

      // Show success only if registration was saved AND PDF generation finished.
      if (registrationSaved && pdfGenerated) {
        setRegistrationSuccess(true);
        setMessage(SUCCESS_MESSAGE);
      } else {
        setRegistrationSuccess(false);
        setMessage(
          "ምዝገባው ተቀምጧል፣ ግን PDF መፍጠር አልተሳካም። / Registration was saved, but PDF generation failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Dubai registration error:", error);

      if (registrationSaved && pdfGenerated) {
        setRegistrationSuccess(true);
        setMessage(SUCCESS_MESSAGE);
      } else if (registrationSaved) {
        setRegistrationSuccess(false);
        setMessage(
          "ምዝገባው ተቀምጧል፣ ግን PDF መፍጠር አልተሳካም። / Registration was saved, but PDF generation failed. Please try again."
        );
      } else {
        setRegistrationSuccess(false);
        setMessage(
          `ምዝገባው አልተሳካም። / Registration failed: ${
            error?.message || "Please try again."
          }`
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dubai-form-page">
      <div className="dubai-site-logo">
        <Logo />
      </div>

      <section className="dubai-form-card">
        <header className="dubai-form-heading">
          <h1>የዱባይ ምዝገባ ፎርም</h1>
          <h2>Dubai Registration Form</h2>
          <p>እባክዎ ሁሉንም መረጃ በትክክል ይሙሉ።</p>
          <p>Please complete all information accurately.</p>
        </header>

        <form
          id="dubai-registration-form"
          onSubmit={handleRegisterAndPrint}
        >
          <section className="dubai-photo-upload">
            <div className="dubai-photo-box">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="የተመዝጋቢው ፎቶ / Applicant photo"
                />
              ) : (
                <strong>
                  የተመዝጋቢው
                  <br />
                  ፎቶ ግራፍ
                  <br />
                  Applicant Photo
                </strong>
              )}
            </div>

            <label className="dubai-upload-button">
              <span>ፎቶ ይምረጡ / Choose Photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhoto}
                disabled={saving || downloading}
              />
            </label>

            <small>
              JPEG, PNG, or WebP; maximum 5 MB / የምስል ፋይል እስከ 5MB
            </small>
          </section>

          <section className="dubai-form-section">
            <h2>
              1. የተመዝጋቢው ማንነት
              <span>Applicant Information</span>
            </h2>
            <div className="dubai-fields-grid">
              {renderFields(applicantFields)}
            </div>
          </section>

          <section className="dubai-form-section">
            <h2>
              2. የቅርብ ተጠሪ ወይም ተያዥ
              <span>Emergency Contact / Guarantor</span>
            </h2>
            <div className="dubai-fields-grid">
              {renderFields(contactFields)}
            </div>
          </section>
        </form>

        {message && !showPreview && !registrationSuccess && (
          <p
            className="dubai-form-message"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <div className="dubai-form-actions">
          <button
            type="button"
            className="dubai-button dubai-button-secondary"
            onClick={handlePreview}
            disabled={saving || downloading}
          >
             የሞሉትን ፎርም ለመመልከት እዚጋ ይንኩ
          </button>
        </div>
      </section>

      {showPreview && (
        <section
          className="dubai-preview-section"
          id="dubai-preview"
          ref={previewRef}
        >
          <div className="dubai-preview-heading">
            <div>
              <h2>የፎርሙ ቅድመ እይታ / Form Preview</h2>
              <p>ይህ ወረቀት በሚታየው ቅርጽ ይቀመጣል።</p>
              <p>
                This document will be downloaded as a fixed A4 PDF,
                regardless of your screen size.
              </p>
            </div>
          </div>

          <div id="dubai-print-area">
            <article className="dubai-paper">
              <img
                className="dubai-paper-watermark"
                src="/images/dubiefl.jpg"
                alt=""
                aria-hidden="true"
                crossOrigin="anonymous"
              />

              <div className="dubai-paper-content">
                <div className="dubai-paper-top">
                  <div className="dubai-paper-photo">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="የተመዝጋቢው ፎቶ / Applicant photo"
                      />
                    ) : (
                      <strong>
                        የተመዝጋቢው ፎቶ / Applicant Photo
                      </strong>
                    )}
                  </div>

                  <div className="dubai-paper-date">
                    <strong>
                      ቀን / Date፦{" "}
                      {formData.form_date || "........................"}
                    </strong>
                  </div>
                </div>

                <p className="dubai-paper-intro">
                  በቅድሚያ የማክበር ሰላምታችንን እያቀረብን የዱባይ
                  መንግስት አዲስ ባወጣቸው መግለጫ መሰረት ከፍተኛ
                  የሰው ሀይል እንደሚያስፈልጋት እንደገለፀች ይታወቃል፡፡
                </p>

                <p className="dubai-paper-intro">
                  በዚህ መሰረት አቶ/ወሮ{" "}
                  <strong>{displayValue("full_name")}</strong> ከዚህ
                  በወጣው መግለጫ መሰረት ተመዝጋቢ ሆኜ ቀርቤአለሁ።
                  ስለሆነም በኢትዮጵያዊነቴ በመንግስት እርዳታ ወደ
                  ዱባይ ለመሄድ መስማማቴን ከዚህ በታች በሞላሁት
                  ፎርም አስቀምጫለሁ፡፡
                </p>

                <h3 className="dubai-paper-section-title">
                  1. የተመዝጋቢው ማንነት
                </h3>

                <div className="dubai-paper-fields">
                  {applicantFields.map((field) => (
                    <div className="dubai-paper-field" key={field.name}>
                      <strong>
                        {field.label} / {field.en}:
                      </strong>
                      <span>{displayValue(field.name)}</span>
                    </div>
                  ))}
                </div>

                <h3 className="dubai-paper-section-title">
                  2. የቅርብ ተጠሪ ወይም ተያዥ
                </h3>

                <div className="dubai-paper-fields">
                  {contactFields.map((field) => (
                    <div className="dubai-paper-field" key={field.name}>
                      <strong>
                        {field.label} / {field.en}:
                      </strong>
                      <span>{displayValue(field.name)}</span>
                    </div>
                  ))}
                </div>

                <div className="dubai-paper-signature">
                  <span>{displayValue("applicant_signature")}</span>
                </div>

                <div className="dubai-paper-stamp">
                  <img
                    src="/images/dubieseg.jpg"
                    alt="ማህተም / Stamp"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </article>
          </div>

          <div className="dubai-preview-actions">
            

            <button
              type="submit"
              form="dubai-registration-form"
              className="dubai-button dubai-button-primary"
              disabled={saving || downloading}
            >
              {saving
                ? "በመመዝገብ ላይ ነው ትንሽ ይጠብቁ።.. / የሞሉትን ፎርም የ እርስዎ ስልክ ላይ ያገኙታል..."
                : "ፎርሙን ለማስገባት እዚጋ ይንኩ"}
            </button>
          </div>

          {message && (
            <p
              className={`dubai-form-message ${
                registrationSuccess ? "dubai-success-message" : ""
              }`}
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <p className="dubai-print-note">
            PDF ፋይሉ የእርሶ ፋይል ውስጥ ይቀመጣል።
            <br />
            The PDF will be downloaded to your Downloads folder.
          </p>
        </section>
      )}

      <Footer />
    </main>
  );
}

export default DubaiForm;
