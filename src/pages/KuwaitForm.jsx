
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/KuwaitForm.css";

const today = new Date().toISOString().split("T")[0];
const PDF_BUCKET = "kuwait-registration-pdfs";

const initialForm = {
  full_name: "",
  gender: "",
  age: "",
  height: "",
  weight: "",
  phone: "",
  education_level: "",
  address: "",
  woreda: "",
  kebele: "",
  nationality: "ኢትዮጵያዊ",
  date_of_birth: "",
  place_of_birth: "",
  form_date: today,
  contact_full_name: "",
  contact_gender: "",
  contact_age: "",
  contact_occupation: "",
  contact_phone: "",
};

function KuwaitForm() {
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const paperRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setPhotoPreview(reader.result);
      }
    };

    reader.onerror = () => {
      if (!cancelled) {
        setMessage(
          "Could not read the profile photo. Please select it again."
        );
        setMessageType("error");
        setPhotoPreview("");
      }
    };

    reader.readAsDataURL(photoFile);

    return () => {
      cancelled = true;

      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    };
  }, [photoFile]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(
        "እባክዎ የምስል ፋይል ብቻ ይምረጡ። Please select an image file."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "የፎቶው መጠን ከ5MB መብለጥ የለበትም. Photo must be 5MB or smaller."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
    setShowPreview(false);
    setMessage("");
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ሙሉ ስም ያስገቡ።");
      setMessageType("error");
      return false;
    }

    if (!photoFile) {
      setMessage(
        "እባክዎ የተመዝጋቢውን ፎቶ ይጫኑ። Please upload the applicant's photo."
      );
      setMessageType("error");
      return false;
    }

    if (!formData.phone.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ስልክ ቁጥር ያስገቡ።");
      setMessageType("error");
      return false;
    }

    return true;
  };

  // Upload the original applicant photo to Supabase Storage.
  const uploadPhoto = async () => {
    if (!photoFile) {
      throw new Error("Please select the applicant's profile photo.");
    }

    const safeName = photoFile.name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const filePath = `applicants/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("kuwait-applicant-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });

    if (uploadError) {
      throw new Error(`Photo upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("kuwait-applicant-photos")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Could not obtain the uploaded photo URL.");
    }

    return data.publicUrl;
  };

  const handlePreview = () => {
    if (!validateForm()) return;

    setShowPreview(true);
    setMessage("Preview is ready. Please check the form before registering.");
    setMessageType("success");

    window.setTimeout(() => {
      paperRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Wait for all images in the preview or PDF copy to finish loading.
  const waitForImages = async (element) => {
    if (!element) return;

    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve;
          });
        }

        if (typeof image.decode === "function" && image.naturalWidth > 0) {
          try {
            await image.decode();
          } catch (error) {
            console.warn("An image could not be decoded:", error);
          }
        }
      })
    );
  };

  const getPdfFileName = () => {
    const safeName =
      formData.full_name
        .trim()
        .toLowerCase()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^_+|_+$/g, "") || "applicant";

    return `Kuwait_Registration_${safeName}.pdf`;
  };

  // Generate one PDF Blob. The same Blob is uploaded and downloaded.
  const createPdfBlob = async () => {
    if (!paperRef.current) {
      throw new Error(
        "The form preview could not be found. Please preview the form again."
      );
    }

    const originalPaper = paperRef.current;

    await waitForImages(originalPaper);

    const pdfContainer = document.createElement("div");
    const pdfPaper = originalPaper.cloneNode(true);

    Object.assign(pdfContainer.style, {
      position: "fixed",
      left: "-12000px",
      top: "0",
      width: "794px",
      minWidth: "794px",
      background: "#ffffff",
      zIndex: "-1",
      pointerEvents: "none",
    });

    Object.assign(pdfPaper.style, {
      display: "block",
      boxSizing: "border-box",
      width: "794px",
      minWidth: "794px",
      maxWidth: "794px",
      minHeight: "1123px",
      height: "auto",
      margin: "0",
      padding: "32px",
      overflow: "visible",
      border: "0",
      boxShadow: "none",
      background: "#ffffff",
      transform: "none",
    });

    // Keep applicant identity and address tables side by side.
    const tableGrid = pdfPaper.querySelector(".kuwait-paper-table-grid");

    if (tableGrid) {
      Object.assign(tableGrid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        alignItems: "start",
        width: "100%",
      });
    }

    // Keep the signature blocks side by side.
    const signatures = pdfPaper.querySelector(".kuwait-paper-signatures");

    if (signatures) {
      Object.assign(signatures.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "18px 24px",
      });
    }

    // Ensure the applicant's photo is included in the exported PDF.
    const sourcePhoto = originalPaper.querySelector(
      ".kuwait-paper-photo img"
    );

    const pdfPhoto = pdfPaper.querySelector(".kuwait-paper-photo img");

    if (sourcePhoto && pdfPhoto) {
      const photoSource = sourcePhoto.currentSrc || sourcePhoto.src;

      if (!photoSource) {
        throw new Error("The applicant profile photo is missing.");
      }

      pdfPhoto.src = photoSource;
      pdfPhoto.style.display = "block";
      pdfPhoto.style.width = "100%";
      pdfPhoto.style.height = "100%";
      pdfPhoto.style.objectFit = "cover";

      await new Promise((resolve, reject) => {
        if (pdfPhoto.complete && pdfPhoto.naturalWidth > 0) {
          resolve();
          return;
        }

        let settled = false;
        let timeoutId;

        const finish = (error) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);

          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };

        pdfPhoto.onload = () => finish();
        pdfPhoto.onerror = () =>
          finish(
            new Error("Could not load the applicant photo for the PDF.")
          );

        timeoutId = window.setTimeout(() => {
          finish(
            new Error("Timed out while loading the applicant photo for the PDF.")
          );
        }, 10000);
      });
    } else {
      throw new Error(
        "The applicant photo is not present in the form preview."
      );
    }

    pdfContainer.appendChild(pdfPaper);
    document.body.appendChild(pdfContainer);

    try {
      await waitForImages(pdfPaper);

      const canvas = await html2canvas(pdfPaper, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        windowWidth: 1200,
        windowHeight: 1200,
        scrollX: 0,
        scrollY: 0,
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 5;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const ratio = Math.min(
        availableWidth / canvas.width,
        availableHeight / canvas.height
      );

      const imageWidth = canvas.width * ratio;
      const imageHeight = canvas.height * ratio;

      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;

      pdf.addImage(
        imageData,
        "PNG",
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      // Return the PDF bytes rather than saving a separate PDF copy here.
      const blob = pdf.output("blob");

      if (!blob || blob.size === 0) {
        throw new Error("The PDF was generated empty. Please try again.");
      }

      return {
        blob,
        fileName: getPdfFileName(),
      };
    } finally {
      pdfContainer.remove();
    }
  };

  // Download the exact PDF Blob created above.
  const downloadPdfBlob = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  };

  // Upload the exact generated PDF to the Kuwait PDF Storage bucket.
  const uploadPdf = async (blob, fileName) => {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `registrations/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filePath, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (uploadError) {
      throw new Error(`PDF upload failed: ${uploadError.message}`);
    }

    // Store the Storage path in the database. The bucket can remain private.
    return filePath;
  };

  const handleRegisterAndPrint = async () => {
    if (loading) return;

    if (!validateForm()) return;

    if (!showPreview) {
      setMessage(
        "Please click Preview Form and check the form before registering."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("Preparing the PDF and saving the registration...");
    setMessageType("info");

    let uploadedPhotoPath = null;
    let uploadedPdfPath = null;
    let registrationSaved = false;

    try {
      const photoUrl = await uploadPhoto();

      // Create one PDF. This exact Blob will be stored and downloaded.
      setMessage("Generating the registration PDF...");
      const { blob: pdfBlob, fileName } = await createPdfBlob();

      setMessage("Uploading the PDF to Supabase...");
      uploadedPdfPath = await uploadPdf(pdfBlob, fileName);

      // Recover the photo Storage path from its URL for cleanup if needed.
      const photoUrlParts = photoUrl.split("/kuwait-applicant-photos/");
      if (photoUrlParts.length > 1) {
        uploadedPhotoPath = decodeURIComponent(photoUrlParts[1].split("?")[0]);
      }

      const payload = {
        full_name: formData.full_name.trim(),
        gender: formData.gender || null,
        age: formData.age === "" ? null : Number(formData.age),
        height: formData.height === "" ? null : Number(formData.height),
        weight: formData.weight === "" ? null : Number(formData.weight),
        phone: formData.phone.trim(),
        education_level: formData.education_level || null,
        address: formData.address.trim() || null,
        woreda: formData.woreda.trim() || null,
        kebele: formData.kebele.trim() || null,
        nationality: formData.nationality.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        place_of_birth: formData.place_of_birth.trim() || null,
        form_date: formData.form_date || null,
        contact_full_name: formData.contact_full_name.trim() || null,
        contact_gender: formData.contact_gender || null,
        contact_age:
          formData.contact_age === "" ? null : Number(formData.contact_age),
        contact_occupation: formData.contact_occupation.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        profile_photo_url: photoUrl,
        pdf_path: uploadedPdfPath,
        pdf_url: null,
      };

      setMessage("Saving registration to Supabase...");
      const { error: insertError } = await supabase
        .from("kuwait_registrations")
        .insert([payload]);

      if (insertError) {
        throw new Error(`Registration save failed: ${insertError.message}`);
      }

      registrationSaved = true;

      // Download the same PDF Blob that was uploaded to Storage.
      downloadPdfBlob(pdfBlob, fileName);

      setMessage(
        "Registration saved successfully. The same PDF was stored in Supabase and downloaded."
      );
      setMessageType("success");
    } catch (error) {
      console.error("Kuwait registration error:", error);

      // Best-effort cleanup of uploaded files if registration did not save.
      if (!registrationSaved && uploadedPdfPath) {
        const { error: cleanupError } = await supabase.storage
          .from(PDF_BUCKET)
          .remove([uploadedPdfPath]);

        if (cleanupError) {
          console.warn("Could not clean up uploaded PDF:", cleanupError);
        }
      }

      if (!registrationSaved && uploadedPhotoPath) {
        const { error: photoCleanupError } = await supabase.storage
          .from("kuwait-applicant-photos")
          .remove([uploadedPhotoPath]);

        if (photoCleanupError) {
          console.warn(
            "Could not clean up uploaded photo:",
            photoCleanupError
          );
        }
      }

      setMessage(error.message || "An error occurred while saving the form.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOnly = async () => {
    if (loading) return;

    if (!showPreview) {
      setMessage("Please click Preview Form before downloading the PDF.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("Preparing your PDF...");
    setMessageType("info");

    try {
      const { blob, fileName } = await createPdfBlob();
      downloadPdfBlob(blob, fileName);

      setMessage("PDF downloaded successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Kuwait PDF download error:", error);
      setMessage(error.message || "Could not download the PDF.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, name, options = {}) => (
    <label className="kuwait-field" key={name}>
      <span>
        {label}
        {options.required ? " *" : ""}
      </span>

      {options.type === "select" ? (
        <select
          name={name}
          value={formData[name]}
          onChange={updateField}
          required={options.required}
        >
          <option value="">Select / ይምረጡ</option>

          {options.options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={options.type || "text"}
          value={formData[name]}
          onChange={updateField}
          required={options.required}
          min={options.min}
          max={options.max}
          step={options.step}
          placeholder={options.placeholder || ""}
        />
      )}
    </label>
  );

  return (
    <div className="kuwait-page">
      <header className="kuwait-header">
        <Logo />
      </header>

      <main className="kuwait-main">
        <section className="kuwait-intro">
          <h2>Applicant Registration Form</h2>
          <p>
            Please complete the applicant details, upload a recent profile
            photo, and review the form before registering.
          </p>
        </section>

        <form
          className="kuwait-form-card"
          onSubmit={(event) => {
            event.preventDefault();
            handlePreview();
          }}
        >
          <div className="kuwait-form-heading">
            <div>
              <h2>Applicant Information</h2>
              <p>የተመዝጋቢው መረጃ</p>
            </div>

            <span className="kuwait-required-note">* Required fields</span>
          </div>

          <div className="kuwait-photo-upload">
            <div className="kuwait-photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Applicant preview" />
              ) : (
                <div className="kuwait-photo-placeholder">
                  <span aria-hidden="true">＋</span>
                  <small>Profile photo</small>
                </div>
              )}
            </div>

            <div className="kuwait-photo-details">
              <h3>Applicant Photo / ፎቶ</h3>
              <p>Upload a clear image. JPG, PNG, or WEBP; maximum 5MB.</p>

              <input
                ref={photoInputRef}
                className="kuwait-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />

              <button
                className="kuwait-button kuwait-button-light"
                type="button"
                onClick={() => photoInputRef.current?.click()}
              >
                Choose Photo
              </button>

              {photoFile && (
                <span className="kuwait-file-name">{photoFile.name}</span>
              )}
            </div>
          </div>

          <div className="kuwait-section-title">
            <span>01</span>
            <div>
              <h3>የተመዝጋቢው ማንነት</h3>
              <p>Applicant Identity</p>
            </div>
          </div>

          <div className="kuwait-input-grid">
            {renderField("Full Name / ሙሉ ስም", "full_name", {
              required: true,
            })}

            {renderField("Gender / ፆታ", "gender", {
              type: "select",
              options: [
                { value: "Male", label: "Male / ወንድ" },
                { value: "Female", label: "Female / ሴት" },
              ],
            })}

            {renderField("Age / እድሜ", "age", {
              type: "number",
              min: 0,
              max: 120,
            })}

            {renderField("Height (cm) / ቁመት", "height", {
              type: "number",
              min: 0,
              step: "0.1",
            })}

            {renderField("Weight (kg) / ክብደት", "weight", {
              type: "number",
              min: 0,
              step: "0.1",
            })}

            {renderField("Phone Number / ስልክ ቁጥር", "phone", {
              type: "tel",
              required: true,
            })}

            {renderField("Education Level / የትምህርት ደረጃ", "education_level")}
          </div>

          <div className="kuwait-section-title">
            <span>02</span>
            <div>
              <h3>መኖሪያ አድራሻ እና የትውልድ መረጃ</h3>
              <p>Address and Birth Information</p>
            </div>
          </div>

          <div className="kuwait-input-grid">
            {renderField("Residential Address / መኖሪያ አድራሻ", "address")}
            {renderField("Woreda / ወረዳ", "woreda")}
            {renderField("Kebele / ቀበሌ", "kebele")}
            {renderField("Nationality / ዜግነት", "nationality")}

            {renderField("Date of Birth / የትውልድ ዘመን", "date_of_birth", {
              type: "date",
            })}

            {renderField("Place of Birth / የትውልድ ቦታ", "place_of_birth")}

            {renderField("Form Date / ቅጹ የተሞላበት ቀን", "form_date", {
              type: "date",
            })}
          </div>

          <div className="kuwait-section-title">
            <span>03</span>
            <div>
              <h3>የቅርብ ተጠሪ ወይም ተያዥ</h3>
              <p>Emergency Contact</p>
            </div>
          </div>

          <div className="kuwait-input-grid">
            {renderField("Contact Full Name / ሙሉ ስም", "contact_full_name")}

            {renderField("Contact Gender / ፆታ", "contact_gender", {
              type: "select",
              options: [
                { value: "Male", label: "Male / ወንድ" },
                { value: "Female", label: "Female / ሴት" },
              ],
            })}

            {renderField("Contact Age / እድሜ", "contact_age", {
              type: "number",
              min: 0,
              max: 120,
            })}

            {renderField("Occupation / ስራ", "contact_occupation")}

            {renderField("Contact Phone / ስልክ ቁጥር", "contact_phone", {
              type: "tel",
            })}
          </div>

          {message && (
            <div
              className={`kuwait-message kuwait-message-${messageType}`}
              role="status"
            >
              {message}
            </div>
          )}

          <div className="kuwait-form-actions">
            <button
              className="kuwait-button kuwait-button-light"
              type="submit"
              disabled={loading}
            >
              Preview Form
            </button>
          </div>

          <p className="kuwait-privacy-note">
            Your photo is uploaded to the Kuwait applicant photo bucket in
            Supabase Storage. Your registration PDF is also stored in Supabase
            Storage, and its path is saved with your registration.
          </p>
        </form>

        {showPreview && (
          <section className="kuwait-preview-section">
            <div className="kuwait-preview-toolbar">
              <div>
                <h2>Form Preview</h2>
                <p>Review the information before registering.</p>
              </div>
            </div>

            <article className="kuwait-paper" ref={paperRef}>
              <img
                className="kuwait-paper-watermark"
                src="/images/qwitfl.jpg"
                alt=""
                aria-hidden="true"
                crossOrigin="anonymous"
              />

              <div className="kuwait-paper-content">
                <div className="kuwait-paper-top">
                  <div className="kuwait-paper-photo">
                    {photoPreview && (
                      <img src={photoPreview} alt="Applicant" />
                    )}
                  </div>

                  <div className="kuwait-paper-date">
                    <strong>ቀን / Date:</strong>
                    <span>{formData.form_date || "________________"}</span>
                  </div>
                </div>

                <div className="kuwait-paper-heading">
                  <h2>የኩዌት የስራ ቪዛ ተመዝጋቢ ቅጽ</h2>
                  <h3>KUWAIT WORK VISA APPLICANT REGISTRATION FORM</h3>
                  <div className="kuwait-paper-rule" />
                </div>

                <div className="kuwait-paper-introduction" lang="am">
                  <p>
                    በቅድሚያ የማክበር ሰላምታችንን እያቀረብን የኩዌት መንግስት አዲስ
                    ባወጣው የስራ እድል መግለጫ መሰረት ብዛት ያለው የሰው ሀይል
                    እንደሚያስፈልግ ያሳወቀ ሲሆን በዚህም መሰረት፦
                  </p>

                  <p>
                    እኔ አቶ/ወ/ሮ {formData.full_name || "________________"}{" "}
                    አዲስ በወጣው የስራ መግለጫ መሰረት ተመዝጋቢ ሆኜ ቀርቤአለሁ።
                    ስለሆነም በኢትዮጵያዊነቴ በመንግስት እርዳታ ወደ ኩዌት በስራ ቪዛ
                    ለመሄድ መስማማቴን ከዚህ በታች በሞላሁት ቅጽ ፈርሜ አስቀምጫለሁ።
                  </p>
                </div>

                <div
                  className="kuwait-paper-table-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "8px",
                    alignItems: "start",
                    width: "100%",
                  }}
                >
                  <section className="kuwait-paper-table-block">
                    <h3>❖ የተመዝጋቢው ማንነት / Applicant Identity</h3>

                    <table>
                      <tbody>
                        <tr>
                          <th>ሙሉ ስም / Full Name</th>
                          <td>{formData.full_name || "—"}</td>
                        </tr>
                        <tr>
                          <th>ፆታ / Gender</th>
                          <td>{formData.gender || "—"}</td>
                        </tr>
                        <tr>
                          <th>እድሜ / Age</th>
                          <td>{formData.age || "—"}</td>
                        </tr>
                        <tr>
                          <th>ቁመት / Height (cm)</th>
                          <td>{formData.height || "—"}</td>
                        </tr>
                        <tr>
                          <th>ክብደት / Weight (kg)</th>
                          <td>{formData.weight || "—"}</td>
                        </tr>
                        <tr>
                          <th>ስ.ቁ / Phone</th>
                          <td>{formData.phone || "—"}</td>
                        </tr>
                        <tr>
                          <th>የትምህርት ደረጃ / Education</th>
                          <td>{formData.education_level || "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  <section className="kuwait-paper-table-block">
                    <h3>የአድራሻ መረጃ / Address Information</h3>

                    <table>
                      <tbody>
                        <tr>
                          <th>መኖሪያ አድራሻ / Address</th>
                          <td>{formData.address || "—"}</td>
                        </tr>
                        <tr>
                          <th>ወረዳ / Woreda</th>
                          <td>{formData.woreda || "—"}</td>
                        </tr>
                        <tr>
                          <th>ቀበሌ / Kebele</th>
                          <td>{formData.kebele || "—"}</td>
                        </tr>
                        <tr>
                          <th>ዜግነት / Nationality</th>
                          <td>{formData.nationality || "—"}</td>
                        </tr>
                        <tr>
                          <th>የትውልድ ዘመን / Date of Birth</th>
                          <td>{formData.date_of_birth || "—"}</td>
                        </tr>
                        <tr>
                          <th>የትውልድ ቦታ / Place of Birth</th>
                          <td>{formData.place_of_birth || "—"}</td>
                        </tr>
                        <tr>
                          <th>ቅጽ የተሞላበት ቀን / Form Date</th>
                          <td>{formData.form_date || "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </div>

                <section
                  className="kuwait-paper-table-block kuwait-contact-table"
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                    clear: "both",
                  }}
                >
                  <h3>
                    ❖ የቅርብ ተጠሪ ወይም ተያዥ / Emergency Contact
                  </h3>

                  <table>
                    <tbody>
                      <tr>
                        <th>ሙሉ ስም / Full Name</th>
                        <td>{formData.contact_full_name || "—"}</td>
                      </tr>
                      <tr>
                        <th>ፆታ / Gender</th>
                        <td>{formData.contact_gender || "—"}</td>
                      </tr>
                      <tr>
                        <th>እድሜ / Age</th>
                        <td>{formData.contact_age || "—"}</td>
                      </tr>
                      <tr>
                        <th>ስራ / Occupation</th>
                        <td>{formData.contact_occupation || "—"}</td>
                      </tr>
                      <tr>
                        <th>ስ.ቁ / Phone</th>
                        <td>{formData.contact_phone || "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <div className="kuwait-paper-signatures">
                  <p>
                    የተመዝጋቢው ስም :
                    <strong>
                      {formData.full_name || "________________________"}
                    </strong>
                  </p>

                  <p>
                    የቅርብ ተጠሪ ስም :
                    <strong>
                      {formData.contact_full_name ||
                        "________________________"}
                    </strong>
                  </p>
                </div>
              </div>
            </article>

            <div className="kuwait-preview-bottom-actions">
              <button
                className="kuwait-button kuwait-button-light"
                type="button"
                onClick={handleDownloadOnly}
                disabled={loading}
              >
                {loading ? "Preparing PDF..." : "Download PDF"}
              </button>

              <button
                className="kuwait-button kuwait-button-primary"
                type="button"
                onClick={handleRegisterAndPrint}
                disabled={loading}
              >
                {loading
                  ? "Saving Registration..."
                  : "Register & Download PDF"}
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default KuwaitForm;
