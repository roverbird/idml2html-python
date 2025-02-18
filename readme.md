# IDML to HTML Convertion Tools

Managing a large archive of **InDesign** files created for print and transitioning them into a web format is a significant challenge for publishers, media organizations, and content managers. Traditional workflows are often built for print production, without online publication in mind, making systematic extraction of text and images for internet use a time-consuming and a complex task.

The good news? This process can be automated. Managing a large archive of **InDesign** files and converting them to a web-friendly format can be challenging, especially with workflows designed for print. Extracting text and images for online use can be time-consuming without the right tools.

My IDML conversion script automates this process, ensuring a structured and consistent extraction workflow. While the script is customizable, I strongly recommend writing us for assistance, as every publishing workflow is unique. A tailored solution can help avoid inefficiencies and errors that can arise from manual extraction.

With experience in IDML, PDF, DOCX, and other formats, I don’t just offer batch processing scripts—I assess your workflow and provide a solution that enhances efficiency and reduces content management costs. I will analyze your entire process to create a cost-efficient system that integrates offline media with digital publishing needs, help make your archive searchable, organized, and future-proof.

If you need guidance on adapting these scripts or want to explore a customized, automated workflow, feel free to reach out. Let’s work together to optimize _your_ unique content management strategy! Almost every organization and media outlet has room for improvement in digitalization of content. Legacy formats, unsearchable archives, zoos of weakly compatible systems are common woes, but fear not, you are not alone. 

📧 [Contact today](mailto:a.sotov@yahoo.co.uk)

For an online demo, try <a href="https://textvisualization.app/idml2html/">Free Online IDML2HTML Converter<>

# What is included into this repo?

## Javascript implementation

Standalone JS implementation (javascript idml2html converter as a client-side web app that runs in the browser) is in js folder. Demo version: https://textvisualization.app/idml2html/

## Python implementation

Python implementation is in python folder.

### unzip.sh

Before running the Python script, you need to **unzip the IDML files**, and unzip.sh shell script helps with that process. It prepares IDML files for conversion:

1. **Removes Whitespaces from File and Directory Names**  
   - It renames all directories and files in the specified directory (`/input_dir`), replacing spaces with underscores.
   - This avoids issues with scripts and commands that don’t handle spaces well.

2. **Finds and Unzips `.idml` Files**  
   - It searches for `.idml` files in the directory.
   - Each `.idml` file is **unzipped into a separate folder** named `<idml_file_name>_FILES/`.  
   - This is important because IDML files are actually **ZIP archives** containing structured XML data.

3. **Creates a List of `.idml` Files**  
   - After unzipping, it generates a file (`idml_files_list.txt`) that contains the absolute paths of all `.idml` files in the directory.
   - This list can then be **used by the Python script** to process the IDML files one by one.

### **Why is This Necessary?**
- **IDML files are compressed ZIP archives.**  
  - To access the actual XML content, you must first unzip them.
- **The Python script assumes the IDML file contents are already extracted.**  
  - It looks for files in the `<idml_file_name>_FILES/` directory.
- **Ensures a clean and structured workflow.**  
  - Removing spaces from filenames avoids errors in command-line operations.
  - Sorting the `.idml` files list ensures consistency in processing.

### **Next Steps**
1. Run this shell script:  
   ```sh
   bash unzip_idml.sh
   ```
2. Run the Python script to process the unzipped IDML files:  
   ```sh
   python idml2txt.py /path/to/idml_file
   ```

### idml2html.py
This python script is part of a workflow for converting IDML (InDesign Markup Language) files into HTML. It is specifically designed as a utility for a publishing house, helping to extract structured content and images from IDML files.

## What is an IDML File?
IDML (InDesign Markup Language) is an XML-based format used by Adobe InDesign to represent documents. It allows for interoperability between different versions of InDesign and third-party applications by providing structured data about text, styles, spreads, and linked resources.

## How It Works
This script processes an IDML file by:
1. Extracting and ordering text content from stories.
2. Identifying and listing image resources from spreads.
3. Converting the structured content into an HTML-friendly format.

## Usage
Run the script using the following command:

```sh
python parse.py <idml_file_path>
```

## Dependencies
- `simple_idml`
- Python 3.x

## Key Functions
- `parse_story_xml()`: Extracts text content from story XML files.
- `parse_spread_xml()`: Extracts image resource paths from spread XML files.
- `get_ordered_stories()`: Retrieves and orders stories from the IDML package.
- `get_ordered_spreads()`: Retrieves image patterns from spreads.

## Notes

One of the biggest challenges in converting IDML to another format like HTML is preserving the meaningful reading order of the text. InDesign documents store text in separate "stories," and their order in the document layout isn't always straightforward. Unlike a simple left-to-right, top-to-bottom structure, the text in an IDML file is split into different frames, which can be linked in various ways. The script attempts to maintain the correct reading order by:

- Extracting text from IDML stories using get_ordered_stories(my_idml_package), which retrieves text from the stories directory.
- Processing stories in sequence based on how they appear in the IDML structure.
- Outputting the text in a structured way, preserving <ParagraphStyleRange> and <Content> tags to maintain formatting.
- The script assumes that the order of stories in idml_package.stories is correct. However, InDesign might store them in a different sequence than their visual layout.
- If text is split across multiple frames in complex layouts, the script may not fully reconstruct the original reading flow unless the IDML structure explicitly supports that.


# What Happens to Images in InDesign files?
When an **IDML file is unzipped**, all its internal files—including **text, styles, spreads, and images**—are extracted into a directory named `<idml_file_name>_FILES/`.  

1. **Images are stored inside the unzipped directory**  
   - When an IDML file is unzipped, linked images **aren't always embedded** in the IDML itself.  
   - Instead, IDML typically stores **references (file paths or URLs) to external images** rather than the actual image files.
   - However, **if the images are embedded**, they will be unzipped into the appropriate subdirectory within `<idml_file_name>_FILES/`.

2. **Extracting Image Paths with the Python Script**  
   - The Python script **searches for image paths** in `Spread` XML files using `parse_spread_xml()`, which extracts `LinkResourceURI` attributes.
   - These extracted paths point to **where the images should be**, either inside the unzipped directory or in an external location.

3. **Are the Images Available After Unzipping?**
   - If the images are embedded in the IDML, they will be inside the unzipped directory.
   - If the images are externally linked, only the **references (file paths or URLs) are stored**, and you would need to fetch those images separately.

### **Where Are Images Usually Found?**
Inside `<idml_file_name>_FILES/`, images can be in:
- `Resources/` or `Links/` (if the IDML file includes them)
- Other subdirectories based on how the InDesign document was structured

### **Next Steps If Images Are Missing**
- If the script extracts image paths but **the actual image files are missing**, you may need to:
  1. **Check if the images were externally linked** in the InDesign document.
  2. **Download the missing images** from their original locations based on extracted `LinkResourceURI` values.
  3. **Ensure that designers embed images** before exporting IDML from InDesign.

