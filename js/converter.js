document.getElementById("upload").addEventListener("change", handleFile);
document.getElementById("download").addEventListener("click", downloadHTML);
document.getElementById("downloadDocx").addEventListener("click", downloadDOCX);

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
        document.getElementById("downloadDocx").style.display = "block";
    } catch (error) {
        console.error("Error processing IDML file:", error);
        alert("There was an error processing the IDML file.");
    }
}

async function processIDML(zipContents) {
    let stories = [], spreads = [];
    for (let filename of Object.keys(zipContents.files)) {
        if (filename.startsWith("Stories/") && filename.endsWith(".xml")) {
            const xmlText = await zipContents.files[filename].async("text");
            stories.push(...parseStoryXML(xmlText));
        } else if (filename.startsWith("Spreads/") && filename.endsWith(".xml")) {
            const xmlText = await zipContents.files[filename].async("text");
            spreads.push(...parseSpreadXML(xmlText));
        }
    }
    return { stories, spreads };
}

function parseStoryXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    let contentArray = [];
    xmlDoc.querySelectorAll("Content").forEach(node => {
        let content = node.textContent.trim();
        if (content) {
            content = cleanContent(content);
            contentArray.push(content);
        }
    });
    return contentArray;
}

function parseSpreadXML(xmlText) {
    let imagePatterns = [];
    const imageLinks = xmlText.match(/LinkResourceURI="([^"]*)"/g);
    if (imageLinks) {
        imageLinks.forEach(link => {
            const path = link.replace('LinkResourceURI="', "").replace('"', "");
            imagePatterns.push(`<p class="img">${path}</p>`);
        });
    }
    return imagePatterns;
}

function cleanContent(content) {
    const cleanPatterns = [
        { regex: /<Content>/g, replacement: "" },
        { regex: /<\/Content>/g, replacement: "" },
        { regex: /<ParagraphStyleRange\s+[^>]*>/g, replacement: "" },
        { regex: /<\/ParagraphStyleRange>/g, replacement: "" },
        { regex: /AppliedParagraphStyle="[^"]*"/g, replacement: "" },
        { regex: /\xE2\x80\xA8/g, replacement: "" },
        { regex: /\s+/g, replacement: " " },
        { regex: /\n+,/g, replacement: "," }  // Remove newline before commas
    ];
    cleanPatterns.forEach(pattern => {
        content = content.replace(pattern.regex, pattern.replacement);
    });
    return content.trim();
}

function displayData({ stories, spreads }) {
    const output = document.getElementById("output");
    output.innerHTML = "";
    let content = "";
    if (stories.length) {
        content += "<h2>Stories</h2>";
        stories.forEach(story => content += `<p>${story}</p>`);
    }
    if (spreads.length) {
        content += "<h2>Images</h2>";
        spreads.forEach(img => content += img);
    }
    output.innerHTML = content;
}

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

function downloadDOCX() {
    const output = document.getElementById("output").innerText;
    const doc = new docx.Document({
        sections: [
            {
                properties: {},
                children: output.split('\n').map(text => new docx.Paragraph({
                    children: [new docx.TextRun(text)]
                }))
            }
        ]
    });

    docx.Packer.toBlob(doc).then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "output.docx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function isValidIDML(file) {
    return file.name.split('.').pop().toLowerCase() === 'idml';
}

