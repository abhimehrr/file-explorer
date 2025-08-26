import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import { Request, Response } from "express";

// Interfaces
export interface FileReaderProps {
  dirName?: string;
  dirPath: string;
  ignoreDirs?: string[];
}

export interface File {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  path: string;
  ext?: string;
  children?: File[];
}

export interface FileContent {
  name: string;
  size: number;
  ext: string;
  content: string;
  path: string;
}

// Read Directories
export const fileReader = (props: FileReaderProps[]) => {
  return async (req: Request, res: Response) => {
    const { file_path, content_type } = req.query as {
      file_path?: string;
      content_type?: "html" | "text";
    };

    // Read the file
    if (file_path) {
      // Decode the file path
      const decodedFilePath = decodeURIComponent(file_path || "");

      // Read File Content
      const fileContent = await readFile(decodedFilePath);

      // If the file is not found then return 404
      if (!fileContent) {
        return res.status(404).send({
          error: "File not found",
        });
      }

      // Highlight the file content
      return res.status(200).send({
        name: path.basename(file_path),
        size: fileContent.length,
        ext: path.extname(file_path),
        content:
          content_type === "html" ? escapeHtml(fileContent) : fileContent,
        path: file_path,
      } as FileContent);
    }

    // Read the directories
    const directories = await Promise.all(props.map(readDirectory));

    // Return the directories
    return res.status(200).send(
      props.map(
        (prop, idx) =>
          ({
            id: randomString(),
            name: prop.dirName,
            type: "folder",
            path: prop.dirPath,
            children: directories[idx],
          } as File)
      )
    );
  };
};

/**
 * @param dirPath - The path to the directory to read
 * @returns - The files in the directory recursively
 */
const readDirectory = async ({ dirPath, ignoreDirs }: FileReaderProps) => {
  try {
    // Read the directory
    const files = await fs.readdir(dirPath, {
      withFileTypes: true,
      encoding: "utf-8",
    });

    // Map the files
    const result: File[] = [];

    for (const file of files) {
      // If the file is in the ignore list then skip
      if (ignoreDirs?.includes(file.name)) continue;

      // Get the entry path
      const entryPath = path.join(dirPath, file.name);

      // If the file is a directory then check for children
      if (file.isDirectory()) {
        result.push({
          id: randomString(),
          type: "folder",
          name: file.name,
          path: entryPath,
          children: await readDirectory({ dirPath: entryPath, ignoreDirs }),
        });
      } else {
        // If the file is a file then get the size
        const { size } = await fs.stat(entryPath);

        result.push({
          id: randomString(),
          type: "file",
          name: file.name,
          size,
          ext: path.extname(file.name),
          path: entryPath,
        });
      }
    }

    // Sort folders first, then files — both A-Z by name
    result.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    });

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

/**
 * @param filePath - The path to the file to read
 * @returns - The file content
 */
export const readFile = async (filePath: string) => {
  try {
    const buffer = await fs.readFile(filePath);

    // Check for BOM
    if (buffer[0] === 0xff && buffer[1] === 0xfe) {
      // UTF-16 LE BOM
      return buffer.toString("utf16le");
    }

    return buffer.toString("utf-8");
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Alphanumeric charset
const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CHARSET_LENGTH = CHARSET.length;

/**
 * Generate a secure random numeric string of any length.
 * @param size Number of digits to generate (no limit, but large sizes may be slow).
 * @returns Random numeric string.
 */
export const randomNumber = (size: number = 6): string => {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("Size must be a positive integer.");
  }

  const digits = [];
  const batchSize = 1024; // generate 1024 random bytes per batch for efficiency

  while (digits.length < size) {
    const bytes = randomBytes(batchSize);
    for (let i = 0; i < bytes.length && digits.length < size; i++) {
      // Convert each byte (0-255) into a digit (0-9)
      // bytes[i] % 10 gives a fair distribution
      digits.push((bytes[i] % 10).toString());
    }
  }

  return digits.join("");
};

/**
 * Generate a secure random alphanumeric string of any length.
 * @param length Number of characters to generate (no hard limit).
 * @returns Random alphanumeric string.
 */
export const randomString = (length: number = 32): string => {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Length must be a positive integer.");
  }

  const result: string[] = [];
  const bytes = randomBytes(length);

  for (let i = 0; i < length; i++) {
    // Map each byte (0-255) to the charset using modulo
    const index = bytes[i] % CHARSET_LENGTH;
    result.push(CHARSET[index]);
  }

  return result.join("");
};

// Escape HTML
function escapeHtml(text: string): string {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m as keyof typeof map];
  });
}
