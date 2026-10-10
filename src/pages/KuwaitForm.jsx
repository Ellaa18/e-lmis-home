
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/KuwaitForm.css";

const today = new Date().toISOString().split("T")[0];

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

  const waitForImages = async (element) => {
    if (!element) return;

    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(
        (image) =>
          new Promise((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            image.onload = resolve;
            image.onerror = resolve;
          })
      )
    );
  };

  // Download the entire form preview on one A4 page.
  const downloadPdf = async () => {
    if (!paperRef.current) {
      throw new Error(
        "The form preview could not be found. Please preview the form again."
      );
    }

    await waitForImages(paperRef.current);

    const canvas = await html2canvas(paperRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imageData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");

    // A4 page with a small margin.
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    // Fit the complete form inside one page without cropping.
    const widthRatio = availableWidth / canvas.width;
    const heightRatio = availableHeight / canvas.height;
    const fitRatio = Math.min(widthRatio, heightRatio);

    const imageWidth = canvas.width * fitRatio;
    const imageHeight = canvas.height * fitRatio;

    const xPosition = (pageWidth - imageWidth) / 2;
    const yPosition = (pageHeight - imageHeight) / 2;

    pdf.addImage(
      imageData,
      "JPEG",
      xPosition,
      yPosition,
      imageWidth,
      imageHeight
    );

    // Example: Kuwait_Registration_abebe_kebede_alemu.pdf
    const safeName =
      formData.full_name
        .trim()
        .toLowerCase()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^_+|_+$/g, "") || "applicant";

    pdf.save(`Kuwait_Registration_${safeName}.pdf`);
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      throw new Error("Please upload the applicant's photo first.");
    }

    const extensionFromName = photoFile.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    const extension = allowedExtensions.includes(extensionFromName)
      ? extensionFromName
      : photoFile.type === "image/png"
        ? "png"
        : photoFile.type === "image/webp"
          ? "webp"
          : "jpg";

    const randomId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const filePath = `${Date.now()}-${randomId}.${extension}`;

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
      throw new Error(
        "The photo uploaded, but its public URL could not be created."
      );
    }

    return data.publicUrl;
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
    setMessage("Uploading photo and saving registration...");
    setMessageType("info");

    try {
      const photoUrl = await uploadPhoto();

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
      };

      const { error: insertError } = await supabase
        .from("kuwait_registrations")
        .insert([payload]);

      if (insertError) {
        throw new Error(`Registration save failed: ${insertError.message}`);
      }

      await downloadPdf();

      setMessage(
        "Registration saved successfully and the PDF has been downloaded."
      );
      setMessageType("success");
    } catch (error) {
      console.error("Kuwait registration error:", error);
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
      await downloadPdf();
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
            Supabase Storage. Its URL is saved with your registration.
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
                    <span>
                      {formData.form_date || "________________"}
                    </span>
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
                    እኔ አቶ/ወ/ሮ{" "}
                    
                      {formData.full_name || "________________"}
                   {" "}
                    አዲስ በወጣው የስራ መግለጫ መሰረት ተመዝጋቢ ሆኜ ቀርቤአለሁ።
                    ስለሆነም በኢትዮጵያዊነቴ በመንግስት እርዳታ ወደ ኩዌት በስራ ቪዛ
                    ለመሄድ መስማማቴን ከዚህ በታች በሞላሁት ቅጽ ፈርሜ አስቀምጫለሁ።
                  </p>
                </div>

                {/* Tables 1 and 2 stay side by side. */}
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

                {/* Table 3 stays below tables 1 and 2. */}
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
                      {formData.full_name ||
                        "________________________"}
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
