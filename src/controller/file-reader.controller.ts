import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

// Interfaces
export interface FileReaderProps {
  dirName?: string;
  dirPath: string;
  ignoreDirs?: string[];
}

export interface File {
  name: string;
  type: "file" | "folder";
  size: number | null;
  path: string;
  ext?: string;
  children?: File[];
}

// Read Directories
export const fileReader = (props: FileReaderProps[]) => {
  return async (req: Request, res: Response) => {
    const filePath = req.query.path as string;

    // Read the file
    if (filePath) {
      // Read File Content
      const fileContent = await readFile(filePath);

      // If the file is not found then return 404
      if (!fileContent) {
        return res.status(404).json({
          error: "File not found",
        });
      }

      // Highlight the file content
      return res.status(200).json({
        content: fileContent,
        fileName: path.basename(filePath),
        path: filePath,
      });
    }

    // Read the directories
    const directories = await Promise.all(props.map(readDirectory));

    // Return the directories
    return res.status(200).json(
      props.reduce(
        (acc, prop, idx) => ({
          ...acc,
          [prop.dirName || idx]: directories[idx],
        }),
        {}
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

    for (let file of files) {
      // If the file is in the ignore list then skip
      if (ignoreDirs?.includes(file.name)) continue;

      // Get the entry path
      const entryPath = path.join(dirPath, file.name);

      // If the file is a directory then check for children
      if (file.isDirectory()) {
        result.push({
          type: "folder",
          name: file.name,
          size: null,
          path: entryPath,
          children: await readDirectory({ dirPath: entryPath, ignoreDirs }),
        });
      } else {
        // If the file is a file then get the size
        const { size } = await fs.stat(entryPath);

        result.push({
          type: "file",
          name: file.name,
          size,
          ext: path.extname(file.name),
          path: entryPath,
        });
      }
    }

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
    return await fs.readFile(filePath, { encoding: "utf-8" });
  } catch (error) {
    console.log(error);
    return null;
  }
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
