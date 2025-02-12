from simple_idml import idml
import os
import re
import sys

# This is python script to convert IDML files to HTML

# Check if the IDML file path is provided as a command-line argument
if len(sys.argv) != 2:
    print("Usage: python parse.py <idml_file_path>")
    sys.exit(1)

idml_file_path = sys.argv[1]

idml_files_directory = f"{idml_file_path}_FILES/"

def parse_story_xml(story_xml_path):
    with open(story_xml_path, 'r', encoding='utf-8') as file:
        xml_lines = file.readlines()

    pattern_content_pairs = []

    for line in xml_lines:
        # Remove leading whitespace or tabs
        line = line.lstrip()
        # Check if the line starts with <ParagraphStyleRange or <Content
        if line.startswith("<ParagraphStyleRange") or line.startswith("<Content") or line.startswith("</ParagraphStyleRange>"):
            pattern_content_pairs.append(line.strip())

    return pattern_content_pairs

def parse_spread_xml(spread_xml_path):
    with open(spread_xml_path, 'r', encoding='utf-8') as file:
        xml_content = file.read()

    image_patterns = re.findall(r'LinkResourceURI="([^"]*)"', xml_content)
    return image_patterns

def get_ordered_stories(idml_package):
    ordered_stories = []
    for story_path in idml_package.stories:
        full_story_path = os.path.join(idml_files_directory, story_path)
        pattern_content_pairs = parse_story_xml(full_story_path)
        ordered_stories.extend(pattern_content_pairs)
    return ordered_stories

def get_ordered_spreads(idml_package):
    ordered_spreads = []
    for spread_path in idml_package.spreads:
        full_spread_path = os.path.join(idml_files_directory, spread_path)
        image_patterns = parse_spread_xml(full_spread_path)
        ordered_spreads.append(image_patterns)
    return ordered_spreads

# This points to idml file
my_idml_package = idml.IDMLPackage(idml_file_path)

# This lists spreads and their image patterns
ordered_spreads = get_ordered_spreads(my_idml_package)
for i, spread_image_patterns in enumerate(ordered_spreads, start=1):
    #print(f"Spread {i} Image Patterns:")
    for j, pattern in enumerate(spread_image_patterns, start=1):
        print(f"<p class=\"zimg\">{pattern}</p>")
    print()

# This lists stories in correct order
ordered_stories = get_ordered_stories(my_idml_package)
for i, pattern_content in enumerate(ordered_stories, start=1):
    #print(f"Story {i}:")
    print(f"{pattern_content}")
    #print()

