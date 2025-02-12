#!/bin/bash

# WHAT IS THIS?
# This script removes all whitespace from file and dir names
# It searches for idml files and unzips them
# It prepares list of idml files
# The list will be read by main py script that processes idml files

# Define the directory variable
directory="./input_dir"

# Function to rename directories and files to remove whitespace
rename_whitespace() {
    # Rename directories recursively
    find "$1" -depth -type d -name "* *" -execdir bash -c 'mv "$1" "${1// /_}"' _ {} \;

    # Rename files recursively
    find "$1" -depth -type f -name "* *" -execdir bash -c 'mv "$1" "${1// /_}"' _ {} \;
}

# Function to unzip .idml files in the same directory
unzip_idml() {
    # Find .idml files recursively, excluding hidden files
    find "$1" -type f -name "*.idml" ! -path '*/\.*' -exec sh -c '
        idml_file="$1"
        # Unzip the .idml file in the same directory
        unzip -o "$idml_file" -d "${idml_file}_FILES"
    ' sh {} \;
}

# Call functions
rename_whitespace "$directory"

echo "Status: Directory renaming COMPLETED..."

unzip_idml "$directory"

echo "Status: Unzipping COMPLETED..."

# Check if the directory variable is set
if [ -z "$directory" ]; then
    echo "Error: DIRECTORY variable is not set"
    exit 1
fi

# Check if the directory exists
if [ ! -d "$directory" ]; then
    echo "Error: Directory $dir does not exist"
    exit 1
fi

# Search recursively for .idml files and write their absolute paths to a file
find "$directory" -type f -name "*.idml" -print | sed '/\._/d' | sort -u > idml_files_list.txt

echo "List of .idml files with absolute paths written"

