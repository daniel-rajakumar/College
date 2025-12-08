import os
import sys

def clear_screen():
    # Clear the terminal in a cross-platform way
    if os.name == "nt":  # Windows
        os.system("cls")
    else:  # macOS, Linux, etc.
        os.system("clear")

def is_text_file(filepath, encoding="utf-8"):
    """
    Try to read a small chunk to see if it's a text file.
    """
    try:
        with open(filepath, "r", encoding=encoding) as f:
            f.read(2048)
        return True
    except (UnicodeDecodeError, IsADirectoryError, PermissionError):
        return False

def collect_all_files_content(root_folder):
    """
    Recursively collect the content of all text files under root_folder
    into one big nicely formatted string.
    """
    output_chunks = []

    for dirpath, dirnames, filenames in os.walk(root_folder):
        for filename in filenames:
            full_path = os.path.join(dirpath, filename)

            if not is_text_file(full_path):
                continue

            header = "\n" + "=" * 80 + "\n"
            header += f"FILE: {full_path}\n"
            header += "=" * 80 + "\n\n"

            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                content = f"[Error reading {full_path}: {e}]"

            output_chunks.append(header + content + "\n")

    return "".join(output_chunks)

if __name__ == "__main__":
    # Folder path from argument or default to current directory
    folder_path = sys.argv[1] if len(sys.argv) > 1 else "."

    all_content = collect_all_files_content(folder_path)

    clear_screen()
    print(all_content)
