import React, { useState, useEffect } from "react";
import PdfExtractor from "./Components/Test";

function App() {
  const [pdfData, setPdfData] = useState("");

  const email = `We as a electrical company receive work order from customer on email in this PDF
https://drive.google.com/file/d/1Ps2tza7fE0qiqkw3Yv32PrIdUbKYpLrv/view?usp=sharing
Message Received in the email:
Good morning,
Please see attached WO/PO Oneway Brunswick 450 Warren Mason Blvd Brunswick, GA 31520, WO 914578 / PO 454300 With
a scheduled date of 12/5/2023
TECHNICIAN(S) MUST CHECK IN AND OUT USING THE STORES PHONE BY CALLING 111-111-1111 AND FOLLOWING THE
PROMPTS.
FAILURE TO COMPLY TO ALL OF CUSHMAN & WAKEFIELD REQUIREMENTS WILL RESULT IN NON-PAYMENT OF INVOICE.
ONLY IN THE EVENT WHERE THERE ARE ISSUES RELATED TO THE IVR SYSTEM, CAN THE TECHNICIAN(S) BE CHECKED IN AND/OR
OUT BY CALLING C&W AT 111-111-1111.

SOW
This is a test.

***PLEASE ENSURE THAT THE TECHNICIANS ARE CHECKING IN AND OUT WITH SIGN OFF FORM. PLEASE CONTACT USING
CONTACT INFORMATION IF UNABLE TO CHECK IN AND OUT***
Deliverables
·TECHNICIANS ARE REQUIRED TO WEAR MASKS WHILE SERVICING ALL LOCATIONS. Before/After photos are required.
Store Signature/Stamp required. See attached form. This must be submitted with your invoice. PAYMENT WILL NOT BE
PROCESSED UNLESS SIGN OFF FORMS ARE SUBMITTED WITH YOUR INVOICE.

The current FLAT RATE price right now is at $200.
Thank YOU,
Client`;

  const regex =
    /https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/view\?usp=sharing/;
  const emailLink = email.match(regex);

  useEffect(() => {
    if (emailLink) {
      const fileId = emailLink[1];
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      const sendLinkToBackend = async () => {
        try {
          const response = await fetch("http://localhost:3001/download-pdf", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: downloadUrl }),
          });

          const data = await response.json();
          if (response.ok) {
            setPdfData(data.text);
          } else {
            console.error("Error:", data.message);
          }
        } catch (error) {
          console.error("Error sending link to backend:", error);
        }
      };

      sendLinkToBackend();
    } else {
      console.log("No matching URL found.");
    }
  }, [emailLink]);
  return (
    <>
      <PdfExtractor pdfData={pdfData} email={email} />
    </>
  );
}

export default App;
