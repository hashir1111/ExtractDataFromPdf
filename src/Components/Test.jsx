import { useState, useEffect } from "react";
import axios from "axios";
import "./Test.css";

const PdfExtractor = ({ pdfData, email }) => {
  const [extractedData, setExtractedData] = useState({});

  const mondayApiKey = process.env.REACT_APP_MONDAY_API;
  const boardId = process.env.REACT_APP_BOARD_ID;

  useEffect(() => {
    if (pdfData) {
      const extractPdfData = (pdfData) => {
        const data = {};

        const fedIdMatch = pdfData.match(/FED ID#\s*(\d+)/);
        if (fedIdMatch) data.FED_ID = fedIdMatch[1];

        const poMatch = pdfData.match(/P\.O\. #:\s*(\d+)/);
        if (poMatch) data.PO = poMatch[1];

        const workOrderMatch = pdfData.match(/Work Order:\s*(\d+)/);
        if (workOrderMatch) data.WO = workOrderMatch[1];

        const poDateMatch = pdfData.match(/P\.O\. Date:\s*([\d\/]+)/);
        if (poDateMatch) data.PODate = poDateMatch[1];

        const stateMatch = pdfData.match(
          /Corporate Offices - Indianapolis, (\w{2})/
        );
        if (stateMatch) data.State = stateMatch[1];

        const notesMatch = pdfData.match(
          /TECHNICIAN\(S\) MUST CHECK IN AND OUT USING THE STORES PHONE BY CALLING.*?\n(.*?)\n.*?TECHNICIANS ARE REQUIRED TO WEAR MASKS WHILE SERVICING ALL LOCATIONS.*?\n(.*?)\n.*?Store Signature\/Stamp required. See attached form/is
        );
        if (notesMatch) {
          data.Notes = notesMatch[1].trim() + " " + notesMatch[2].trim();
        }

        const lastWordMatch = email.match(/(\w+)\s*$/);
        if (lastWordMatch) data.PM = lastWordMatch[1];

        console.log("Data from extraction: ", data);
        return data;
      };

      const extracted = extractPdfData(pdfData);
      setExtractedData(extracted);

      sendToMonday(extracted);
    }
  }, [pdfData]);

  const sendToMonday = async (data) => {
    const columnValues = {
      text: data.PO,
      text7: data.WO,
      text8: data.State,
      text1: data.PM,
      text11: data.PODate,
      text9: data.FED_ID,
    };

    console.log("Data being sent to Monday.com:", columnValues);

    const query = `
      mutation {
        create_item (
          board_id: ${boardId}, 
          item_name: "systemapic work order", 
          column_values: "${JSON.stringify(columnValues).replace(/"/g, '\\"')}"
        ) {
          id
        }
      }
    `;

    try {
      const response = await axios.post(
        "https://api.monday.com/v2",
        { query: query },
        {
          headers: {
            Authorization: mondayApiKey,
          },
        }
      );

      console.log("Response from Monday.com:", response.data);
    } catch (error) {
      console.error("Error sending data to Monday.com:", error);
    }
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th colSpan={6}>Extracted Data</th>
          </tr>
          <tr>
            <th>FED_ID</th>
            <th>PO#</th>
            <th>WO#</th>
            <th>PODate</th>
            <th>State</th>
            <th>PM</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{extractedData.FED_ID || "N/A"}</td>
            <td>{extractedData.PO || "N/A"}</td>
            <td>{extractedData.WO || "N/A"}</td>
            <td>{extractedData.PODate || "N/A"}</td>
            <td>{extractedData.State || "N/A"}</td>
            <td>{extractedData.PM || "N/A"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PdfExtractor;
