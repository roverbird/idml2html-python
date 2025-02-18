document.getElementById("upload").addEventListener("change", handleFile);
document.getElementById("download").addEventListener("click", downloadHTML);

async function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidIDML(file)) {
        alert("Please upload a valid IDML file.");
        return;
    }

    document.getElementById("loadingProgress").value = 25;
    const zip = new JSZip();
    try {
        const zipContents = await zip.loadAsync(file);
        document.getElementById("loadingProgress").value = 50;

        const extractedData = await processIDML(zipContents);
        document.getElementById("loadingProgress").value = 75;

        displayData(extractedData);
        document.getElementById("loadingProgress").value = 100;
        document.getElementById("download").style.display = "block";
    } catch (error) {
        console.error("Error processing IDML file:", error);
        alert("There was an error processing the IDML file.");
    }
}

// Function to process the IDML contents (stories, spreads, and images)
async function processIDML(zipContents) {
    let stories = [], spreads = [];

    // Loop through the zip file and extract stories and spreads
    for (let filename of Object.keys(zipContents.files)) {
        if (filename.startsWith("Stories/") && filename.endsWith(".xml")) {
            const xmlText = await zipContents.files[filename].async("text");
            stories.push(...parseStoryXML(xmlText));  // Process story XML
        } else if (filename.startsWith("Spreads/") && filename.endsWith(".xml")) {
            const xmlText = await zipContents.files[filename].async("text");
            spreads.push(...parseSpreadXML(xmlText));  // Process spread XML (images)
        }
    }
    return { stories, spreads };
}

// Parse the Story XML content (extract only Content)
function parseStoryXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    let contentArray = [];

    // Extract the text content from Content elements only (ignoring formatting)
    xmlDoc.querySelectorAll("Content").forEach(node => {
        let content = node.textContent.trim();
        if (content) {
            content = cleanContent(content);  // Clean the extracted content
            contentArray.push(content);  // Push to the result array
        }
    });

    return contentArray;
}

// Parse the Spread XML content (extract image links)
function parseSpreadXML(xmlText) {
    let imagePatterns = [];
    const imageLinks = xmlText.match(/LinkResourceURI="([^"]*)"/g);

    if (imageLinks) {
        imageLinks.forEach(link => {
            const path = link.replace('LinkResourceURI="', "").replace('"', "");
            imagePatterns.push(`<p class="img">${path}</p>`);  // Create HTML img tag with path
        });
    }
    return imagePatterns;
}

// Clean up content from unnecessary tags and spaces (we keep the content, remove metadata)
function cleanContent(content) {
    const cleanPatterns = [
        { regex: /<Content>/g, replacement: "" },
        { regex: /<\/Content>/g, replacement: "" },
        { regex: /<ParagraphStyleRange\s+[^>]*>/g, replacement: "" },  // Remove paragraph styles
        { regex: /<\/ParagraphStyleRange>/g, replacement: "" },     // Remove paragraph styles
        { regex: /AppliedParagraphStyle="[^"]*"/g, replacement: "" },  // Remove style attributes
        { regex: /\xE2\x80\xA8/g, replacement: "" },  // Clean non-breaking spaces
        { regex: /\s+/g, replacement: " " }  // Replace multiple spaces with a single space
    ];

    cleanPatterns.forEach(pattern => {
        content = content.replace(pattern.regex, pattern.replacement);
    });

    return content.trim();  // Return cleaned content
}

// Display the extracted data (stories and image links)
function displayData({ stories, spreads }) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    let content = "";

    if (stories.length) {
        content += "<h2>Stories</h2>";
        stories.forEach(story => content += `<p>${story}</p>`);  // Display each extracted content in paragraphs
    }

    if (spreads.length) {
        content += "<h2>Images</h2>";
        spreads.forEach(img => content += img);  // Display image links as <p> elements
    }

    output.innerHTML = content;
}

// Trigger HTML download
function downloadHTML() {
    const output = document.getElementById("output").innerHTML;
    const blob = new Blob(["<html><body>" + output + "</body></html>"], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "output.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Check if the uploaded file is a valid IDML file
function isValidIDML(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return fileExtension === 'idml';  // Validate that the file is an IDML
}

